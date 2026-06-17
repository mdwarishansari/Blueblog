'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight === 0) return setProgress(0)
      const currentScroll = window.scrollY
      setProgress((currentScroll / totalHeight) * 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-powder-blue">
      <div
        className="h-full bg-electric-cobalt transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
