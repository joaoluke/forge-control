pub fn translate_text(text: &str) -> String {
    if text.is_empty() {
        return "".to_string();
    }

    let url = format!(
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q={}",
        urlencoding::encode(text)
    );

    match reqwest::blocking::get(url) {
        Ok(response) => {
            if let Ok(json) = response.json::<serde_json::Value>() {
                // The response format is [[["translated_text", "original_text", ...], ...], ...]
                if let Some(outer_arr) = json.as_array() {
                    if let Some(inner_arr) = outer_arr.get(0).and_then(|v: &serde_json::Value| v.as_array()) {
                        let mut translated = String::new();
                        for segment in inner_arr {
                            if let Some(msg) = segment.get(0).and_then(|v: &serde_json::Value| v.as_str()) {
                                translated.push_str(msg);
                            }
                        }
                        return translated;
                    }
                }
            }
            text.to_string()
        }
        Err(_) => text.to_string(),
    }
}
