import { createContext, useContext, useState } from 'react'

const ServiceContext = createContext()

export const ServiceProvider = ({ children }) => {
  const [activeService, setActiveService] = useState(0)

  return (
    <ServiceContext.Provider value={{ activeService, setActiveService }}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useService = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useService must be used within ServiceProvider')
  }
  return context
}