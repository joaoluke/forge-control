use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub version: String,
    pub hostname: String,
    pub internal_ip: String,
    pub external_ip: String,
    pub total_memory: u64,
    pub used_memory: u64,
    pub memory_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory: u64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    pub total_processes: usize,
    pub total_cpu_usage: f32,
    pub total_memory: u64,
    pub used_memory: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub pid: u32,
    pub process_name: String,
    pub protocol: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewsItem {
    pub title: String,
    pub title_pt: String,
    pub link: String,
    pub description: String,
    pub description_pt: String,
    pub pub_date: String,
    pub source: String,
    pub category: String,
}
