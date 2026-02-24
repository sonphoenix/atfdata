import { ChevronUp, ChevronDown, Sparkles, Code, Database } from 'lucide-react'
import { useService } from '../three/ServiceContext'
import { useTranslation } from 'react-i18next'

const WhatWeDo = () => {
  const { t } = useTranslation()
  const { activeService, setActiveService } = useService()

  const services = [
    {
      title: t('whatWeDo.services.software.title'),
      tag: t('whatWeDo.services.software.tag'),
      description: t('whatWeDo.services.software.description'),
      stack: ["React", "Node.js", "Laravel", "React Native", "Python", "MySQL", "MongoDB", "Docker"],
      color: "#00d4ff",
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-400",
      borderClass: "border-cyan-400",
      shadowClass: "shadow-cyan-400/20",
      icon: Code
    },
    {
      title: t('whatWeDo.services.data.title'),
      tag: t('whatWeDo.services.data.tag'),
      description: t('whatWeDo.services.data.description'),
      stack: ["Python", "Pandas", "Apache Airflow", "PostgreSQL", "Streamlit", "Matplotlib", "NLTK / SpaCy", "Plotly"],
      color: "#6366f1",
      colorClass: "text-indigo-500",
      bgClass: "bg-indigo-500",
      borderClass: "border-indigo-500",
      shadowClass: "shadow-indigo-500/20",
      icon: Database
    }
  ]

  const current = services[activeService]

  return (
    <section 
      id="what-we-do"
      className="relative h-screen flex items-center justify-center pointer-events-none"
    >
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${current.color} 0%, transparent 70%)`
        }}
      />

      {/* Main Content Container */}
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header - Centered */}
        <div className="text-center mb-16 pointer-events-auto">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={20} className={`${current.colorClass} animate-pulse`} />
            <span className={`text-sm font-bold tracking-[0.3em] uppercase ${current.colorClass}`}>
              {t('whatWeDo.badge')}
            </span>
            <Sparkles size={20} className={`${current.colorClass} animate-pulse`} />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">
            {t('whatWeDo.title')}
          </h2>
          <div className={`w-24 h-1 mx-auto rounded-full ${current.bgClass} transition-all duration-500`} />
        </div>

        {/* Service Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Service Details */}
          <div className="pointer-events-auto">
            {/* Service Number & Icon */}
            <div className="flex items-center gap-6 mb-8">
              <div className={`text-8xl font-black tabular-nums leading-none ${current.colorClass} transition-colors duration-500`}>
                0{activeService + 1}
              </div>
              <div 
                className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${current.borderClass} transition-all duration-500`}
                style={{ backgroundColor: `${current.color}20` }}
              >
                <current.icon size={36} className={current.colorClass} />
              </div>
            </div>

            {/* Service Tag */}
            <div 
              className={`inline-block px-4 py-2 rounded-full mb-6 text-xs font-bold tracking-[0.2em] ${current.colorClass} border transition-all duration-500`}
              style={{
                backgroundColor: `${current.color}20`,
                borderColor: `${current.color}40`
              }}
            >
              {current.tag}
            </div>

            {/* Service Title */}
            <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {current.title}
            </h3>

            {/* Service Description */}
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              {current.description}
            </p>

            {/* Tech Stack */}
            <div>
              <p className="text-sm text-white/60 mb-4 font-semibold tracking-wider uppercase">
                {t('whatWeDo.technologies')}
              </p>
              <div className="flex gap-3 flex-wrap">
                {current.stack.map((tech, i) => (
                  <div 
                    key={i}
                    className="px-5 py-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 text-sm font-medium text-white transition-all duration-300 hover:scale-105"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - 3D Model Space + Switcher */}
          <div className="hidden lg:block relative">
            <div className="aspect-square"></div>

            {/* Navigation Controls - Right Side Vertical */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto">
              {/* Counter */}
              <div className="text-right mb-2">
                <div className="text-white/20 text-xs font-bold uppercase tracking-widest mb-1">
                  {t('whatWeDo.serviceLabel')}
                </div>
                <div className={`text-3xl font-black tabular-nums leading-none ${current.colorClass} transition-colors duration-500`}>
                  {activeService + 1}/{services.length}
                </div>
              </div>

              {/* Up button */}
              <button
                onClick={() => setActiveService((prev) => (prev - 1 + services.length) % services.length)}
                className={`w-12 h-12 rounded-xl backdrop-blur-sm flex items-center justify-center bg-black/30 border-2 ${current.borderClass} transition-all duration-300 hover:scale-110 group`}
              >
                <ChevronUp className="text-white group-hover:scale-110 transition-transform" size={22} />
              </button>

              {/* Dot indicators */}
              <div className="flex flex-col gap-2">
                {services.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveService(i)}
                    className={`rounded-sm transition-all duration-500 ${
                      i === activeService ? `h-10 w-2.5 ${current.bgClass}` : 'h-2.5 w-2.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Down button */}
              <button
                onClick={() => setActiveService((prev) => (prev + 1) % services.length)}
                className={`w-12 h-12 rounded-xl backdrop-blur-sm flex items-center justify-center bg-black/30 border-2 ${current.borderClass} transition-all duration-300 hover:scale-110 group`}
              >
                <ChevronDown className="text-white group-hover:scale-110 transition-transform" size={22} />
              </button>
            </div>
          </div>
      </div>
      </div>

      {/* Corner Accents */}
      <div 
        className={`absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 opacity-20 transition-all duration-500 pointer-events-none ${current.borderClass}`}
      />
      <div 
        className={`absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 opacity-20 transition-all duration-500 pointer-events-none ${current.borderClass}`}
      />
    </section>
  )
}

export default WhatWeDo