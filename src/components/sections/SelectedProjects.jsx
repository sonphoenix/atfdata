import ProjectCard from '../ui/ProjectCard'

const SelectedProjects = () => {
  const projects = [
    {
      title: 'E-Commerce Analytics Platform',
      description: 'Real-time dashboard for tracking sales, inventory, and customer behavior across multiple channels.',
      tags: ['React', 'Node.js', 'PostgreSQL', 'D3.js'],
      demoUrl: '#'
    },
    {
      title: 'Healthcare Data Pipeline',
      description: 'Secure ETL pipeline for processing and anonymizing patient data with HIPAA compliance.',
      tags: ['Python', 'Apache Airflow', 'AWS', 'MongoDB'],
      demoUrl: '#'
    },
    {
      title: 'Financial Risk Assessment Tool',
      description: 'Machine learning platform for predicting market trends and assessing investment risks.',
      tags: ['TensorFlow', 'FastAPI', 'Redis', 'Docker'],
      demoUrl: '#'
    }
  ]

  return (
    <section className="section-padding bg-black/30 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Selected <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-world solutions we've built for clients across various industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              {...project}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/5 transition-colors">
            View All Projects →
          </button>
        </div>
      </div>
    </section>
  )
}

export default SelectedProjects