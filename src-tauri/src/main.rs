#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use sysinfo::{System, Pid, ProcessesToUpdate};
use std::process::Command;
use local_ip_address::local_ip;

#[derive(Debug, Serialize, Deserialize)]
struct SystemInfo {
    os: String,
    version: String,
    hostname: String,
    internal_ip: String,
    external_ip: String,
    total_memory: u64,
    used_memory: u64,
    memory_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessInfo {
    pid: u32,
    name: String,
    cpu_usage: f32,
    memory: u64,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SystemStats {
    total_processes: usize,
    total_cpu_usage: f32,
    total_memory: u64,
    used_memory: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct PortInfo {
    port: u16,
    pid: u32,
    process_name: String,
    protocol: String,
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_memory();

    let os = System::name().unwrap_or_else(|| "Unknown".to_string());
    let version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let hostname = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    
    let internal_ip = local_ip().map(|ip| ip.to_string()).unwrap_or_else(|_| "Unknown".to_string());
    
    let external_ip = reqwest::blocking::get("https://api.ipify.org")
        .and_then(|resp| resp.text())
        .unwrap_or_else(|_| "Unknown".to_string());

    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();

    // Attempt to get memory type via dmidecode (requires root/sudo often, so might fail)
    let memory_type = Command::new("dmidecode")
        .arg("-t")
        .arg("17")
        .output()
        .map(|output| {
            let stdout = String::from_utf8_lossy(&output.stdout);
            stdout.lines()
                .find(|line| line.trim().starts_with("Type:") && !line.contains("Detail"))
                .map(|line| line.replace("Type:", "").trim().to_string())
                .unwrap_or_else(|| "Unknown".to_string())
        })
        .unwrap_or_else(|_| "Unknown".to_string());

    Ok(SystemInfo {
        os,
        version,
        hostname,
        internal_ip,
        external_ip,
        total_memory,
        used_memory,
        memory_type,
    })
}

#[tauri::command]
fn get_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Wait a bit to get accurate CPU usage
    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_processes(ProcessesToUpdate::All);

    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .map(|(pid, process)| {
            ProcessInfo {
                pid: pid.as_u32(),
                name: process.name().to_string_lossy().to_string(),
                cpu_usage: process.cpu_usage(),
                memory: process.memory(),
                status: format!("{:?}", process.status()),
            }
        })
        .collect();

    processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());

    Ok(processes)
}

#[tauri::command]
fn get_system_stats() -> Result<SystemStats, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_processes = sys.processes().len();
    let total_cpu_usage: f32 = sys.processes().values().map(|p| p.cpu_usage()).sum();
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();

    Ok(SystemStats {
        total_processes,
        total_cpu_usage,
        total_memory,
        used_memory,
    })
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<bool, String> {
    // Try SIGTERM first (graceful shutdown)
    let output = Command::new("kill")
        .arg("-15")
        .arg(pid.to_string())
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                return Ok(true);
            }
            // If SIGTERM fails, try SIGKILL (force kill)
            let kill_output = Command::new("kill")
                .arg("-9")
                .arg(pid.to_string())
                .output();
            
            match kill_output {
                Ok(kill_result) => {
                    if kill_result.status.success() {
                        Ok(true)
                    } else {
                        Err(format!("Failed to kill process: {}", 
                            String::from_utf8_lossy(&kill_result.stderr)))
                    }
                }
                Err(e) => Err(format!("Error executing kill command: {}", e))
            }
        }
        Err(e) => Err(format!("Error executing kill command: {}", e))
    }
}

#[tauri::command]
fn get_port_processes() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("lsof")
        .arg("-iTCP")
        .arg("-sTCP:LISTEN")
        .arg("-n")
        .arg("-P")
        .output();

    match output {
        Ok(result) => {
            if !result.status.success() {
                return Err("Failed to execute lsof command".to_string());
            }

            let stdout = String::from_utf8_lossy(&result.stdout);
            let mut port_infos = Vec::new();

            for line in stdout.lines().skip(1) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 9 {
                    let process_name = parts[0].to_string();
                    let pid = parts[1].parse::<u32>().unwrap_or(0);
                    let address = parts[8];

                    // Extract port from address (format: *:PORT or IP:PORT)
                    if let Some(port_str) = address.split(':').last() {
                        if let Ok(port) = port_str.parse::<u16>() {
                            // Filter for common development ports
                            if port >= 3000 && port <= 9999 {
                                port_infos.push(PortInfo {
                                    port,
                                    pid,
                                    process_name,
                                    protocol: "TCP".to_string(),
                                });
                            }
                        }
                    }
                }
            }

            port_infos.sort_by_key(|p| p.port);
            Ok(port_infos)
        }
        Err(e) => Err(format!("Error executing lsof: {}", e))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_processes,
            get_system_stats,
            kill_process,
            get_port_processes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
