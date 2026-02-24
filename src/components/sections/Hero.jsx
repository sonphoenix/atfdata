import { Code, TrendingUp, CheckCircle2, GitBranch, Globe, BookOpen, Layers } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// ── Real stats from projectsGraph ─────────────────────────────────────────────
const PROJECT_STATS = [
  { value: '15', label: 'hero.stats.projects',   color: 'text-cyan-400',    icon: Layers    },
  { value: '11', label: 'hero.stats.openSource', color: 'text-emerald-400', icon: GitBranch },
  { value: '4',  label: 'hero.stats.liveApps',   color: 'text-indigo-400',  icon: Globe     },
  { value: '2',  label: 'hero.stats.paths',       color: 'text-yellow-400',  icon: BookOpen  },
]

const Hero = ({ isSceneReady }) => {
  const { t } = useTranslation()
  const contentRef = useRef()

  useEffect(() => {
    if (isSceneReady && contentRef.current) {
      contentRef.current.offsetHeight
    }
  }, [isSceneReady])

  return (
    <div className="relative min-h-screen pt-20">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e27]/60 to-[#0a0e27]/90 pointer-events-none z-[1]" />

      {/* Content */}
      <div
        ref={contentRef}
        className={`relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center px-8 transition-all duration-800 ease-out ${
          isSceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
        }`}
        style={{ transitionDelay: isSceneReady ? '0.2s' : '0s' }}
      >
        <div className="max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Content */}
            <div className="flex flex-col gap-10 pb-12">

              {/* Title */}
              <div className={`transition-all duration-600 ease-out delay-[400ms] ${
                isSceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-heading leading-[1.1] text-white">
                  <div className="mb-3 text-white">{t('hero.title1')}</div>
                  <div className="mb-3 text-white">{t('hero.title2')}</div>
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent animate-[gradient_4s_ease_infinite] bg-[length:200%_200%]">
                    {t('hero.title3')}
                  </div>
                </h1>
              </div>

              {/* Subtitle */}
              <p className={`text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed transition-all duration-600 ease-out delay-[500ms] ${
                isSceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                {t('hero.subtitle', { interpolation: { escapeValue: false } }).split('<1>')[0]}
                <span className="text-cyan-400 font-semibold">
                  {t('hero.subtitle').split('<1>')[1]?.split('</1>')[0]}
                </span>
                {t('hero.subtitle').split('</1>')[1]?.split('<2>')[0]}
                <span className="text-indigo-500 font-semibold">
                  {t('hero.subtitle').split('<2>')[1]?.split('</2>')[0]}
                </span>
                {t('hero.subtitle').split('</2>')[1]}
              </p>

              {/* ── 2 career-path tags ──────────────────────────────────── */}
              <div className={`flex flex-wrap gap-4 transition-all duration-600 ease-out delay-[600ms] ${
                isSceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                {[
                  { icon: Code,       label: t('hero.services.fullstack'),    color: 'text-cyan-400'   },
                  { icon: TrendingUp, label: t('hero.services.dataAnalysis'), color: 'text-indigo-400' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:scale-105 transition-transform group"
                  >
                    <item.icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* ── Real project stats ───────────────────────────────────── */}
              <div className={`transition-all duration-600 ease-out delay-[700ms] ${
                isSceneReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8">
                  {PROJECT_STATS.map(({ value, label, color, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:scale-105 hover:border-white/20 transition-all duration-300 group cursor-default"
                    >
                      <Icon
                        size={20}
                        className={`${color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`}
                      />
                      <span className={`text-3xl font-black ${color}`}>{value}</span>
                      <span className="text-[11px] text-gray-400 text-center leading-tight uppercase tracking-wider">
                        {t(label)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Space for 3D */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero