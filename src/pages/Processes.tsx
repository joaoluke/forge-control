import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory: number;
  status: string;
}

interface SystemStats {
  total_processes: number;
  total_cpu_usage: number;
  total_memory: number;
  used_memory: number;
}

interface PortInfo {
  port: number;
  pid: number;
  process_name: string;
  protocol: string;
}

type FilterType = 'all' | 'highCpu' | 'highMemory';

export function Processes() {
  const { t } = useTranslation();
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessInfo[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPorts, setLoadingPorts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const [processData, statsData] = await Promise.all([
        invoke<ProcessInfo[]>('get_processes'),
        invoke<SystemStats>('get_system_stats'),
      ]);
      setProcesses(processData);
      setStats(statsData);
    } catch (err) {
      setError(err as string);
      console.error('Error loading processes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPorts = async () => {
    try {
      setLoadingPorts(true);
      const portData = await invoke<PortInfo[]>('get_port_processes');
      setPorts(portData);
    } catch (err) {
      console.error('Error loading ports:', err);
    } finally {
      setLoadingPorts(false);
    }
  };

  useEffect(() => {
    loadProcesses();
    loadPorts();
    const processInterval = setInterval(loadProcesses, 5000);
    const portInterval = setInterval(loadPorts, 3000);
    return () => {
      clearInterval(processInterval);
      clearInterval(portInterval);
    };
  }, []);

  useEffect(() => {
    let filtered = processes;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pid.toString().includes(searchTerm)
      );
    }

    if (filter === 'highCpu') {
      filtered = filtered.filter((p) => p.cpu_usage > 5);
    } else if (filter === 'highMemory') {
      filtered = filtered.filter((p) => p.memory > 100 * 1024 * 1024);
    }

    setFilteredProcesses(filtered);
  }, [processes, searchTerm, filter]);

  const handleKillProcess = async (pid: number, name: string) => {
    if (!confirm(t('processes.confirmKill'))) {
      return;
    }

    try {
      await invoke('kill_process', { pid });
      alert(t('processes.processKilled'));
      loadProcesses();
      loadPorts();
    } catch (err) {
      alert(`${t('processes.errorKilling')}: ${err}`);
      console.error('Error killing process:', err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('processes.title')}
        </h1>
        <p className="text-slate-400 text-lg">{t('processes.description')}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">
                  {t('processes.stats.totalProcesses')}
                </p>
                <p className="text-3xl font-bold text-white">
                  {stats.total_processes}
                </p>
              </div>
              <div className="text-4xl">⚙️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium mb-1">
                  {t('processes.stats.cpuUsage')}
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatPercentage(stats.total_cpu_usage)}
                </p>
              </div>
              <div className="text-4xl">💻</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">
                  {t('processes.stats.memoryUsage')}
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatBytes(stats.used_memory)}
                </p>
                <p className="text-xs text-green-300 mt-1">
                  / {formatBytes(stats.total_memory)}
                </p>
              </div>
              <div className="text-4xl">🧠</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🌐 {t('processes.ports.title')}
            </h2>
            <p className="text-orange-300 text-sm mt-1">
              {t('processes.ports.description')}
            </p>
          </div>
          <button
            onClick={loadPorts}
            disabled={loadingPorts}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <span>{loadingPorts ? t('processes.refreshing') : t('processes.refresh')}</span>
            {loadingPorts && <span className="animate-spin">⟳</span>}
          </button>
        </div>

        {loadingPorts && ports.length === 0 ? (
          <div className="text-center text-orange-300 py-8">
            {t('test.loading')}
          </div>
        ) : ports.length === 0 ? (
          <div className="text-center text-orange-300 py-8">
            {t('processes.ports.noPorts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ports.map((port) => (
              <div
                key={`${port.port}-${port.pid}`}
                className="bg-slate-800/50 rounded-xl border border-orange-500/30 p-4 hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-orange-400">
                        :{port.port}
                      </span>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded">
                        {port.protocol}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {port.process_name}
                    </p>
                    <p className="text-slate-400 text-xs font-mono mt-1">
                      PID: {port.pid}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleKillProcess(port.pid, port.process_name)}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  {t('processes.ports.killPort')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {t('processes.filters.all')}
              </button>
              <button
                onClick={() => setFilter('highCpu')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'highCpu'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {t('processes.filters.highCpu')}
              </button>
              <button
                onClick={() => setFilter('highMemory')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'highMemory'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {t('processes.filters.highMemory')}
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder={t('processes.filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={loadProcesses}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <span>{loading ? t('processes.refreshing') : t('processes.refresh')}</span>
                {loading && <span className="animate-spin">⟳</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 text-center text-red-400">
              {t('test.error')}: {error}
            </div>
          ) : loading && processes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {t('test.loading')}
            </div>
          ) : filteredProcesses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {t('processes.noProcesses')}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.pid')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.cpu')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.memory')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {t('processes.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredProcesses.slice(0, 100).map((process) => (
                  <tr
                    key={process.pid}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">
                      {process.pid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {process.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          process.cpu_usage > 50
                            ? 'bg-red-500/20 text-red-300'
                            : process.cpu_usage > 10
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {formatPercentage(process.cpu_usage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatBytes(process.memory)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">
                        {process.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleKillProcess(process.pid, process.name)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        {t('processes.killProcess')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredProcesses.length > 100 && (
          <div className="p-4 text-center text-slate-400 text-sm border-t border-slate-700">
            Showing 100 of {filteredProcesses.length} processes
          </div>
        )}
      </div>
    </div>
  );
}
