'use client'

import { useEffect } from 'react'

interface JSONLDProps {
  data: any
}

export default function JSONLD({ data }: JSONLDProps) {
  useEffect(() => {
    // Remove existing JSON-LD script
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new JSON-LD script
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [data])

  return null
}