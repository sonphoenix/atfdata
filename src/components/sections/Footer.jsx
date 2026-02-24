// components/sections/Footer.jsx
import { Github, Mail, MapPin, Phone, Linkedin, Twitter, Heart, X, Boxes } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const creditors = [
  { name: 'AMMediaGames' },
  { name: 'assetfactory' },
  { name: 'Micheal-Holloway' },
  { name: 'senya.frozenov' },
  { name: 'N01506' },
  { name: 'Anom Purple Modelling' },
  { name: 'Salim Rached' },
  { name: 'clon6767' },
  { name: 'Lexyc16' },
]

const CreditsModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(5, 7, 20, 0.85)', backdropFilter: 'blur(8px)' }}
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-md rounded-2xl overflow-hidden"
      style={{
        background: '#0a0e27',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onClick={(e) => e.stopPropagation()}
    >


      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Boxes size={20} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">3D Model Credits</h2>
              <p className="text-gray-500 text-xs mt-0.5">Talented creators behind our visuals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grid of modelers */}
        <div className="grid grid-cols-1 gap-2">
          {creditors.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              {/* Numbered badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <span className="text-gray-300 text-sm font-medium">{c.name}</span>
              {/* Subtle dot accent */}
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-5">
          Thank you to all creators for your incredible work ✦
        </p>
      </div>
    </div>
  </div>
)

const Footer = () => {
  const { t, i18n } = useTranslation()
  const [showCredits, setShowCredits] = useState(false)

  const socialLinks = [
    { name: 'GitHub - Ahmed Ferradj', icon: Github, url: 'https://github.com/Ferradj04/', color: '#00d4ff' },
    { name: 'GitHub - Phoenix', icon: Github, url: 'https://github.com/sonphoenix', color: '#6366f1' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/atf-data', color: '#0077b5' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/atf_data', color: '#1da1f2' }
  ]

  const quickLinks = [
    { name: t('footer.links.home', 'Home'), href: '#hero' },
    { name: t('footer.links.services', 'Services'), href: '#what-we-do' },
    { name: t('footer.links.projects', 'Projects'), href: '#portal' },
    { name: t('footer.links.contact', 'Contact'), href: '#contact' }
  ]

  const services = [
    t('footer.services.dataScience', 'Data Analysis'),
    t('footer.services.dataEngineering', 'Data Engineering'),
    t('footer.services.aiMl', 'ETL Pipelines'),
    t('footer.services.softwareDev', 'Software Development')
  ]

  const handleSmoothScroll = (e, href) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}

      <footer className="relative w-full">
        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 via-indigo-500 via-yellow-400 to-transparent" />

        <div className="relative w-full bg-gradient-to-b from-[#0a0e27] to-[#050714]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-6 w-full">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">

              {/* Company Info */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-400/30">
                    <span className="text-white font-bold text-xl">ATF</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">ATF DATA</h3>
                    <p className="text-xs text-gray-400">Software & Data Engineering</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('footer.description', 'Leading provider of data intelligence and software engineering solutions')}
                </p>

                <div className="px-4 py-3 rounded-lg text-xs bg-cyan-400/5 border border-cyan-400/10">
                  <div className="text-gray-400">SIREN</div>
                  <div className="text-white font-semibold">991 585 217</div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="lg:col-span-2">
                <h4 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
                  {t('footer.quickLinks', 'Quick Links')}
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group cursor-pointer"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-cyan-400 transition-colors" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div className="lg:col-span-3">
                <h4 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-yellow-400 rounded-full" />
                  {t('footer.ourServices', 'Our Services')}
                </h4>
                <ul className="space-y-3">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span className="text-gray-400 text-sm leading-relaxed">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact & Social */}
              <div className="lg:col-span-4">
                <h4 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-cyan-400 rounded-full" />
                  {t('footer.connect', 'Connect With Us')}
                </h4>

                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-400 text-sm leading-relaxed">
                      <div>59 Avenue de l'Europe</div>
                      <div>78160 Marly-le-Roi</div>
                      <div className="text-xs text-gray-500 mt-1">France</div>
                    </div>
                  </div>

                  <a href="mailto:contact@atf-data.fr" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm group">
                    <Mail size={16} className="flex-shrink-0" />
                    <span className="group-hover:underline">contact@atf-data.fr</span>
                  </a>

                  <a href="tel:+33744132981" className="flex items-center gap-3 text-gray-400 hover:text-indigo-500 transition-colors text-sm group">
                    <Phone size={16} className="flex-shrink-0" />
                    <span className="group-hover:underline">+33 7 44 13 29 81</span>
                  </a>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Follow Us</p>
                  <div className="flex gap-2">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.08] hover:scale-110 transition-all duration-300 group"
                        title={social.name}
                      >
                        <social.icon size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px mb-6 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} <span className="text-white font-semibold">ATF DATA</span> — {t('footer.rights', 'All rights reserved')}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm items-center">
                {/* 3D Credits Button */}
                <button
                  onClick={() => setShowCredits(true)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-400 transition-colors text-xs cursor-pointer group"
                >
                  <Boxes size={13} className="group-hover:scale-110 transition-transform" />
                  <span>3D Credits</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer