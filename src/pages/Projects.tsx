import { useTranslation } from 'react-i18next';

export function Projects() {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('menu.projects')}
        </h1>
        <p className="text-slate-400 text-lg">
          Manage your development projects and Git repositories
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Coming Soon - FASE 2
        </h2>
        <p className="text-slate-400">
          Project scanner and Git integration will be implemented in Phase 2
        </p>
      </div>
    </div>
  );
}
