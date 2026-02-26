use pulldown_cmark::{Event, Parser, Tag, TagEnd, HeadingLevel};

#[tauri::command]
pub fn markdown_to_html(markdown: String) -> Result<String, String> {
    let parser = Parser::new(&markdown);
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, parser);
    Ok(html)
}

#[tauri::command]
pub async fn export_txt(markdown: String, path: String) -> Result<(), String> {
    let parser = Parser::new(&markdown);
    let mut text = String::new();
    for event in parser {
        match event {
            Event::Text(t) => text.push_str(&t),
            Event::Code(c) => text.push_str(&c),
            Event::SoftBreak | Event::HardBreak => text.push('\n'),
            Event::End(TagEnd::Paragraph) | Event::End(TagEnd::Heading(_)) => {
                text.push_str("\n\n");
            }
            Event::End(TagEnd::Item) => text.push('\n'),
            _ => {}
        }
    }
    tokio::fs::write(&path, text.trim())
        .await
        .map_err(|e| format!("Failed to export txt: {}", e))
}

#[tauri::command]
pub async fn export_docx(markdown: String, path: String) -> Result<(), String> {
    use docx_rs::*;

    let parser = Parser::new(&markdown);
    let mut docx = Docx::new();

    let mut current_paragraph = Paragraph::new();
    let mut in_bold = false;
    let mut in_italic = false;
    let mut in_heading: Option<HeadingLevel> = None;

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                in_heading = Some(level);
                current_paragraph = Paragraph::new();
            }
            Event::End(TagEnd::Heading(_)) => {
                if let Some(level) = in_heading.take() {
                    let size = match level {
                        HeadingLevel::H1 => 32,
                        HeadingLevel::H2 => 26,
                        HeadingLevel::H3 => 22,
                        _ => 18,
                    };
                    current_paragraph = current_paragraph.size(size * 2);
                }
                docx = docx.add_paragraph(current_paragraph);
                current_paragraph = Paragraph::new();
            }
            Event::Start(Tag::Paragraph) => {
                current_paragraph = Paragraph::new();
            }
            Event::End(TagEnd::Paragraph) => {
                docx = docx.add_paragraph(current_paragraph);
                current_paragraph = Paragraph::new();
            }
            Event::Start(Tag::Strong) => { in_bold = true; }
            Event::End(TagEnd::Strong) => { in_bold = false; }
            Event::Start(Tag::Emphasis) => { in_italic = true; }
            Event::End(TagEnd::Emphasis) => { in_italic = false; }
            Event::Start(Tag::Item) => {
                current_paragraph = Paragraph::new();
                let bullet_run = Run::new().add_text("• ");
                current_paragraph = current_paragraph.add_run(bullet_run);
            }
            Event::End(TagEnd::Item) => {
                docx = docx.add_paragraph(current_paragraph);
                current_paragraph = Paragraph::new();
            }
            Event::Start(Tag::BlockQuote(_)) => {}
            Event::End(TagEnd::BlockQuote(_)) => {}
            Event::Text(text) => {
                let mut run = Run::new().add_text(&*text);
                if in_bold || in_heading.is_some() {
                    run = run.bold();
                }
                if in_italic {
                    run = run.italic();
                }
                current_paragraph = current_paragraph.add_run(run);
            }
            Event::Code(code) => {
                let run = Run::new()
                    .add_text(&*code)
                    .fonts(RunFonts::new().ascii("Courier New"));
                current_paragraph = current_paragraph.add_run(run);
            }
            Event::SoftBreak => {
                let run = Run::new().add_text(" ");
                current_paragraph = current_paragraph.add_run(run);
            }
            _ => {}
        }
    }

    let mut buf = std::io::Cursor::new(Vec::new());
    docx.build().pack(&mut buf)
        .map_err(|e| format!("Failed to build docx: {}", e))?;

    tokio::fs::write(&path, buf.into_inner())
        .await
        .map_err(|e| format!("Failed to write docx: {}", e))
}

#[tauri::command]
pub async fn export_pdf(markdown: String, path: String) -> Result<(), String> {
    use genpdf::elements;
    use genpdf::fonts;
    use genpdf::style;
    use genpdf::Element as _;

    // Try to find a usable font
    let font_family = fonts::from_files("/System/Library/Fonts/Supplemental/", "Arial", None)
        .or_else(|_| fonts::from_files("/usr/share/fonts/truetype/liberation/", "LiberationSans", None))
        .or_else(|_| fonts::from_files("/usr/share/fonts/truetype/dejavu/", "DejaVuSans", None))
        .map_err(|e| format!("No suitable font found for PDF export: {}. Install Arial or Liberation fonts.", e))?;

    let mut doc = genpdf::Document::new(font_family);
    doc.set_title("ZNOTE Export");
    doc.set_minimal_conformance();

    let mut decorator = genpdf::SimplePageDecorator::new();
    decorator.set_margins(36);
    doc.set_page_decorator(decorator);

    let parser = Parser::new(&markdown);
    let mut current_text = String::new();
    let mut in_heading: Option<HeadingLevel> = None;

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                in_heading = Some(level);
                current_text.clear();
            }
            Event::End(TagEnd::Heading(_)) => {
                if let Some(level) = in_heading.take() {
                    let size = match level {
                        HeadingLevel::H1 => 20,
                        HeadingLevel::H2 => 16,
                        HeadingLevel::H3 => 14,
                        _ => 12,
                    };
                    let para = elements::Paragraph::new(&current_text)
                        .styled(style::Style::new().bold().with_font_size(size));
                    doc.push(para);
                    doc.push(elements::Break::new(0.5));
                }
                current_text.clear();
            }
            Event::Start(Tag::Paragraph) => {
                current_text.clear();
            }
            Event::End(TagEnd::Paragraph) => {
                if !current_text.is_empty() {
                    let para = elements::Paragraph::new(&current_text);
                    doc.push(para);
                    doc.push(elements::Break::new(0.3));
                }
                current_text.clear();
            }
            Event::Text(text) => {
                current_text.push_str(&text);
            }
            Event::Code(code) => {
                current_text.push_str(&code);
            }
            Event::SoftBreak => {
                current_text.push(' ');
            }
            Event::HardBreak => {
                current_text.push('\n');
            }
            _ => {}
        }
    }

    doc.render_to_file(&path)
        .map_err(|e| format!("Failed to render PDF: {}", e))
}
