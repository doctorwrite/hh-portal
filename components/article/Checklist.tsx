// components/article/Checklist.tsx
'use client'

import { useState, useEffect } from 'react'

interface ChecklistItem {
  id: string
  text: string
  hint: string
}

interface ChecklistProps {
  title: string
  items: ChecklistItem[]
  storageKey: string
}

const Checklist: React.FC<ChecklistProps> = ({ title, items, storageKey }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Загрузка состояния из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setCheckedItems(JSON.parse(saved))
      }
    } catch (e) {}
  }, [storageKey])

  // Сохранение в localStorage
  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newState = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState))
      } catch (e) {}
      return newState
    })
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const total = items.length
  const progress = Math.round((checkedCount / total) * 100)

  return (
    <div className="checklist-wrapper" style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '24px 28px',
      margin: '16px 0'
    }}>
      <div className="checklist-title" style={{
        color: '#fcf6ba',
        fontWeight: 700,
        fontSize: '1.1rem',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {title}
        <span style={{
          fontSize: '0.6rem',
          background: 'rgba(245,197,66,0.1)',
          padding: '2px 10px',
          borderRadius: '12px',
          color: '#fcf6ba'
        }}>
          {checkedCount}/{total}
        </span>
      </div>

      <div>
        {items.map((item) => {
          const isChecked = checkedItems[item.id] || false
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '1px solid transparent',
                marginBottom: '2px',
                opacity: isChecked ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                minWidth: '22px',
                borderRadius: '6px',
                border: `2px solid ${isChecked ? '#fcf6ba' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: isChecked ? '#0a0a0f' : 'transparent',
                transition: 'all 0.3s',
                marginTop: '2px',
                background: isChecked ? '#fcf6ba' : 'rgba(255,255,255,0.03)'
              }}>
                {isChecked ? '✓' : ''}
              </span>
              <span style={{
                flex: 1,
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                <strong style={{ color: isChecked ? '#888' : '#fff', display: 'block' }}>
                  {item.text}
                </strong>
                <span style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#666',
                  fontWeight: 400,
                  marginTop: '2px'
                }}>
                  {item.hint}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {/* Прогресс */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: '#888',
          whiteSpace: 'nowrap'
        }}>
          Прогресс:
        </span>
        <div style={{
          flex: 1,
          height: '4px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #bf953f, #fcf6ba)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#fcf6ba',
          fontWeight: 600,
          minWidth: '60px',
          textAlign: 'right'
        }}>
          {progress}%
        </span>
      </div>

      {/* Поздравление */}
      {progress === 100 && (
        <div style={{
          marginTop: '16px',
          padding: '14px 20px',
          background: 'rgba(245,197,66,0.08)',
          border: '1px solid rgba(245,197,66,0.15)',
          borderRadius: '12px',
          textAlign: 'center',
          animation: 'celebrateIn 0.6s ease'
        }}>
          <span style={{ fontSize: '2rem', display: 'block' }}>🎉</span>
          <span style={{ color: '#fcf6ba', fontWeight: 600, fontSize: '1rem' }}>
            Отлично! Вы готовы к эквализации уровня PRO! 🔥
          </span>
        </div>
      )}

      <style>{`
        @keyframes celebrateIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default Checklist