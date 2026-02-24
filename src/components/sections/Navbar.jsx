// components/sections/Navbar.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'

const Navbar = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSmoothScroll = (e, href) => {
    e.preventDefault()
    setIsOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '#hero' },
    { name: t('nav.services', 'Services'), href: '#what-we-do' },
    { name: t('nav.projects', 'Projects'), href: '#portal' },
    { name: t('nav.about', 'About'), href: '#about' },
    { name: t('nav.contact', 'Contact'), href: '#contact' }
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-[#0a0e27]/95 backdrop-blur-xl py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleSmoothScroll(e, '#hero')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <img
              src="/logo/Logo_final.svg"
              alt="ATF DATA"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            <img
              src="/logo/text_final.svg"
              alt="ATF DATA Text"
              className="h-6 w-auto hidden sm:block transition-transform duration-300 group-hover:scale-110"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0e27]/98 backdrop-blur-xl border-t border-white/10">
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-gray-300 hover:text-white transition-colors py-2 cursor-pointer"
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-4 border-t border-white/10">
                <LanguageSwitcher />
              </div>

              <a
                href="#contact"
                onClick={(e) => handleSmoothScroll(e, '#contact')}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-medium text-center cursor-pointer"
              >
                {t('nav.getQuote', 'Get Quote')}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar