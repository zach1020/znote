#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    tokio::fs::write(&path, &content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    tokio::fs::write(&path, "")
        .await
        .map_err(|e| format!("Failed to create file: {}", e))
}
