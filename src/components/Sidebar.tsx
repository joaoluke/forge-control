import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

interface MenuItem {
  path: string;
  icon: string;
  labelKey: string;
}

export function Sidebar() {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { path: '/', icon: '📊', labelKey: 'menu.dashboard' },
    { path: '/processes', icon: '⚙️', labelKey: 'menu.processes' },
    { path: '/projects', icon: '📁', labelKey: 'menu.projects' },
    { path: '/network', icon: '🌐', labelKey: 'menu.network' },
    { path: '/settings', icon: '⚙️', labelKey: 'menu.settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          ⚡ {t('app.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">{t('app.subtitle')}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <LanguageSelector />
      </div>
    </aside>
  );
}
