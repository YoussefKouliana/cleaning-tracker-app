// src/components/LanguageSwitcher.tsx
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('sv')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'sv'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        SV
      </button>
      <button
        onClick={() => setLanguage('uz')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'uz'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        UZ
      </button>
    </div>
  );
};

export default LanguageSwitcher;