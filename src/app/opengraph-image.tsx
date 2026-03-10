import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Skyline Realty — AI-Powered Real Estate in Seattle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1B2A4A',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: '#C4A265',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: 'rgba(196, 162, 101, 0.15)',
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#C4A265',
            }}
          >
            S
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            Skyline
          </span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#C4A265',
            }}
          >
            Realty
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 24,
            color: '#8da2c9',
            marginTop: 16,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          AI-Powered Real Estate in Seattle
        </p>

        {/* Feature badges */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {['24/7 AI Chat', 'Instant Lead Capture', 'Smart Follow-Up'].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    color: '#d9e0ed',
                  }}
                >
                  {feature}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
