import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Graduation cap */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ position: 'absolute', top: '-10px' }}
          >
            <polygon points="60,20 100,35 60,50 20,35" fill="#FBBF24" opacity="0.9"/>
            <polygon points="60,20 100,35 60,50" fill="#F59E0B"/>
            <line x1="95" y1="35" x2="95" y2="55" stroke="#FBBF24" strokeWidth="3"/>
            <circle cx="95" cy="58" r="4" fill="#FBBF24"/>
          </svg>
          
          {/* Book with E */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '70px',
              height: '90px',
              background: 'white',
              borderRadius: '8px',
              marginTop: '50px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#3B82F6',
              }}
            >
              E
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
