import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Users, Code, Database } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const WhoWeAre = () => {
  const sectionRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-content',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none'
          }
        }
      )

      gsap.fromTo('.brother-card',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.brother-cards',
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen py-32"
      style={{
        background: '#0a0e27'
      }}
    >
      <div className="container mx-auto px-6" style={{ maxWidth: '1280px' }}>
        {/* Section Header */}
        <div className="text-center mb-16 about-content">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
            <Users size={16} className="text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-bold tracking-wider">ABOUT US</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
            Built by Two Brothers
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            We're not just business partners—we're family. With complementary skills 
            in software engineering and data systems, we deliver end-to-end solutions 
            that actually work.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse" />
              <span>Based in Algeria</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-pulse" />
              <span>Working Globally</span>
            </div>
          </div>
        </div>

        {/* Brothers Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 brother-cards">
          {/* Brother 1 - Software */}
          <div className="brother-card glass-effect p-8 rounded-2xl hover:scale-105 transition-transform relative overflow-hidden group">
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#6366f1] flex items-center justify-center">
                  <Code size={28} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Brother #1</div>
                  <div className="text-sm text-[#00d4ff] font-semibold">Software Engineer</div>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Specializes in building beautiful, fast, and scalable web and mobile applications. 
                From pixel-perfect UIs to robust backend systems.
              </p>

              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-semibold mb-2">EXPERTISE</div>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Swift'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-gray-400 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brother 2 - Data */}
          <div className="brother-card glass-effect p-8 rounded-2xl hover:scale-105 transition-transform relative overflow-hidden group">
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Database size={28} className="text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Brother #2</div>
                  <div className="text-sm text-[#6366f1] font-semibold">Data Engineer</div>
                </div>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Expert in designing data pipelines, building analytics platforms, and 
                turning complex data into actionable business intelligence.
              </p>

              <div className="space-y-2">
                <div className="text-sm text-gray-500 font-semibold mb-2">EXPERTISE</div>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'PostgreSQL', 'Airflow', 'Spark', 'ML'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-gray-400 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="about-content">
          <h3 className="text-3xl font-bold text-center mb-12">Our Values</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Reliability',
                description: 'We deliver on time, every time. Your deadlines are our commitments.',
                icon: '🛡️'
              },
              {
                title: 'Clarity',
                description: 'No jargon, no confusion. We communicate in clear, simple terms.',
                icon: '💡'
              },
              {
                title: 'Quality',
                description: 'Production-ready code from day one. We don\'t cut corners.',
                icon: '⚡'
              }
            ].map((value, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 about-content">
          <p className="text-gray-400 mb-6">
            Want to work with us?
          </p>
          <button 
            className="px-8 py-4 glass-effect border border-[#00d4ff] text-[#00d4ff] rounded-lg font-semibold hover:bg-[#00d4ff] hover:text-white transition-all"
            onClick={() => window.location.href = '/about'}
          >
            Read Our Full Story
          </button>
        </div>
      </div>
    </section>
  )
}

export default WhoWeAre