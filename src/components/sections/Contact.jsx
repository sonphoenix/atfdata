import { useState } from 'react'
import { Mail, MapPin, Phone, Send, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import emailjs from '@emailjs/browser'

// ─────────────────────────────────────────────────────────────────────────────
// EmailJS config — fill these in after setup (see README comment below)
//
// SETUP (5 minutes):
//  1. Go to https://www.emailjs.com and sign up free
//  2. Dashboard → Email Services → Add Service → Gmail
//     • Connect your sonphoenix2002@gmail.com account
//     • Copy the Service ID  →  EMAILJS_SERVICE_ID
//  3. Email Templates → Create Template
//     • Subject:  New message from {{from_name}} via ATF DATA
//     • Body:
//         From:    {{from_name}} ({{from_email}})
//         Company: {{company}}
//
//         {{message}}
//     • "To Email" field: sonphoenix2002@gmail.com
//     • Copy the Template ID  →  EMAILJS_TEMPLATE_ID
//  4. Account → API Keys → copy Public Key  →  EMAILJS_PUBLIC_KEY
//  5. Run:  npm install @emailjs/browser
// ─────────────────────────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID      = import.meta.env.VITE_EMAILJS_SERVICE_ID      || 'service_i0os9qr'
const EMAILJS_TEMPLATE_ID     = import.meta.env.VITE_EMAILJS_TEMPLATE_ID     || 'template_46esdvn'
const EMAILJS_NOTIFY_TEMPLATE = import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE || 'template_sle906s'
const EMAILJS_PUBLIC_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY      || 'LWXyhjX5qIKI-vzvB'
// ─────────────────────────────────────────────────────────────────────────────

const Contact = () => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMsg('')

    const payload = {
      name:       formData.name,
      from_email: formData.email,
      company:    formData.company || 'Not specified',
      title:      formData.message,
      reply_to:   formData.email,
    }

    try {
      await Promise.all([
        // Notifies you (Contact Us template)
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NOTIFY_TEMPLATE, payload, EMAILJS_PUBLIC_KEY),
        // Auto-reply to the client
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload, EMAILJS_PUBLIC_KEY),
      ])

      setSubmitStatus('success')
      setFormData({ name: '', email: '', company: '', message: '' })
      setTimeout(() => setSubmitStatus(null), 7000)
    } catch (err) {
      console.error('EmailJS error:', err)
      setErrorMsg('Failed to send. Please email us directly at contact@atf-data.fr')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      className="relative min-h-screen flex items-center justify-center py-20 pointer-events-none"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-indigo-500 to-yellow-400 animate-[gradient_8s_ease_infinite] bg-[length:400%_400%]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center mb-16 pointer-events-auto">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-cyan-400 animate-pulse" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400">
              {t('contact.badge', 'GET IN TOUCH')}
            </span>
            <Sparkles size={20} className="text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3">
            {t('contact.title', "Let's Build Something Together")}
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-yellow-400" />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start pointer-events-auto">

          {/* ── Left: contact info ─────────────────────────────────────── */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {t('contact.subtitle', 'Ready to Start Your Project?')}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {t('contact.description', 'Whether you need a web application, data pipeline, or custom software, our team is here to help bring your vision to life.')}
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:contact@atf-data.fr"
                className="group flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/[0.05] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:translate-x-2"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('contact.email', 'Email Us')}</p>
                  <p className="text-white font-semibold group-hover:text-cyan-400 transition-colors">contact@atf-data.fr</p>
                </div>
              </a>

              <a
                href="tel:+33744132981"
                className="group flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/[0.05] border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:translate-x-2"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('contact.phone', 'Call Us')}</p>
                  <p className="text-white font-semibold group-hover:text-indigo-400 transition-colors">+33 7 44 13 29 81</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/[0.05] border border-white/10 hover:border-yellow-400/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">{t('contact.address', 'Visit Us')}</p>
                  <p className="text-white font-semibold">
                    59 Avenue de l'Europe<br />
                    78160 Marly-le-Roi, France
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { value: '24h', label: t('contact.stats.response', 'Response Time'), color: 'text-cyan-400' },
                { value: '50+', label: t('contact.stats.projects', 'Projects'),       color: 'text-indigo-400' },
                { value: '98%', label: t('contact.stats.satisfaction', 'Satisfaction'), color: 'text-yellow-400' },
              ].map(({ value, label, color }) => (
                <div key={label} className="text-center p-4 rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/10">
                  <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form ────────────────────────────────────────────── */}
          <div className="relative">
            <div className="relative rounded-3xl backdrop-blur-md bg-white/[0.03] border border-white/10 p-8 lg:p-10">
              {/* glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-yellow-400 rounded-3xl opacity-20 blur-2xl pointer-events-none" />

              <div className="relative">
                {/* ── SUCCESS STATE ── */}
                {submitStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {t('contact.success.title', 'Message Sent!')}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {t('contact.success.message', "We'll get back to you within 24 hours.")}
                    </p>
                    <button
                      onClick={() => setSubmitStatus(null)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-semibold hover:scale-105 transition-transform"
                    >
                      {t('contact.success.sendAnother', 'Send Another Message')}
                    </button>
                  </div>
                ) : (
                  /* ── FORM STATE ── */
                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Error banner */}
                    {submitStatus === 'error' && (
                      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('contact.form.name', 'Your Name')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-5 py-3 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('contact.form.email', 'Email Address')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@company.com"
                        className="w-full px-5 py-3 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>

                    {/* Company (optional) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('contact.form.company', 'Company')}
                        <span className="text-gray-600 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your Company"
                        className="w-full px-5 py-3 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {t('contact.form.message', 'Your Message')} <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your project..."
                        className="w-full px-5 py-3 rounded-xl backdrop-blur-md bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-yellow-400 text-white font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center gap-3">
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            {t('contact.form.sending', 'Sending...')}
                          </>
                        ) : (
                          <>
                            {t('contact.form.submit', 'Send Message')}
                            <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-cyan-400/30 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-yellow-400/30 opacity-50 pointer-events-none" />
    </section>
  )
}

export default Contact