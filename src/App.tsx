import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface SystemInfo {
  os: string;
  version: string;
  hostname: string;
}

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getSystemInfo() {
    setLoading(true);
    setError(null);
    try {
      const info = await invoke<SystemInfo>("get_system_info");
      setSystemInfo(info);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              ⚡ Forge Control
            </h1>
            <p className="text-xl text-slate-300">
              Gerenciador de ambiente de desenvolvimento
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  🧪 Teste de Comunicação
                </h2>
                <p className="text-slate-300 mb-6">
                  Clique no botão para testar a comunicação entre o frontend
                  React e o backend Rust.
                </p>
              </div>

              <button
                onClick={getSystemInfo}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? "Carregando..." : "🔍 Obter Informações do Sistema"}
              </button>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 font-medium">❌ Erro: {error}</p>
                </div>
              )}

              {systemInfo && (
                <div className="bg-slate-700/50 rounded-lg p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    ✅ Informações do Sistema
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-600">
                      <span className="text-slate-400 font-medium">
                        Sistema Operacional:
                      </span>
                      <span className="text-white font-mono">
                        {systemInfo.os}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-600">
                      <span className="text-slate-400 font-medium">
                        Versão:
                      </span>
                      <span className="text-white font-mono">
                        {systemInfo.version}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 font-medium">
                        Hostname:
                      </span>
                      <span className="text-white font-mono">
                        {systemInfo.hostname}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              FASE 0 — Fundação ✨ | Tauri + React + TypeScript
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
