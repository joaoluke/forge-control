import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SystemInfo {
  os: string;
  version: string;
  hostname: string;
}

export function Dashboard() {
  const { t } = useTranslation();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    async function loadSystemInfo() {
      try {
        const info = await invoke<SystemInfo>('get_system_info');
        setSystemInfo(info);
      } catch (error) {
        console.error('Failed to load system info:', error);
      }
    }
    loadSystemInfo();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-slate-400 text-lg">{t('dashboard.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('system.os')}</h3>
              <p className="text-slate-400 text-sm">
                {systemInfo?.os || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🖥️</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('system.hostname')}</h3>
              <p className="text-slate-400 text-sm">
                {systemInfo?.hostname || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('system.version')}</h3>
              <p className="text-slate-400 text-sm">
                {systemInfo?.version || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>📈</span> {t('dashboard.systemOverview')}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">CPU</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-white text-sm font-mono">45%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Memory</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-white text-sm font-mono">62%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Disk</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-white text-sm font-mono">78%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-300 rounded-lg p-4 transition-all duration-200 flex flex-col items-center gap-2">
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-medium">Scan Projects</span>
            </button>
            <button className="bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 text-green-300 rounded-lg p-4 transition-all duration-200 flex flex-col items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium">View Processes</span>
            </button>
            <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 text-purple-300 rounded-lg p-4 transition-all duration-200 flex flex-col items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span className="text-sm font-medium">Network Info</span>
            </button>
            <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 text-orange-300 rounded-lg p-4 transition-all duration-200 flex flex-col items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
