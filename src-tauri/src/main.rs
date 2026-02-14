#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod utils;
mod commands;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_processes,
            get_system_stats,
            kill_process,
            get_port_processes,
            fetch_news,
            fetch_article_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
