import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ArmorShield CRM',
    short_name: 'ArmorShield',
    description: 'Client & job management for ArmorShield Roofing & Construction',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#1e293b',
    icons: [
      { src: '/icon', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
