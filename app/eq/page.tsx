// app/eq/page.tsx
import './page.css'

import EQWrapper from '@/components/EQWrapper'
import { Metadata } from 'next'

// ===== МЕТАДАННЫЕ =====
export const metadata: Metadata = {
  title: '🎛️ Онлайн-эквалайзер — обработка звука в браузере (8 полос, захват аудио) | HHRecords',
  description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор. Обрезка, нормализация, Fade In/Out, Реверс, изменение скорости. Бесплатно, прямо в браузере.',
  keywords: [
    'онлайн эквалайзер',
    'эквалайзер для музыки',
    'сведение треков',
    'мастеринг онлайн',
    'обработка аудио',
    'EQ для вокала',
    'спектроанализатор',
    'аудиоредактор онлайн',
    'частотный баланс',
    'динамический эквалайзер',
    'захват системного звука',
    'обрезка аудио онлайн',
    'нормализация звука онлайн',
    'бесплатный эквалайзер',
    'эквалайзер в браузере',
  ],
  openGraph: {
    title: '🎛️ Онлайн-эквалайзер — профессиональная обработка звука в браузере',
    description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор. Обрезка, нормализация, Fade In/Out, Реверс, изменение скорости. Бесплатно, прямо в браузере.',
    url: 'https://hiphoprecords.ru/eq',
    siteName: 'HHRecords',
    images: [
      {
        url: 'https://hiphoprecords.ru/eq/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Онлайн-эквалайзер HHRecords — 8 полос, захват аудио, спектроанализатор',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎛️ Онлайн-эквалайзер HHRecords — обработка звука в браузере',
    description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Бесплатно.',
    images: ['https://hiphoprecords.ru/eq/opengraph-image'],
  },
  alternates: {
    canonical: 'https://hiphoprecords.ru/eq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// ===== JSON-LD (микроразметка для AI и поисковиков) =====
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Онлайн-эквалайзер HHRecords',
  description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор. Обрезка, нормализация, Fade In/Out, Реверс, изменение скорости. Бесплатно, прямо в браузере.',
  applicationCategory: 'Multimedia',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript and Web Audio API',
  url: 'https://hiphoprecords.ru/eq',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'RUB',
  },
  author: {
    '@type': 'Organization',
    name: 'HHRecords',
    url: 'https://hiphoprecords.ru',
  },
  featureList: [
    '8 полос параметрического эквалайзера',
    '7 типов фильтров (Bell, Low Shelf, High Shelf, Low Cut, High Cut, Notch, Band Pass)',
    'Динамический EQ с компрессией на каждой полосе',
    'Режимы Stereo, Mid, Side, Left, Right',
    'Захват звука с микрофона',
    'Захват системного звука (вкладки/окна)',
    'Загрузка аудиофайлов (MP3, WAV, FLAC, AAC, OGG)',
    'Спектроанализатор в реальном времени',
    'VU-метры (вход/выход)',
    'Peak Hold — удержание пиков',
    'Обрезка аудио (Trim)',
    'Fade In/Out',
    'Нормализация громкости',
    'Реверс аудио',
    'Изменение скорости',
    'Экспорт в WAV и MP3',
    'Сохранение пресетов',
    'A/B сравнение',
    'Delta-режим (сравнение с оригиналом)',
    'Auto-Gain (автоматическая компенсация громкости)',
    'Soft Clip (мягкое ограничение пиков)',
    'Горячие клавиши',
  ],
}

export default function EQPage() {
  return (
    <>
      {/* ===== МИКРОРАЗМЕТКА ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        <div className="eq-page">
          {/* ===== H1 ===== */}
          <h1>Онлайн-эквалайзер — профессиональная обработка звука в браузере</h1>

          {/* ===== САМ ЭКВАЛАЙЗЕР ===== */}
          <div className="hh-eq-container">
            <div className="eq-widget-wrapper">
              <div className="eq-widget-glow"></div>
              <EQWrapper theme="dark" />
            </div>
          </div>

          {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
          <div className="divider"></div>

          {/* ===== ОПИСАНИЕ ВОЗМОЖНОСТЕЙ ===== */}
          <section className="eq-features">
            <h2>Захват аудио из любых источников</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">🎤</span>
                <h3>Микрофон</h3>
                <p>Записывайте голос напрямую с микрофона в реальном времени. Идеально для вокалистов, подкастеров и спикеров.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔊</span>
                <h3>Системный звук</h3>
                <p>Захватывайте звук из вкладок браузера, окон приложений или всей системы. Отлично для обработки музыки и видео.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📁</span>
                <h3>Загрузка файлов</h3>
                <p>Поддерживаются MP3, WAV, FLAC, AAC, OGG. Загружайте готовые треки и обрабатывайте их в реальном времени.</p>
              </div>
            </div>

            <h2>Профессиональные инструменты для обработки</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">🎛️</span>
                <h3>8 полос EQ</h3>
                <p>Добавляйте до 8 полос параметрического эквалайзера. Настраивайте частоту, усиление и Q для каждой полосы.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔄</span>
                <h3>7 типов фильтров</h3>
                <p>Bell, Low Shelf, High Shelf, Low Cut, High Cut, Notch, Band Pass — все популярные типы фильтров в одном инструменте.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h3>Динамический EQ</h3>
                <p>Включайте компрессию на каждой полосе — автоматическое сжатие частот при превышении порога.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔊</span>
                <h3>Mid/Side режим</h3>
                <p>Обрабатывайте центр (Mid) и бока (Side) независимо. Создавайте ширину и глубину в миксе.</p>
              </div>
            </div>

            <h2>Эффекты для аудио</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">✂️</span>
                <h3>Обрезка (Trim)</h3>
                <p>Выделите нужный фрагмент аудио и удалите всё остальное. Быстрая обрезка без дополнительных программ.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🌊</span>
                <h3>Fade In/Out</h3>
                <p>Добавьте плавное появление и затухание. Настройте длительность и тип кривой (линейный, экспоненциальный, синусоидальный).</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h3>Нормализация</h3>
                <p>Выровняйте громкость до целевого уровня. Выберите пиковый или RMS-тип нормализации.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔄</span>
                <h3>Реверс</h3>
                <p>Воспроизведите аудио в обратном порядке. Создавайте креативные эффекты и необычные звуковые решения.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">⏱️</span>
                <h3>Изменение скорости</h3>
                <p>Ускоряйте или замедляйте аудио. Идеально для экспериментов с темпом и высотой тона.</p>
              </div>
            </div>

            <h2>Визуализация в реальном времени</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📈</span>
                <h3>Спектроанализатор</h3>
                <p>Визуализация частот в реальном времени. Помогает точно настраивать EQ и видеть результат.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h3>VU-метры</h3>
                <p>Контроль входного и выходного уровня сигнала. Красный индикатор предупреждает о клиппинге.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">📈</span>
                <h3>Peak Hold</h3>
                <p>Удержание пиковых значений на спектре. Помогает отслеживать максимальные уровни частот.</p>
              </div>
            </div>

            <h2>Экспорт и сохранение</h2>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">💾</span>
                <h3>Сохранить WAV</h3>
                <p>Экспорт обработанного аудио в WAV — формат без сжатия для максимального качества.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💾</span>
                <h3>Сохранить MP3</h3>
                <p>Экспорт в MP3 — сжатый формат для публикации в соцсетях и стримингах.</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">⏺</span>
                <h3>Запись с микрофона</h3>
                <p>Записывайте обработанный звук в реальном времени. Идеально для подкастов и вокальных записей.</p>
              </div>
            </div>
          </section>

          {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
          <div className="divider"></div>

          {/* ===== КАК ПОЛЬЗОВАТЬСЯ ===== */}
          <section className="eq-guide">
            <div className="container">
              <h2>Как пользоваться онлайн-эквалайзером</h2>

              <div className="guide-grid">
                <div className="guide-card">
                  <span className="guide-icon">1</span>
                  <h3>Загрузите аудио</h3>
                  <p>
                    Нажмите кнопку <strong>🎤 Микрофон</strong>, <strong>🔊 Системный звук</strong> или <strong>📁 Файл</strong>
                    и выберите источник.
                  </p>
                  <ul>
                    <li>Поддерживаются: MP3, WAV, FLAC, AAC, OGG</li>
                    <li>Запись с микрофона в реальном времени</li>
                    <li>Захват системного звука (вкладки или окна)</li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-icon">2</span>
                  <h3>Добавьте полосы</h3>
                  <p>
                    Кликните на график — появится новая полоса. Перетаскивайте её,
                    чтобы изменить <strong>частоту</strong> и <strong>усиление</strong>.
                  </p>
                  <ul>
                    <li>Максимум <strong>8 полос</strong> одновременно</li>
                    <li>Выберите тип фильтра: Bell, LowSh, HiSh, L-Cut, H-Cut, Notch, Band</li>
                    <li>Настройте Q (ширину полосы)</li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-icon">3</span>
                  <h3>Настройте параметры</h3>
                  <p>
                    Используйте панель управления для точной настройки каждой полосы:
                  </p>
                  <ul>
                    <li><strong>F</strong> — частота (от 20 Гц до 20 кГц)</li>
                    <li><strong>G</strong> — усиление (от -20 дБ до +20 дБ)</li>
                    <li><strong>Q</strong> — добротность (от 0.1 до 10)</li>
                    <li><strong>Режим</strong> — Stereo, Mid, Side, Left, Right</li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-icon">4</span>
                  <h3>Примените эффекты</h3>
                  <p>
                    В меню <strong>🎛️ Эффекты</strong> доступны мощные инструменты:
                  </p>
                  <ul>
                    <li><strong>Обрезка</strong> — удаление фрагментов</li>
                    <li><strong>Fade In/Out</strong> — плавное затухание</li>
                    <li><strong>Нормализация</strong> — выравнивание громкости</li>
                    <li><strong>Реверс</strong> — обратное воспроизведение</li>
                    <li><strong>Скорость</strong> — ускорение или замедление</li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-icon">5</span>
                  <h3>Визуализация и контроль</h3>
                  <p>
                    Следите за звуком в реальном времени:
                  </p>
                  <ul>
                    <li><strong>Спектроанализатор</strong> — визуализация частот</li>
                    <li><strong>VU-метры</strong> — входной и выходной уровень</li>
                    <li><strong>Peak Hold</strong> — запись пиковых значений</li>
                  </ul>
                </div>

                <div className="guide-card">
                  <span className="guide-icon">6</span>
                  <h3>Сохраните результат</h3>
                  <p>
                    Экспортируйте обработанное аудио в нужном формате:
                  </p>
                  <ul>
                    <li><strong>WAV</strong> — для профессионального использования</li>
                    <li><strong>MP3</strong> — для публикации в соцсетях</li>
                    <li><strong>Запись с микрофона</strong> — с эффектами в реальном времени</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
          <div className="divider"></div>

          {/* ===== ГОРЯЧИЕ КЛАВИШИ ===== */}
          <section className="eq-shortcuts">
            <div className="container">
              <h2>Горячие клавиши для быстрой работы</h2>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <span className="key">Space</span>
                  <span className="action">Play / Пауза</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">R</span>
                  <span className="action">Режим обрезки</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Ctrl+Z</span>
                  <span className="action">Отменить эффект</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Ctrl+Y</span>
                  <span className="action">Повторить эффект</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">B</span>
                  <span className="action">Bypass (Обход)</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">A</span>
                  <span className="action">A/B сравнение</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">Delete</span>
                  <span className="action">Удалить выбранную полосу</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">← →</span>
                  <span className="action">Изменение частоты</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">↑ ↓</span>
                  <span className="action">Изменение усиления</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">[ ]</span>
                  <span className="action">Изменение Q (добротности)</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">1-8</span>
                  <span className="action">Выбор полосы</span>
                </div>
                <div className="shortcut-item">
                  <span className="key">?</span>
                  <span className="action">Показать горячие клавиши</span>
                </div>
              </div>
            </div>
          </section>

          {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
          <div className="divider"></div>

          {/* ===== ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ ===== */}
          <section className="eq-faq">
            <div className="container">
              <h2>Часто задаваемые вопросы об онлайн-эквалайзере</h2>

              <div className="faq-grid eq-faq-grid">
                <div className="faq-card">
                  <div className="faq-question">
                    Как записать звук с микрофона в эквалайзере?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Нажмите кнопку <strong>🎤 Микрофон</strong> в разделе "Источник звука". Разрешите доступ к микрофону в браузере. Начните говорить — звук появится на графике. Включите запись кнопкой <strong>⏺ Запись</strong>.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Как захватить системный звук (из вкладки/окна)?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Нажмите <strong>🔊 Системный звук</strong> (или <strong>🎵 Источник</strong> → <strong>Системный звук</strong>). Выберите вкладку или окно, которое хотите записать. Разрешите доступ, и звук начнёт передаваться в эквалайзер.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Как обрезать аудио в эквалайзере?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Нажмите <strong>🎛️ Эффекты</strong> → <strong>Обрезка</strong> (или клавиша <strong>R</strong>). На таймлайне появятся маркеры. Перетащите их, чтобы выделить нужный фрагмент. Нажмите <strong>✅ Применить</strong>.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Что такое Delta-режим в эквалайзере?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Delta-режим показывает разницу между обработанным и исходным сигналом. Это помогает слышать, что именно меняет эквалайзер. Включите в меню <strong>⚙ Настройки</strong> → <strong>🌀 Delta</strong>.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Как сохранить обработанное аудио в WAV или MP3?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Нажмите <strong>⚙ Настройки</strong> → <strong>💾 Сохранить WAV</strong> или <strong>💾 Сохранить MP3</strong>. Файл скачается на ваш компьютер.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Что такое динамический EQ и как его использовать?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Динамический EQ автоматически изменяет усиление полосы в зависимости от уровня сигнала. Нажмите <strong>D</strong> на панели полосы, затем настройте параметры: Threshold (порог), Ratio (соотношение), Attack и Release.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Работает ли эквалайзер с MIDI-контроллерами?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Да, эквалайзер поддерживает управление с MIDI-контроллеров. Подключите контроллер, и вы сможете управлять полосами, громкостью и другими параметрами в реальном времени.
                  </div>
                </div>

                <div className="faq-card">
                  <div className="faq-question">
                    Бесплатный ли это онлайн-эквалайзер?
                    <span className="faq-icon">+</span>
                  </div>
                  <div className="faq-answer">
                    Да, эквалайзер HHRecords полностью бесплатный. Все функции доступны без ограничений: 8 полос, эффекты, захват аудио, экспорт в WAV и MP3.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
          <div className="divider"></div>

          {/* ===== СЕО-ТЕКСТ ===== */}
          <section className="seo-text">
            <div className="container">
              <h2>🎛️ Профессиональный онлайн-эквалайзер для музыки, вокала и подкастов</h2>
              <p>
                <strong>Онлайн-эквалайзер HHRecords</strong> — это мощный инструмент
                для обработки звука, доступный прямо в браузере. Используйте его для
                <strong>сведения треков</strong>, <strong>мастеринга</strong>,
                подготовки вокала и инструментов. Работает с файлами, микрофоном
                и системным звуком.
              </p>
              <p>
                <strong>Основные возможности:</strong> до 8 полос эквалайзера,
                7 типов фильтров, динамический EQ, спектроанализатор, запись,
                экспорт в WAV/MP3, сохранение пресетов. Подходит для начинающих
                и профессиональных звукорежиссёров.
              </p>
              <p>
                <strong>Как использовать:</strong> загрузите аудио → добавьте полосы →
                настройте частоты → примените эффекты → сохраните результат.
                Все функции интуитивно понятны и сопровождаются визуальной обратной связью.
              </p>
              <p>
                <strong>Студия HHRecords</strong> — профессиональная студия звукозаписи
                в Красноярске. Если вам нужна помощь со сведением или мастерингом —
                обращайтесь, мы сделаем ваш звук профессиональным.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
