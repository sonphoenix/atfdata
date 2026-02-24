// Scroll animation utilities
export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up')
      }
    })
  }, observerOptions)

  // Observe all elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el)
  })

  return observer
}

// Parallax effect for mouse movement
export const initMouseParallax = () => {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20
    const y = (e.clientY / window.innerHeight - 0.5) * 20
    
    const elements = document.querySelectorAll('[data-parallax]')
    elements.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-parallax-depth') || 1)
      el.style.transform = `translate(${x * depth}px, ${y * depth}px)`
    })
  })
}