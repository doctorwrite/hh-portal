// components/article/BrandBlock.tsx

const BrandBlock: React.FC = () => {
  return (
    <div className="brand-block" id="contacts" style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(245, 197, 66, 0.06)',
      borderRadius: '24px',
      padding: '40px 36px',
      margin: '40px 0 20px',
      textAlign: 'center',
      transition: 'all 0.4s'
    }}>
      <h2 style={{
        color: '#fcf6ba',
        fontSize: '1.6rem',
        marginBottom: '4px',
        fontFamily: "'Oswald', sans-serif"
      }}>
        🎧 HHRecords — студия звукозаписи
      </h2>
      <div style={{
        color: '#4a9eff',
        fontSize: '0.8rem',
        fontWeight: 600,
        marginBottom: '12px',
        letterSpacing: '0.5px'
      }}>
        🌐 Работаем очно и онлайн по всей России
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        margin: '0 auto 16px'
      }}>
        Запись вокала, сведение, мастеринг. 10 лет опыта, оборудование премиум-класса (Neumann, Focal, Apollo).
      </p>
      <div className="btn-row" style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '10px'
      }}>
        <a href="tel:+79138376772" className="btn" style={{
          background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)',
          color: '#000',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 18px',
          height: '42px',
          borderRadius: '50px',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
          border: 'none',
          cursor: 'pointer'
        }}>
          📞 Позвонить
        </a>
        <a href="https://t.me/Nickkrsk" className="btn" style={{
          background: 'linear-gradient(135deg,#0088cc,#005f8a)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 18px',
          height: '42px',
          borderRadius: '50px',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
          border: 'none',
          cursor: 'pointer'
        }}>
          ✈️ Telegram
        </a>
        <a href="https://vk.com/hhrecords24" target="_blank" className="btn btn-secondary" style={{
          background: 'transparent',
          border: '2px solid #bf953f',
          color: '#fcf6ba',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 18px',
          height: '42px',
          borderRadius: '50px',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          📱 VK
        </a>
        <a href="/" className="btn btn-secondary" style={{
          background: 'transparent',
          border: '2px solid #bf953f',
          color: '#fcf6ba',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0 18px',
          height: '42px',
          borderRadius: '50px',
          fontWeight: 600,
          fontSize: '0.85rem',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          🏠 На главную
        </a>
      </div>
      <p style={{
        marginTop: '16px',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        📍 Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311
      </p>
    </div>
  )
}

export default BrandBlock
