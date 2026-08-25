// app/eq/page.tsx
import './page.css'

import EQWrapper from '@/components/EQWrapper'
import { Metadata } from 'next'

// ===== METADATA =====
export const metadata: Metadata = {
  title: '🎛️ Онлайн-эквалайзер для музыки — сведение, мастеринг, обработка аудио | HHRecords',
  description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор. Бесплатно, прямо в браузере.',
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
    'динамический эквалайзер'
  ],
  openGraph: {
    title: '🎛️ Онлайн-эквалайзер для музыки — профессиональная обработка звука',
    description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор. Бесплатно, прямо в браузере.',
    url: 'https://hiphoprecords.ru/eq',
    siteName: 'HHRecords',
    images: [
      {
        url: '/images/og-eq.webp',
        width: 1200,
        height: 630,
        alt: 'Онлайн-эквалайзер HHRecords'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎛️ Онлайн-эквалайзер HHRecords',
    description: 'Профессиональный онлайн-эквалайзер с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор.'
  },
  alternates: {
    canonical: 'https://hiphoprecords.ru/eq'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

// ===== JSON-LD (микроразметка для AI) =====
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'Онлайн-эквалайзер HHRecords',
  'description': 'Профессиональный онлайн-эквалайзер для музыки с поддержкой файлов, микрофона и системного звука. Настройка частот, динамический EQ, спектроанализатор.',
  'applicationCategory': 'Multimedia',
  'operatingSystem': 'All',
  'browserRequirements': 'Requires JavaScript and Web Audio API',
  'url': 'https://hiphoprecords.ru/eq',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'RUB'
  },
  'author': {
    '@type': 'Organization',
    'name': 'HHRecords'
  }
}

export default function EQPage() {
  return (
    <>
      {/* ===== МИКРОРАЗМЕТКА ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="eq-page">
        {/* ===== ЗАГОЛОВОК ===== */}
        <div className="eq-page-title">
          <span>🎛️ Онлайн-эквалайзер</span>
        </div>

        {/* ===== САМ ЭКВАЛАЙЗЕР ===== */}
        <div className="hh-eq-container">
          <EQWrapper theme="dark" />
        </div>

        {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
        <div className="divider"></div>

        {/* ===== КАК ИСПОЛЬЗОВАТЬ ЭКВАЛАЙЗЕР ===== */}
        <section className="eq-guide">
          <div className="container">
            <h2>Как пользоваться эквалайзером</h2>

            <div className="guide-grid">
              {/* Блок 1 */}
              <div className="guide-card">
                <span className="guide-icon">1</span>
                <h3>Загрузите аудио</h3>
                <p>
                  Нажмите кнопку <strong>📁 Файл</strong> или <strong>🎤 Источник</strong> 
                  и выберите микрофон, системный звук или загрузите файл.
                </p>
                <ul>
                  <li>Поддерживаются: MP3, WAV, FLAC, AAC, OGG</li>
                  <li>Можно записать голос через микрофон</li>
                  <li>Захват системного звука (вкладки или окна)</li>
                </ul>
              </div>

              {/* Блок 2 */}
              <div className="guide-card">
                <span className="guide-icon">2</span>
                <h3>Добавьте полосы</h3>
                <p>
                  Кликните на график — появится новая полоса. Перетаскивайте её, 
                  чтобы изменить <strong>частоту</strong> и <strong>усиление</strong>.
                </p>
                <ul>
                  <li>Максимум <strong>8 полос</strong> одновременно</li>
                  <li>Выберите тип фильтра: Bell, LowSh, HiSh и др.</li>
                  <li>Настройте Q (ширину полосы)</li>
                </ul>
              </div>

              {/* Блок 3 */}
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

              {/* Блок 4 */}
              <div className="guide-card">
                <span className="guide-icon">4</span>
                <h3>Примените эффекты</h3>
                <p>
                  В меню <strong>🎛️ Эффекты</strong> доступны мощные инструменты:
                </p>
                <ul>
                  <li><strong>Fade In/Out</strong> — плавное затухание</li>
                  <li><strong>Нормализация</strong> — выравнивание громкости</li>
                  <li><strong>Реверс</strong> — обратное воспроизведение</li>
                  <li><strong>Скорость</strong> — ускорение или замедление</li>
                  <li><strong>Обрезка</strong> — удаление фрагментов</li>
                </ul>
              </div>

              {/* Блок 5 */}
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
                  <li><strong>A/B сравнение</strong> — сравнение двух настроек</li>
                </ul>
              </div>

              {/* Блок 6 */}
              <div className="guide-card">
                <span className="guide-icon">6</span>
                <h3>Сохраните результат</h3>
                <p>
                  Экспортируйте обработанное аудио в нужном формате:
                </p>
                <ul>
                  <li><strong>WAV</strong> — для профессионального использования</li>
                  <li><strong>MP3</strong> — для публикации в соцсетях</li>
                  <li>Сохранение пресетов для быстрого доступа</li>
                  <li>Запись обработанного звука с микрофона</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
        <div className="divider"></div>

        {/* ===== ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ ===== */}
        <section className="eq-faq">
          <div className="container">
            <h2>Часто задаваемые вопросы</h2>

            <div className="faq-grid eq-faq-grid">
              <div className="faq-card">
                <div className="faq-question">
                  Для чего нужен эквалайзер?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  Эквалайзер используется для изменения частотного баланса звука. 
                  Он позволяет усилить или ослабить определённые частоты: 
                  басы, середину, высокие частоты. Это помогает сделать звук 
                  более чистым, плотным и профессиональным.
                </div>
              </div>

              <div className="faq-card">
                <div className="faq-question">
                  Можно ли использовать эквалайзер онлайн бесплатно?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  Да, эквалайзер HHRecords полностью бесплатный. Вы можете 
                  загружать файлы, обрабатывать их, сохранять результаты 
                  без ограничений. Всё работает прямо в браузере.
                </div>
              </div>

              <div className="faq-card">
                <div className="faq-question">
                  Какие форматы аудио поддерживаются?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  Эквалайзер поддерживает все популярные форматы: 
                  MP3, WAV, FLAC, AAC, OGG, M4A. Также можно использовать 
                  микрофон, системный звук и демо-сигналы.
                </div>
              </div>

              <div className="faq-card">
                <div className="faq-question">
                  Как работает динамический EQ?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  Динамический EQ автоматически изменяет усиление полосы 
                  в зависимости от уровня сигнала. Если звук становится 
                  слишком громким на определённой частоте, полоса 
                  автоматически приглушается. Это помогает добиться 
                  более ровного и контролируемого звука.
                </div>
              </div>

              <div className="faq-card">
                <div className="faq-question">
                  Как сохранить настройки эквалайзера?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  В меню <strong>💾 Пресеты</strong> выберите 
                  <strong>"Сохранить как..."</strong>, введите название 
                  и нажмите Enter. Пресет сохранится в браузере и будет 
                  доступен при следующем открытии.
                </div>
              </div>

              <div className="faq-card">
                <div className="faq-question">
                  Можно ли обработать трек на сведение?
                  <span className="faq-icon">+</span>
                </div>
                <div className="faq-answer">
                  Да, эквалайзер — это профессиональный инструмент для 
                  сведения и мастеринга. Вы можете настраивать частотный 
                  баланс, применять динамическую обработку, нормализацию 
                  и другие эффекты. После обработки сохраните результат 
                  в WAV или MP3.
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
            <h2>🎛️ Профессиональный онлайн-эквалайзер для музыки</h2>
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
    </>
  )
}