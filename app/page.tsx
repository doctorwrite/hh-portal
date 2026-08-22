import Link from 'next/link'
import FAQ from '@/components/home/FAQ'

export default function Home() {
  return (
    <>
      {/* ГЕРОЙ */}
      <section className="hero">
        <div className="container">
          <h1>Записать трек в Красноярске — студия звукозаписи HHRecords</h1>
          <div className="hero-accent"></div>
          <p className="hero-intro">
            HHRecords — профессиональная студия звукозаписи в Красноярске. Записываем треки (вокал, рэп, инструменты), делаем сведение треков и мастеринг. Работаем со всеми жанрами более 10 лет. Помогаем как профессиональным музыкантам, так и начинающим артистам.
          </p>
        </div>
      </section>

      {/* УСЛУГИ */}
      <section id="services">
        <div className="container">
          <h2>Услуги</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>🎙️ Запись вокала, рэпа и инструментов</h3>
              <div className="price">1 500 ₽<span className="price-sub">/ час</span></div>
              <ul className="service-list">
                <li>Запись голоса под бит или с живыми инструментами</li>
                <li>Неограниченные дубли</li>
                <li>Помощь звукорежиссёра</li>
                <li>WAV 24-bit сразу</li>
              </ul>
            </div>
            <div className="service-card">
              <h3>🎚️ Сведение треков и мастеринг</h3>
              <div className="price">от 5 000 ₽<span className="price-sub">/ трек</span></div>
              <ul className="service-list">
                <li>Профессиональная обработка</li>
                <li>Эквализация, компрессия</li>
                <li>Auto-Tune, выравнивание нот</li>
                <li>Подготовка к релизу</li>
              </ul>
            </div>
            <div className="service-card">
              <h3>⚙️ Дополнительные услуги</h3>
              <div className="price">Договорная</div>
              <ul className="service-list">
                <li>Написание текста, минуса</li>
                <li>Съемка, монтаж видео</li>
                <li>Песня в подарок (под ключ)</li>
                <li>Подарочный сертификат</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ОБОРУДОВАНИЕ */}
      <section className="equipment-section">
        <div className="container">
          <h2>Оборудование</h2>
          <div className="equipment-list">
            <div className="equipment-item">
              <div className="eq-icon">🎙️</div>
              <div className="eq-content">
                <h3>Neumann TLM 103</h3>
                <p>Универсальный конденсаторный микрофон премиум-класса с ровной частотной характеристикой. Подходит для любого голоса и акустических инструментов.</p>
              </div>
            </div>
            <div className="equipment-item">
              <div className="eq-icon">🔊</div>
              <div className="eq-content">
                <h3>Focal Solo6 Be</h3>
                <p>Студийные мониторы для максимально точного контроля звука. Позволяют слышать каждый нюанс в миксе.</p>
              </div>
            </div>
            <div className="equipment-item">
              <div className="eq-icon">🎚️</div>
              <div className="eq-content">
                <h3>UA Apollo Twin</h3>
                <p>Профессиональный аудиоинтерфейс с DSP-процессорами для обработки звука в реальном времени.</p>
              </div>
            </div>
            <div className="equipment-item">
              <div className="eq-icon">🎧</div>
              <div className="eq-content">
                <h3>Акустика помещения</h3>
                <p>Профессиональная акустическая обработка помещения: звукопоглощающие панели, диффузоры, бас-ловушки. Обеспечивает чистую запись без эха и искажений.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* КОНТАКТЫ */}
      <section className="contacts-section" id="contacts">
        <div className="container">
          <h2>Контакты</h2>
          <div className="contacts-wrapper">
            <div className="contacts-list">
              <div className="contact-row">
                <span className="icon">📍</span>
                <div>
                  <span className="label">Адрес</span>
                  <span className="value">Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311</span>
                </div>
              </div>
              <div className="contact-row">
                <span className="icon">📞</span>
                <div>
                  <span className="label">Связь</span>
                  <span className="value">
                    <a href="tel:+79138376772">+7 (913) 837-67-72</a>
                    <br />
                    <a href="https://vk.com/hhrecords24" target="_blank" rel="noopener noreferrer">VK</a> •
                    <a href="tg://resolve?domain=Nickkrsk">Telegram</a>
                  </span>
                </div>
              </div>
              <div className="contact-row">
                <span className="icon">⏰</span>
                <div>
                  <span className="label">Режим работы</span>
                  <span className="value">Ежедневно 10:00 — 22:00<br />По предварительной записи</span>
                </div>
              </div>
            </div>
            <div className="map-container">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=92.897114%2C56.025544&z=16&pt=92.897114%2C56.025544%2Cpm2rdm&l=map"
                allowFullScreen
                loading="lazy"
                title="Карта проезда к студии"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </>
  )
}
