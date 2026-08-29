// app/page.tsx
import './page.css'

import FAQ from '@/components/home/FAQ'
import Carousel from '@/components/home/Carousel'
import Widgets from '@/components/home/Widgets'

export default function Home() {
  return (
    <>
      {/* ===== ГЕРОЙ ===== */}
      <section className="hero">
        <div className="container">
          <h1>Записать трек в Красноярске — студия звукозаписи HHRecords</h1>
          <div className="hero-accent"></div>
          <p className="hero-intro">
            HHRecords — профессиональная студия звукозаписи в Красноярске. Записываем треки (вокал, рэп, инструменты), делаем сведение треков и мастеринг. Работаем со всеми жанрами более 10 лет. Помогаем как профессиональным музыкантам, так и начинающим артистам.
          </p>
        </div>
      </section>

      {/* ===== КАК ВЫГЛЯДИТ НАША СТУДИЯ ===== */}
      <section className="media-section">
        <div className="container">
          <h2>Как выглядит наша студия</h2>
          <div className="media-grid">
            <div className="media-card" style={{ gridColumn: '1 / -1' }}>
              <Carousel />
            </div>
          </div>
        </div>
      </section>

      {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
      <div className="divider"></div>

      {/* ===== УСЛУГИ ===== */}
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

      {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
      <div className="divider"></div>

      {/* ===== ОБОРУДОВАНИЕ ===== */}
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

      {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
      <div className="divider"></div>

      {/* ===== ПРИМЕРЫ РАБОТ ===== */}
      <section className="playlist-section">
        <div className="container">
          <h2>Примеры работ</h2>
          <div className="playlist-wrapper">
            <div className="widget-box">
              <div id="vk_playlist_-79491923_2"></div>
              <div id="playlist-fallback" style={{ display: 'none', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🎵</p>
                <p>Загружаем плейлист...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
      <div className="divider"></div>

     {/* ===== ОТЗЫВЫ ===== */}
<section className="reviews-section">
  <div className="container">
    <h2>Отзывы клиентов</h2>
    <div className="reviews-wrapper">
      <div className="widget-box" style={{
        padding: '16px',
        maxHeight: '620px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
          flexShrink: 0
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text, #fff)' }}>
            ⭐ Что говорят клиенты
          </h3>
          <a
            href="https://go.2gis.com/XYibr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent, #f5c542)',
              textDecoration: 'none'
            }}
          >
            Все отзывы →
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {/* ОТЗЫВ 1 */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg3, #1a1a24)',
            borderRadius: '8px',
            border: '1px solid var(--border, rgba(255,255,255,0.04))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text, #fff)' }}>Елена Кожевникова</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3, #666)' }}>⭐⭐⭐⭐⭐</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2, #999)', lineHeight: '1.5', margin: '4px 0 6px' }}>
              Спасибо большое за помощь в создании подарка детям на свадьбу. Специалист Никита очень хорошо помогал в правильности как спеть, как лучше. Огромное спасибо)) рекомендую
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3, #666)' }}>
              <span>20 мая 2026</span>
            </div>
          </div>

          {/* ОТЗЫВ 2 */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg3, #1a1a24)',
            borderRadius: '8px',
            border: '1px solid var(--border, rgba(255,255,255,0.04))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text, #fff)' }}>Третьякова Диана</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3, #666)' }}>⭐⭐⭐⭐⭐</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2, #999)', lineHeight: '1.5', margin: '4px 0 6px' }}>
              Ну я однозначно ставлю 5 звезд, было бы больше — поставила бы! Пришла к Никите по рекомендациям друзей и знакомых, многие хвалили его, и оказалось, что совсем не зря. Мне очень понравилась атмосфера, как Никита меня подбадривал 😅 Записывала песню бабушке в подарок, очень довольна результатом, обязательно приду еще, опыт очень крутой 😎
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3, #666)' }}>
              <span>27 апреля 2026</span>
            </div>
          </div>

          {/* ОТЗЫВ 3 */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg3, #1a1a24)',
            borderRadius: '8px',
            border: '1px solid var(--border, rgba(255,255,255,0.04))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text, #fff)' }}>Диля Валеева</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3, #666)' }}>⭐⭐⭐⭐⭐</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2, #999)', lineHeight: '1.5', margin: '4px 0 6px' }}>
              Хочу выразить благодарность Никите! Записывала песню сестре на свадьбу. Я довольна, получилось супер 👍 Профессионально, быстро и качественно 👍👍👍
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3, #666)' }}>
              <span>20 апреля 2026</span>
            </div>
          </div>

          {/* ОТЗЫВ 4 */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg3, #1a1a24)',
            borderRadius: '8px',
            border: '1px solid var(--border, rgba(255,255,255,0.04))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text, #fff)' }}>Кристина С</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3, #666)' }}>⭐⭐⭐⭐⭐</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2, #999)', lineHeight: '1.5', margin: '4px 0 6px' }}>
              Большое спасибо Никите! Стойко выдержал наше кошачье пение 😅 и забабахал офигенную песню) 👍
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text3, #666)' }}>
              <span>3 февраля 2026</span>
            </div>
          </div>
        </div>

        <style>{`
          .widget-box::-webkit-scrollbar {
            width: 4px;
          }
          .widget-box::-webkit-scrollbar-thumb {
            background: var(--accent, #f5c542);
            border-radius: 2px;
          }
          .widget-box::-webkit-scrollbar-track {
            background: var(--bg3, #1a1a24);
          }
        `}</style>
      </div>
    </div>
  </div>
</section>

      {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
      <div className="divider"></div>

      {/* ===== КОНТАКТЫ ===== */}
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

      {/* ===== ВИДЖЕТЫ (ТОЛЬКО VK) ===== */}
      <Widgets />

      {/* ===== FAQ ===== */}
      <FAQ />
    </>
  )
}
