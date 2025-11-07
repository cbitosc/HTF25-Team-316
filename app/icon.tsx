import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Graduation cap shape */}
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#FBBF24',
              transform: 'rotate(45deg)',
              position: 'absolute',
              top: '6px',
            }}
          />
          {/* Letter E */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              marginTop: '8px',
            }}
          >
            E
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
