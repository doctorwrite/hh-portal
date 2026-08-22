import Link from 'next/link'

const SECTIONS = [
  {
    id: 'basics',
    icon: '📖',
    title: 'Основы звукозаписи',
    desc: 'Базовые термины для начинающих: эквализация, компрессия, реверберация и другие.',
    cssClass: 'basics',
    articles: [
      { id: 'eq', icon: '🎛️', title: 'Эквализация (EQ)', badge: '5 вопросов' },
      { id: 'compression', icon: '🎚️', title: 'Компрессия', badge: '5 вопросов' },
      { id: 'reverb', icon: '🌊', title: 'Реверберация (Reverb)', badge: '5 вопросов' },
      { id: 'delay', icon: '⏳', title: 'Дилей (Delay)', badge: '4 вопроса' },
      { id: 'stereo', icon: '🔊', title: 'Стереопанорама', badge: '5 вопросов' },
      { id: 'saturation', icon: '🔥', title: 'Сатурация', badge: '5 вопросов' },
      { id: 'limiter', icon: '📈', title: 'Лимитер', badge: '5 вопросов' },
    ],
  },
  {
    id: 'gear',
    icon: '🔧',
    title: 'Оборудование и инструменты',
    desc: 'Что нужно для работы: аудиоинтерфейс, MIDI, VST, мониторы и другое.',
    cssClass: 'gear',
    articles: [
      { id: 'audio-interface', icon: '🎧', title: 'Аудиоинтерфейс (Audio Interface)', badge: '4 вопроса' },
      { id: 'midi', icon: '🎹', title: 'MIDI (Musical Instrument Digital Interface)', badge: '4 вопроса' },
      { id: 'vst', icon: '🧩', title: 'VST / Плагины', badge: '4 вопроса' },
      { id: 'sample', icon: '🔊', title: 'Сэмпл (Sample)', badge: '3 вопроса' },
      { id: 'monitors', icon: '🔊', title: 'Мониторы для сведения', badge: '4 вопроса' },
      { id: 'midi-controller', icon: '🎹', title: 'Миди-контроллер', badge: '4 вопроса' },
    ],
  },
  {
    id: 'technical',
    icon: '⚙️',
    title: 'Технические параметры',
    desc: 'Цифровой звук и его параметры: битность, частота дискретизации, LUFS и другие.',
    cssClass: 'technical',
    articles: [
      { id: 'bit-depth', icon: '💾', title: 'Битность', badge: '3 вопроса' },
      { id: 'sample-rate', icon: '📊', title: 'Частота дискретизации', badge: '4 вопроса' },
      { id: 'lufs', icon: '📈', title: 'LUFS (громкость для стримингов)', badge: '4 вопроса' },
    ],
  },
  {
    id: 'processes',
    icon: '🎚️',
    title: 'Процессы и техники',
    desc: 'Как работает сведение, мастеринг, трекинг, монтаж и другие процессы.',
    cssClass: 'processes',
    articles: [
      { id: 'mixing', icon: '🎛️', title: 'Как работает сведение (Mixing)', badge: '4 вопроса' },
      { id: 'mastering', icon: '🎧', title: 'Как работает мастеринг (Mastering)', badge: '4 вопроса' },
    ],
  },
  {
    id: 'vocal',
    icon: '🎤',
    title: 'Вокал и инструменты',
    desc: 'Работа с голосом и инструментами: настройка EQ, сведение рэпа, рока и другие техники.',
    cssClass: 'vocal',
    articles: [
      { id: 'eq-vocal', icon: '🎛️', title: 'Как настроить эквалайзер под конкретный голос', badge: '3 вопроса' },
      { id: 'rap-vocal', icon: '🎤', title: 'Особенности сведения рэп-вокала', badge: '3 вопроса' },
    ],
  },
  {
    id: 'cases',
    icon: '🏠',
    title: 'Кейсы HHRecords',
    desc: 'Реальные проекты студии: философия, оборудование и примеры работ.',
    cssClass: 'cases',
    articles: [
      { id: 'philosophy', icon: '💡', title: 'Наша философия', badge: '3 вопроса' },
      { id: 'gear-case', icon: '⚙️', title: 'Наше оборудование', badge: '3 вопроса' },
    ],
  },
]

export default function Encyclopedia() {
  return (
    <div className="encyclopedia-container">
      <div className="breadcrumb">
        <a href="/">Главная</a>
        <span className="sep">›</span>
        <span className="current">Энциклопедия звукозаписи</span>
      </div>

      <div className="hero-encyclopedia">
        <h1>🎧 Энциклопедия звукозаписи</h1>
        <p>6 разделов, 50+ статей: основы, оборудование, технические параметры, процессы, работа с вокалом и кейсы от студии HHRecords.</p>
        <div className="hero-tags">
          <span className="hero-tag">📖 6 разделов</span>
          <span className="hero-tag">📌 50+ статей</span>
          <span className="hero-tag">⭐ 4.9 на основе 87 отзывов</span>
          <span className="hero-tag">🎚️ Студия в Красноярске с 2016</span>
        </div>
      </div>

      <div className="encyclopedia-sections-grid">
        {SECTIONS.map((section) => (
          <div key={section.id} className={`section-card ${section.cssClass}`}>
            <div className="card-header">
              <span className="icon">{section.icon}</span>
              <div className="title">
                <h2>{section.title}</h2>
              </div>
            </div>
            <div className="desc">{section.desc}</div>
            <span className="count">
              <strong>{section.articles.length}</strong> статей
            </span>
            <div className="articles-list">
              {section.articles.map((article) => (
                <div key={article.id} className="article-item">
                  <span className="art-icon">{article.icon}</span>
                  <span className="art-title">{article.title}</span>
                  <span className="art-badge">{article.badge}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="brand-block" id="contacts">
        <h2>🎧 HHRecords — студия звукозаписи в Красноярске и онлайн</h2>
        <p>Запись вокала, сведение, мастеринг. 10 лет опыта, оборудование премиум-класса (Neumann, Focal, Apollo).</p>
        <div className="btn-row">
          <a
            href="tel:+79138376772"
            className="btn"
            style={{
              background:
                'linear-gradient(135deg, var(--gold-start), var(--gold-mid), var(--gold-end))',
              color: '#000',
            }}
          >
            📞 Позвонить
          </a>
          <a
            href="https://t.me/Nickkrsk"
            className="btn"
            style={{
              background: 'linear-gradient(135deg,#0088cc,#005f8a)',
              color: '#fff',
            }}
          >
            ✈️ Telegram
          </a>
          <a
            href="https://vk.com/hhrecords24"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              background: 'transparent',
              border: '2px solid var(--gold-start)',
              color: 'var(--gold-start)',
            }}
          >
            📱 VK
          </a>
          <a
            href="/"
            className="btn btn-secondary"
            style={{
              background: 'transparent',
              border: '2px solid var(--gold-start)',
              color: 'var(--gold-start)',
            }}
          >
            🏠 На главную
          </a>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          📍 Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311
        </p>
      </div>
    </div>
  )
}