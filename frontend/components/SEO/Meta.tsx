import { Metadata } from 'next'

interface MetaProps {
  metadata?: Metadata
}

export default function Meta({ metadata : _metadata }: MetaProps) {
  // This component is for client-side meta updates
  // For server-side, we use Next.js Metadata API
  return null
}