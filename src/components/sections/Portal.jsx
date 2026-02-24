import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'

const Portal = ({ onZoomStart }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const contentRef = useRef()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPortalHovered, setIsPortalHovered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              contentRef.current.querySelectorAll('.portal-item'),
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
            )
          }
        })
      },
      { threshold: 0.3 }
    )
    if (contentRef.current) observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isTransitioning) return
      const cx = window.innerWidth  / 2
      const cy = window.innerHeight / 2
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
      const portalRadius = Math.min(window.innerWidth, window.innerHeight) * 0.22
      setIsPortalHovered(dist < portalRadius)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isTransitioning])

  const handleEnterPortal = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    gsap.to(contentRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' })
    setTimeout(() => { if (onZoomStart) onZoomStart() }, 300)
  }

  return (
    <section
      id="portal"
      className={`relative flex items-end justify-center min-h-screen pointer-events-none ${
        isPortalHovered && !isTransitioning ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={isPortalHovered && !isTransitioning ? handleEnterPortal : undefined}
    >
      {/* ── Bottom strip: badge + title only, portal 3D scene dominates the view ── */}
      <div
        ref={contentRef}
        className="text-center z-20 px-6 pb-14 pointer-events-auto w-full"
      >
        {/* Badge */}
        <div className="portal-item mb-5 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-white/[0.06] border border-white/10">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400">
              {t('portal.badge')}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="portal-item text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-0">
          <span className="text-white">{t('portal.title1')} </span>
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            {t('portal.title2')}
          </span>
        </h2>

        {/* Hover CTA – replaces hint text, fades in when hovering the portal */}
        <div className="portal-item mt-6 h-8">
          {isPortalHovered && !isTransitioning ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-md bg-cyan-400/10 border border-cyan-400/40 animate-pulse">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">
                {t('portal.clickToEnter')}
              </span>
            </div>
          ) : (
            <p className="text-xs text-white/25 font-mono tracking-widest">
              {t('portal.hint')}
            </p>
          )}
        </div>
      </div>

      {/* Subtle vignette at bottom so text is readable over the 3D scene */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,170,255,0.06)_0%,transparent_70%)]" />
    </section>
  )
}

export default Portal