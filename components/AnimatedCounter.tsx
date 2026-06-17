'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // Custom ultra-smooth easeOutExpo curve
      onUpdate(val) {
        node.textContent = Math.round(val).toLocaleString()
      },
    })

    return () => controls.stop()
  }, [value])

  return <span ref={ref}>0</span>
}
