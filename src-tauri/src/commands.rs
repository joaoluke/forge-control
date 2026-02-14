use sysinfo::{System, ProcessesToUpdate};
use std::process::Command;
use local_ip_address::local_ip;
use rss::Channel;
use crate::models::{SystemInfo, ProcessInfo, SystemStats, PortInfo, NewsItem};
use crate::utils::translate_text;

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
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
pub fn get_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
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
pub fn get_system_stats() -> Result<SystemStats, String> {
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
pub fn kill_process(pid: u32) -> Result<bool, String> {
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
pub fn get_port_processes() -> Result<Vec<PortInfo>, String> {
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

#[tauri::command]
pub fn fetch_news() -> Result<Vec<NewsItem>, String> {
    let feeds = vec![
        // General Tech
        ("The Register", "https://www.theregister.com/headlines.atom", "Technology"),
        ("TechCrunch", "https://techcrunch.com/feed/", "Technology"),
        ("Ars Technica", "https://arstechnica.com/feed/", "Technology"),
        ("Wired", "https://www.wired.com/feed/category/science/latest/rss", "Technology"),
        ("The Verge", "https://www.theverge.com/rss/index.xml", "Technology"),
        
        // Programming
        ("Hacker News", "https://news.ycombinator.com/rss", "Programming"),
        ("Lobsters", "https://lobste.rs/rss", "Programming"),
        ("Dev.to", "https://dev.to/feed", "Programming"),

        // Hacking / InfoSec
        ("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "Hacking"),
        ("BleepingComputer", "https://www.bleepingcomputer.com/feed/", "Hacking"),
        ("Krebs on Security", "https://krebsonsecurity.com/feed/", "Hacking"),

        // AI
        ("MIT News - AI", "https://news.mit.edu/rss/topic/artificial-intelligence2", "AI"),
        ("OpenAI Blog", "https://openai.com/blog/rss.xml", "AI"),
        ("Google AI Blog", "http://feeds.feedburner.com/blogspot/gJZg", "AI"),

        // Academic / Research
        ("Nature", "http://feeds.nature.com/nature/rss/current", "Academic"),
        ("ScienceDaily", "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml", "Academic"),
    ];

    let mut news_items = Vec::new();

    for (source, url, category) in feeds {
        match reqwest::blocking::get(url) {
            Ok(response) => {
                if let Ok(content) = response.bytes() {
                    if let Ok(channel) = Channel::read_from(&content[..]) {
                        for item in channel.items().iter().take(5) {
                            let title = item.title().unwrap_or("No Title").to_string();
                            let link = item.link().unwrap_or("").to_string();
                            let description = item.description().unwrap_or("").to_string();
                            let pub_date = item.pub_date().unwrap_or("").to_string();

                            // Perform translation - skipping for now to speed up or we can limit characters
                            // For simplicity, we keep translating titles but maybe limit descriptions
                            let title_pt = translate_text(&title);
                            let description_pt = if !description.is_empty() {
                                // Simple optimization: only translate short descriptions or truncate
                                let desc_preview = description.chars().take(300).collect::<String>();
                                translate_text(&desc_preview)
                            } else {
                                "".to_string()
                            };
                            
                            news_items.push(NewsItem {
                                title,
                                title_pt,
                                link,
                                description,
                                description_pt,
                                pub_date,
                                source: source.to_string(),
                                category: category.to_string(),
                            });
                        }
                    }
                }
            }
            Err(_) => continue,
        }
    }

    Ok(news_items)
}

#[tauri::command]
pub fn fetch_article_content(url: String, translate: bool) -> Result<String, String> {
    // Readability requires a valid HTML string and a base URL
    let response = reqwest::blocking::get(&url)
        .map_err(|e| format!("Failed to fetch URL: {}", e))?
        .text()
        .map_err(|e| format!("Failed to read text: {}", e))?;

    let mut cursor = std::io::Cursor::new(response);
    
    // Parse using readability
    let product = readability::extractor::extract(&mut cursor, &reqwest::Url::parse(&url).unwrap())
        .map_err(|e| format!("Failed to extract content: {}", e))?;

    if translate {
        // For translation, we use the plain text version to avoid breaking HTML structure
        // and to reduce the token count/complexity for the free translation API.
        let text = product.text;
        let paragraphs: Vec<&str> = text.split('\n').collect();
        let mut translated_html = String::new();

        for paragraph in paragraphs {
            let trimmed = paragraph.trim();
            if !trimmed.is_empty() {
                let translated = translate_text(trimmed);
                translated_html.push_str(&format!("<p>{}</p>", translated));
            }
        }
        
        Ok(translated_html)
    } else {
        Ok(product.content)
    }
}

