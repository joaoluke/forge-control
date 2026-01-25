import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";

interface SystemInfo {
  os: string;
  version: string;
  hostname: string;
}

export function Settings() {
  const { t } = useTranslation();
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('menu.settings')}
        </h1>
        <p className="text-slate-400 text-lg">
          Configure your Forge Control settings
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              🧪 {t('test.title')}
            </h2>
            <p className="text-slate-300 mb-6">
              {t('test.description')}
            </p>
          </div>

          <button
            onClick={getSystemInfo}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {loading ? t('test.loading') : `🔍 ${t('test.button')}`}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-300 font-medium">❌ {t('test.error')}: {error}</p>
            </div>
          )}

          {systemInfo && (
            <div className="bg-slate-700/50 rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">
                ✅ {t('test.success')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-600">
                  <span className="text-slate-400 font-medium">{t('system.os')}:</span>
                  <span className="text-white font-mono">{systemInfo.os}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-600">
                  <span className="text-slate-400 font-medium">{t('system.version')}:</span>
                  <span className="text-white font-mono">{systemInfo.version}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">{t('system.hostname')}:</span>
                  <span className="text-white font-mono">{systemInfo.hostname}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
