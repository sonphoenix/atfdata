import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Calendar, HelpCircle, FolderOpen, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getCalApi } from "@calcom/embed-react"

const ChatBot = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: t('chatbot.welcome')
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const bookButtonRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({ namespace: "30min" });
        cal("ui", {
          layout: "month_view",
          theme: "dark"
        });
        //console.log("✅ Cal.com initialized successfully");
      } catch (error) {
        console.error("❌ Cal.com init failed:", error);
      }
    })();
  }, []);

  const openCalScheduler = () => {
    if (bookButtonRef.current) {
      bookButtonRef.current.click()
    }
  }

  const quickActions = [
    {
      id: 'schedule',
      icon: Calendar,
      label: t('chatbot.actions.bookMeeting'),
      action: () => {
        addMessage('user', t('chatbot.userMessages.bookMeeting'))
        setTimeout(() => {
          addMessage('bot', t('chatbot.botMessages.openingSchedule'))
          setTimeout(() => {
            openCalScheduler()
          }, 500)
        }, 800)
      }
    },
    {
      id: 'question',
      icon: HelpCircle,
      label: t('chatbot.actions.askQuestion'),
      action: () => {
        addMessage('user', t('chatbot.userMessages.question'))
        setTimeout(() => {
          addMessage('bot', t('chatbot.botMessages.helpQuestion'))
        }, 800)
      }
    },
    {
      id: 'projects',
      icon: FolderOpen,
      label: t('chatbot.actions.viewProjects'),
      action: () => {
        addMessage('user', t('chatbot.userMessages.projects'))
        setTimeout(() => {
          addMessage('bot', t('chatbot.botMessages.projectsInfo'))
        }, 800)
      }
    },
    {
      id: 'services',
      icon: Sparkles,
      label: t('chatbot.actions.learnServices'),
      action: () => {
        addMessage('user', t('chatbot.userMessages.services'))
        setTimeout(() => {
          addMessage('bot', t('chatbot.botMessages.servicesInfo'))
        }, 800)
      }
    }
  ]

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    addMessage('user', inputValue)
    setInputValue('')

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)

      const userMsg = inputValue.toLowerCase()
      let response = t('chatbot.botMessages.default')

      if (userMsg.includes('schedule') || userMsg.includes('meeting') || userMsg.includes('book')) {
        response = t('chatbot.botMessages.scheduleResponse')
      } else if (userMsg.includes('project')) {
        response = t('chatbot.botMessages.projectResponse')
      } else if (userMsg.includes('service') || userMsg.includes('skill') || userMsg.includes('expertise')) {
        response = t('chatbot.botMessages.skillsResponse')
      } else if (userMsg.includes('contact') || userMsg.includes('email') || userMsg.includes('reach')) {
        response = t('chatbot.botMessages.contactResponse')
      }

      addMessage('bot', response)
    }, 1000 + Math.random() * 1000)
  }

  return (
    <>
      {/* Hidden Cal.com trigger button */}
      <button
        ref={bookButtonRef}
        data-cal-namespace="30min"
        data-cal-link="ferradj-ahmed-999-4gxwdb/30min"
        data-cal-origin="https://cal.com"
        data-cal-config='{"layout":"month_view","theme":"dark"}'
        className="hidden"
        aria-hidden="true"
      />

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50 group
          w-16 h-16 rounded-full
          flex items-center justify-center
          bg-gradient-to-r from-purple-500 to-indigo-500
          shadow-[0_8px_32px_rgba(168,85,247,0.4)]
          transition-all duration-300
          hover:scale-110
          ${isOpen ? 'scale-90' : 'scale-100'}
        `}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}

        {/* Pulse animation when closed */}
        {!isOpen && (
          <div
            className="absolute inset-0 rounded-full animate-ping bg-gradient-to-r from-purple-500 to-indigo-500 opacity-30"
          />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-6 z-50
            w-[400px] max-w-[calc(100vw-3rem)]
            h-[600px] max-h-[calc(100vh-10rem)]
            rounded-2xl
            bg-gray-900/95
            backdrop-blur-xl
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.5)]
            flex flex-col
            animate-[slideUp_0.3s_ease-out]
          "
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t('chatbot.title')}
                </h3>
                <p className="text-sm text-gray-400">
                  {t('chatbot.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-white/10 bg-black/20">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="
                    flex items-center gap-2 px-3 py-2.5 rounded-lg
                    text-sm font-medium text-white
                    bg-white/5 border border-white/10
                    hover:scale-105 transition-all
                  "
                >
                  <action.icon size={16} className="text-purple-400" />
                  <span className="text-xs">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 px-4
                    text-white text-sm leading-relaxed
                    ${message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-2xl rounded-l-2xl rounded-br'
                      : 'bg-white/10 rounded-t-2xl rounded-r-2xl rounded-bl'
                    }
                  `}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 px-4 bg-white/10 rounded-t-2xl rounded-r-2xl rounded-bl flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/30">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatbot.inputPlaceholder')}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-white placeholder:text-gray-500
                  focus:outline-none
                "
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`
                  px-4 py-3 rounded-xl
                  transition-all disabled:opacity-50
                  disabled:cursor-not-allowed hover:scale-105
                  ${inputValue.trim()
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    : 'bg-white/10'
                  }
                `}
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default ChatBot