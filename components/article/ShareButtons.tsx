// components/article/ShareButtons.tsx
'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title?: string
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title = '' }) => {
  const [showNotification, setShowNotification] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 2500)
    }).catch(() => {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 2500)
    })
  }

  return (
    <>
      <div style={{ textAlign: 'center', margin: '10px 0 5px', color: '#888', fontSize: '0.8rem' }}>
        Поделиться статьёй:
      </div>
      <div className="share-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', margin: '20px 0' }}>
        <a
          href={`https://vk.com/share.php?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn vk"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none !important',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            background: '#0077FF'
          }}
        >
          <span>📱</span>
          <span className="share-label" style={{ fontWeight: 600 }}>Поделиться в VK</span>
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn tg"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none !important',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            background: '#0088cc'
          }}
        >
          <span>✈️</span>
          <span className="share-label" style={{ fontWeight: 600 }}>Поделиться в Telegram</span>
        </a>
        <button
          className="share-btn copy"
          onClick={copyLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none !important',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            color: '#fff',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'inherit'
          }}
        >
          <span>📋</span>
          <span className="share-label" style={{ fontWeight: 600 }}>Копировать ссылку</span>
        </button>
      </div>

      {showNotification && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: '12px',
          border: '1px solid rgba(245,197,66,0.2)',
          zIndex: 9999,
          fontSize: '0.95rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          ✅ Ссылка скопирована!
        </div>
      )}
    </>
  )
}

export default ShareButtons
