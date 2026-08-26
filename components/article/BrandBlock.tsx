// components/article/BrandBlock.tsx

const BrandBlock: React.FC = () => {
  return (
    <div className="brand-block" id="contacts">
      <h2>🎧 HHRecords — студия звукозаписи</h2>
      <div style={{ color: '#4a9eff', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.5px' }}>
        🌐 Работаем очно и онлайн по всей России
      </div>
      <p>Запись вокала, сведение, мастеринг. 10 лет опыта, оборудование премиум-класса (Neumann, Focal, Apollo).</p>
      <div className="btn-row">
        <a href="tel:+79138376772" className="btn" style={{ background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728)', color: '#000' }}>
          📞 Позвонить
        </a>
        <a href="https://t.me/Nickkrsk" className="btn" style={{ background: 'linear-gradient(135deg,#0088cc,#005f8a)', color: '#fff' }}>
          ✈️ Telegram
        </a>
        <a href="https://vk.com/hhrecords24" target="_blank" className="btn btn-secondary" style={{ background: 'transparent', border: '2px solid #bf953f', color: '#fcf6ba' }}>
          📱 VK
        </a>
        <a href="/" className="btn btn-secondary" style={{ background: 'transparent', border: '2px solid #bf953f', color: '#fcf6ba' }}>
          🏠 На главную
        </a>
      </div>
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        📍 Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311
      </p>
    </div>
  )
}

export default BrandBlock