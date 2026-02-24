import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HowWeWork = () => {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = sectionRef.current.querySelectorAll('.process-step')
      
      steps.forEach((step, i) => {
        gsap.fromTo(step,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none none'
            }
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const steps = [
    {
      number: '01',
      title: 'Discover',
      description: 'We dive deep into your needs, goals, and challenges. Understanding your vision is our first priority.',
      icon: '🔍',
      color: '#00d4ff'
    },
    {
      number: '02',
      title: 'Design',
      description: 'We architect the perfect solution. From database schemas to UI flows, every detail is planned.',
      icon: '🎨',
      color: '#6366f1'
    },
    {
      number: '03',
      title: 'Build',
      description: 'Clean code, best practices, and constant testing. We develop with precision and care.',
      icon: '⚙️',
      color: '#8b5cf6'
    },
    {
      number: '04',
      title: 'Deploy',
      description: 'We launch your project and stick around. Ongoing support, monitoring, and optimization included.',
      icon: '🚀',
      color: '#00d4ff'
    }
  ]

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-32"
      style={{
        background: 'linear-gradient(180deg, #0a0e27 0%, #0f172a 50%, #0a0e27 100%)'
      }}
    >
      <div className="container mx-auto px-6" style={{ maxWidth: '1280px' }}>
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="text-sm text-[#00d4ff] font-bold tracking-widest mb-4">
            OUR PROCESS
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
            How We Work
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From concept to deployment, we follow a proven process that delivers results
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="process-step relative"
            >
              {/* Connection Line (desktop only) */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden lg:block absolute top-12 left-full w-full h-0.5 -z-10"
                  style={{
                    background: `linear-gradient(to right, ${step.color}, ${steps[index + 1].color})`
                  }}
                />
              )}

              {/* Step Card */}
              <div className="glass-effect p-8 rounded-2xl h-full hover:scale-105 transition-transform relative overflow-hidden">
                {/* Number Badge */}
                <div 
                  className="absolute top-4 right-4 text-7xl font-black opacity-5"
                  style={{ color: step.color }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4">
                  {step.icon}
                </div>

                {/* Number */}
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: step.color }}
                >
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Accent Line */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: step.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Ready to start your project?
          </p>
          <button 
            className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#6366f1] text-white rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-all"
            onClick={() => window.location.href = '#contact'}
          >
            Let's Talk
          </button>
        </div>
      </div>
    </section>
  )
}

export default HowWeWork