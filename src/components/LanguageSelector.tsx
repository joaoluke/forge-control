import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-2">
      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
        {t('language.label')}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => changeLanguage('pt')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            i18n.language === 'pt'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🇧🇷
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            i18n.language === 'en'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🇺🇸
        </button>
      </div>
    </div>
  );
}
