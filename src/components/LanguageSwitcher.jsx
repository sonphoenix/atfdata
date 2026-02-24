// components/LanguageSwitcher.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', country: 'GB' },
    { code: 'de', name: 'Deutsch', country: 'DE' },
    { code: 'fr', name: 'Français', country: 'FR' },
    { code: 'ar', name: 'العربية', country: 'SA' },
    { code: 'pt', name: 'Português', country: 'PT' },
    { code: 'it', name: 'Italiano', country: 'IT' }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
    
    // Set RTL for Arabic
    if (langCode === 'ar') {
      //document.documentElement.dir = 'rtl'
      //document.documentElement.lang = 'ar'
    } else {
      //document.documentElement.dir = 'ltr'
      document.documentElement.lang = langCode
    }
  }

  // Function to get flag URL
  const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
  }

  return (
    <div className="relative">
      {/* Language Button - Fixed text color to white */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Globe size={18} className="text-[#00d4ff]" />
        
        {/* Desktop: Show flag + name - FIXED: Added text-white */}
        <div className="hidden sm:flex items-center gap-2">
          <img 
            src={getFlagUrl(currentLanguage.country)} 
            alt={currentLanguage.name}
            className="w-6 h-4 object-cover rounded"
          />
          <span className="text-sm font-medium text-white">
            {currentLanguage.name}
          </span>
        </div>
        
        {/* Mobile: Show only flag */}
        <div className="sm:hidden">
          <img 
            src={getFlagUrl(currentLanguage.country)} 
            alt={currentLanguage.name}
            className="w-6 h-4 object-cover rounded"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop - click to close */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent' }}
          />
          
          {/* Menu - appears above backdrop */}
          <div 
            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(10, 14, 39, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div className="py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 transition-all duration-200 ${
                    i18n.language === lang.code
                      ? 'bg-[#00d4ff]/10 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                  style={{
                    padding: '0.75rem 1rem',
                    margin: '0.125rem 0.5rem',
                    borderRadius: '8px'
                  }}
                >
                  {/* Flag Image */}
                  <img 
                    src={getFlagUrl(lang.country)} 
                    alt={lang.name}
                    className="w-6 h-4 object-cover rounded flex-shrink-0"
                  />
                  
                  {/* Language Name - FIXED: Added text-white */}
                  <span className="text-sm font-medium flex-1 text-left text-white">
                    {lang.name}
                  </span>
                  
                  {/* Check Mark for Active Language */}
                  {i18n.language === lang.code && (
                    <Check size={16} className="text-[#00d4ff] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default LanguageSwitcher