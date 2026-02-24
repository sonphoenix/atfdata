import { Linkedin, Github, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-[#00d4ff] rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#6366f1] bg-clip-text text-transparent">
                ATF Data
              </span>
            </div>
            <p className="text-gray-400 max-w-md">
              Transforming data into actionable insights. We build robust data systems
              and scalable software solutions for modern businesses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Projects', 'Services', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-[#00d4ff] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Linkedin size={20} className="text-gray-400" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Github size={20} className="text-gray-400" />
              </a>
              <a
                href="mailto:hello@atfdata.com"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Mail size={20} className="text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ATF Data. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer