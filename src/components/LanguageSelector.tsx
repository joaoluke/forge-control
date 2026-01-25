import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-sm font-medium">
        {t('language.label')}:
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => changeLanguage('pt')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            i18n.language === 'pt'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🇧🇷 {t('language.portuguese')}
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            i18n.language === 'en'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🇺🇸 {t('language.english')}
        </button>
      </div>
    </div>
  );
}
