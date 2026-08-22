// app/encyclopedia/page.tsx
'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

// ===== ДАННЫЕ =====
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
      { id: 'bitrate', icon: '📈', title: 'Битрейт (Bitrate)', badge: '3 вопроса' },
      { id: 'filter', icon: '🔄', title: 'Фильтр (HPF, LPF)', badge: '4 вопроса' },
      { id: 'clipping', icon: '⚠️', title: 'Цифровой клиппинг: что это и как избежать', badge: '3 вопроса' },
      { id: 'phase', icon: '🔄', title: 'Фазокоррекция', badge: '4 вопроса' },
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
      { id: 'tracking', icon: '🎙️', title: 'Трекинг (Tracking) — как проходит запись', badge: '4 вопроса' },
      { id: 'editing', icon: '✂️', title: 'Монтаж (Editing) — склейка и правка', badge: '4 вопроса' },
      { id: 'automation', icon: '⚡', title: 'Автоматизация в сведении', badge: '4 вопроса' },
      { id: 'prepare-tracks', icon: '📂', title: 'Как подготовить дорожки для сведения', badge: '4 вопроса' },
      { id: 'vocal-mix-minus', icon: '🎤', title: 'Сведение голоса с минусом', badge: '4 вопроса' },
      { id: 'parallel-compression', icon: '📊', title: 'Параллельная компрессия', badge: '5 вопросов' },
      { id: 'sidechain', icon: '🔗', title: 'Сайд-чейн', badge: '4 вопроса' },
      { id: 'depth-width', icon: '🌐', title: 'Как создать ширину и глубину в миксе', badge: '4 вопроса' },
      { id: 'recording-mistakes', icon: '❌', title: 'Ошибки в записи, которые убивают сведение', badge: '3 вопроса' },
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
      { id: 'vocal-processing', icon: '🎤', title: 'Продвинутая обработка вокала', badge: '4 вопроса' },
      { id: 'rock-guitar', icon: '🎸', title: 'Особенности сведения рока и металла', badge: '3 вопроса' },
      { id: 'bass-mixing', icon: '🔊', title: 'Как добиться плотного баса в миксе', badge: '3 вопроса' },
      { id: 'harmonics', icon: '🎵', title: 'Гармоники', badge: '4 вопроса' },
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
      { id: 'case1', icon: '🎤', title: 'Кейс: как мы спасли трек с плохим вокалом', badge: '3 вопроса' },
      { id: 'case2', icon: '🎸', title: 'Кейс: как мы спасли трек с плохим гитарным звуком', badge: '2 вопроса' },
      { id: 'case3', icon: '🎧', title: 'Кейс: мастеринг за 2 часа (срочный заказ)', badge: '2 вопроса' },
      { id: 'case4', icon: '🎵', title: 'Кейс: как мы работали с рэп-исполнителем', badge: '3 вопроса' },
      { id: 'case5', icon: '🎛️', title: 'Кейс: работа с "сырым" материалом', badge: '3 вопроса' },
      { id: 'case6', icon: '🔊', title: 'Кейс: создание "полного" и мощного звука', badge: '3 вопроса' },
    ],
  },
]

export default function Encyclopedia() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const copyLink = () => {
    navigator.clipboard.writeText('https://hiphoprecords.ru/encyclopedia/')
    alert('Ссылка скопирована!')
  }

  // ===== ПОИСК + ФИЛЬТР =====
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return selectedSection
        ? SECTIONS.filter((s) => s.id === selectedSection)
        : SECTIONS
    }

    const query = searchQuery.toLowerCase().trim()
    return SECTIONS.map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          section.title.toLowerCase().includes(query)
      ),
    })).filter((section) => section.articles.length > 0)
  }, [searchQuery, selectedSection])

  const totalArticles = SECTIONS.reduce((acc, s) => acc + s.articles.length, 0)

  return (
    <div className="encyclopedia-container" id="main-content">
      {/* ===== ХЛЕБНЫЕ КРОШКИ ===== */}
      <nav className="breadcrumb" aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span className="sep" aria-hidden="true">›</span>
        <span className="current">Энциклопедия звукозаписи</span>
      </nav>

      {/* ===== ГЕРОЙ ===== */}
      <header className="hero-encyclopedia">
        <h1>🎧 Энциклопедия звукозаписи</h1>
        <p>
          Полный гид по звукозаписи, сведению и мастерингу. 
          <strong> {totalArticles} статей</strong> по эквализации, компрессии, реверберации, 
          оборудованию и вокалу. Создано для музыкантов и звукорежиссёров.
        </p>
        <div className="hero-tags">
          <span className="hero-tag">📖 6 разделов</span>
          <span className="hero-tag">📌 {totalArticles} статей</span>
          <span className="hero-tag">⭐ 4.9 на основе 87 отзывов</span>
          <span className="hero-tag">🎚️ Студия в Красноярске с 2016</span>
          <span className="hero-tag">📚 Ссылки на источники</span>
        </div>
      </header>

      {/* ===== ДАТА ОБНОВЛЕНИЯ ===== */}
      <div className="update-date">
        📅 Обновлено: <strong>8 июля 2026</strong>
      </div>

      {/* ===== СТАТИСТИКА ===== */}
      <section className="encyclopedia-stats" aria-label="Статистика энциклопедии">
        <div className="stat">
          <span className="num">6</span>
          <span className="label">Разделов</span>
        </div>
        <div className="stat">
          <span className="num">50+</span>
          <span className="label">Статей</span>
        </div>
        <div className="stat">
          <span className="num">30+</span>
          <span className="label">Терминов</span>
        </div>
        <div className="stat">
          <span className="num">15+</span>
          <span className="label">Процессов</span>
        </div>
      </section>

      {/* ===== О ЭНЦИКЛОПЕДИИ ===== */}
      <section className="about-encyclopedia">
        <p>
          <strong>Энциклопедия звукозаписи HHRecords</strong> — это полный гид по звукозаписи, сведению и мастерингу. 
          Мы собрали <strong>{totalArticles} статей</strong> в <strong>6 разделах</strong>: 
          от базовых терминов до продвинутых техник и реальных кейсов.
        </p>
        <p>
          Все статьи содержат определения, примеры, советы и ссылки на источники. 
          Энциклопедия создана для музыкантов, вокалистов и звукорежиссёров, 
          которые хотят разобраться в звукозаписи.
        </p>
      </section>

      {/* ===== ССЫЛКИ НА РАЗДЕЛЫ ===== */}
      <nav className="section-links" aria-label="Навигация по разделам">
        <span className="section-links-title">📌 Перейти к разделу:</span>
        <a href="#basics">Основы</a>
        <a href="#gear">Оборудование</a>
        <a href="#technical">Параметры</a>
        <a href="#processes">Процессы</a>
        <a href="#vocal">Вокал</a>
        <a href="#cases">Кейсы</a>
      </nav>

      {/* ===== ПОДЕЛИТЬСЯ ===== */}
      <div className="share-top">
        <span className="share-label">📤 Поделиться энциклопедией:</span>
        <a
          href="https://vk.com/share.php?url=https://hiphoprecords.ru/encyclopedia/"
          target="_blank"
          rel="noopener noreferrer"
          className="share-vk"
          aria-label="Поделиться в ВКонтакте"
        >
          VK
        </a>
        <a
          href="https://t.me/share/url?url=https://hiphoprecords.ru/encyclopedia/"
          target="_blank"
          rel="noopener noreferrer"
          className="share-tg"
          aria-label="Поделиться в Telegram"
        >
          Telegram
        </a>
        <button
          className="share-copy"
          onClick={copyLink}
          aria-label="Копировать ссылку на энциклопедию"
        >
          📋 Копировать
        </button>
      </div>

      {/* ===== ЧАСТО ИЩУТ ===== */}
      <section className="popular-terms" aria-label="Популярные термины">
        <div className="popular-title">🔥 Часто ищут:</div>
        <div className="popular-list">
          <Link href="/encyclopedia/eq">Эквализация (EQ)</Link>
          <Link href="/encyclopedia/compression">Компрессия</Link>
          <Link href="/encyclopedia/reverb">Реверберация</Link>
          <Link href="/encyclopedia/delay">Дилей</Link>
          <Link href="/encyclopedia/saturation">Сатурация</Link>
          <Link href="/encyclopedia/limiter">Лимитер</Link>
          <Link href="/encyclopedia/audio-interface">Аудиоинтерфейс</Link>
          <Link href="/encyclopedia/midi">MIDI</Link>
        </div>
      </section>

      {/* ===== ПОИСК ===== */}
      <div className="search-box">
        <label htmlFor="searchInput" className="sr-only">
          Поиск по энциклопедии
        </label>
        <input
          id="searchInput"
          type="text"
          placeholder="🔍 Поиск по энциклопедии..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Поиск по энциклопедии"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      {/* ===== ФИЛЬТР ПО РАЗДЕЛАМ ===== */}
      <div className="section-filter">
        <button
          className={`filter-btn ${!selectedSection ? 'active' : ''}`}
          onClick={() => setSelectedSection(null)}
        >
          Все разделы
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`filter-btn ${selectedSection === s.id ? 'active' : ''}`}
            onClick={() => setSelectedSection(s.id)}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {/* ===== СЕТКА РАЗДЕЛОВ ===== */}
      <div className="encyclopedia-sections-grid">
        {filteredSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={`section-card ${section.cssClass}`}
            aria-labelledby={`heading-${section.id}`}
          >
            <div className="card-header">
              <span className="icon" aria-hidden="true">{section.icon}</span>
              <div className="title">
                <h2 id={`heading-${section.id}`}>{section.title}</h2>
              </div>
            </div>
            <div className="desc">{section.desc}</div>
            <span className="count">
              <strong>{section.articles.length}</strong> статей
            </span>
            <ul className="articles-list" role="list">
              {section.articles.map((article) => (
                <li key={article.id} role="listitem">
                  <Link
                    href={`/encyclopedia/${article.id}`}
                    className="article-item"
                  >
                    <span className="art-icon" aria-hidden="true">{article.icon}</span>
                    <h3 className="art-title">{article.title}</h3>
                    <span className="art-badge">{article.badge}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* ===== БРЕНДОВЫЙ БЛОК ===== */}
      <section className="brand-block" id="contacts" aria-label="Контакты студии">
        <h2>🎧 HHRecords — студия звукозаписи в Красноярске и онлайн</h2>
        <p>
          Запись вокала, сведение, мастеринг. 10 лет опыта, 
          оборудование премиум-класса (Neumann, Focal, Apollo).
        </p>
        <p>
          Работаем очно и удалённо из любого города. 
          Присылайте треки — мы сделаем звук профессиональным.
        </p>
        <div className="btn-row">
          <a
            href="tel:+79138376772"
            className="btn"
            style={{
              background: 'linear-gradient(135deg, var(--gold-start), var(--gold-mid), var(--gold-end))',
              color: '#000',
            }}
            aria-label="Позвонить в студию"
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
            aria-label="Написать в Telegram"
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
            aria-label="Группа ВКонтакте"
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
      </section>
    </div>
  )
}
