import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#1e293b',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '96px',
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: 210,
          fontWeight: 900,
          letterSpacing: '-12px',
          lineHeight: 1,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        AS
      </div>
      <div
        style={{
          color: '#64748b',
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: '18px',
          marginTop: '8px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        CRM
      </div>
    </div>,
    { ...size }
  )
}
