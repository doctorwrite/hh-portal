// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Montserrat, Oswald } from 'next/font/google'

// ===== ИМПОРТЫ СТИЛЕЙ =====
import './styles/globals.css'
import './styles/layout.css'
import './styles/performance.css'

// Компоненты
import './styles/components/header.css'
import './styles/components/footer.css'
import './styles/components/faq.css'
import './styles/components/carousel.css'
import './styles/components/lightbox.css'
import './styles/components/widgets.css'
import './styles/components/seo.css'

// Адаптивность (всегда последняя)
import './styles/responsive/mobile.css'

import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HHRecords — Студия звукозаписи в Красноярске',
    template: '%s | HHRecords',
  },
  description:
    'Профессиональная студия звукозаписи в Красноярске. Запись вокала, сведение треков, мастеринг. Оборудование премиум-класса. Работаем с 2016 года.',
  keywords: ['студия звукозаписи Красноярск', 'запись вокала', 'сведение треков', 'мастеринг', 'HHRecords', 'звукозапись'],
  authors: [{ name: 'HHRecords', url: 'https://hiphoprecords.ru' }],
  creator: 'HHRecords',
  publisher: 'HHRecords',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://hiphoprecords.ru',
    title: 'HHRecords — Студия звукозаписи в Красноярске',
    description: 'Профессиональная студия звукозаписи в Красноярске. Запись вокала, сведение, мастеринг. Оборудование Neumann, Focal, Apollo.',
    siteName: 'HHRecords',
    images: [{ url: '/images/og-image.webp', width: 1200, height: 630, alt: 'HHRecords — Студия звукозаписи в Красноярске' }],
  },
  twitter: { card: 'summary_large_image', title: 'HHRecords — Студия звукозаписи в Красноярске', description: 'Профессиональная студия звукозаписи. Запись вокала, сведение, мастеринг.', images: ['/images/og-image.webp'] },
  verification: { yandex: '98989584' },
  alternates: { canonical: 'https://hiphoprecords.ru' },
  category: 'music',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#08080a',
}

const jsonLdLocalBusiness = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'HHRecords',
  description:
    'Профессиональная студия звукозаписи в Красноярске. Запись вокала, сведение треков, мастеринг.',
  address: { '@type': 'PostalAddress', streetAddress: 'ул. Дудинская 3с5, 3 этаж, офис 311', addressLocality: 'Красноярск', addressCountry: 'RU' },
  geo: { '@type': 'GeoCoordinates', latitude: '56.025544', longitude: '92.897114' },
  telephone: '+7-913-837-67-72',
  url: 'https://hiphoprecords.ru',
  sameAs: ['https://vk.com/hhrecords24', 'https://t.me/Nickkrsk'],
  openingHours: 'Mo-Su 10:00-22:00',
  priceRange: '1500-5000 RUB',
}

const jsonLdFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Что такое эквализация?', acceptedAnswer: { '@type': 'Answer', text: 'Эквализация (EQ) — это процесс изменения тембра и частотного баланса звука с помощью эквалайзера.' } },
    { '@type': 'Question', name: 'Что такое компрессия?', acceptedAnswer: { '@type': 'Answer', text: 'Компрессия — это процесс автоматического уменьшения разницы между самыми громкими и самыми тихими частями звука.' } },
    { '@type': 'Question', name: 'Что такое реверберация?', acceptedAnswer: { '@type': 'Answer', text: 'Реверберация — это процесс постепенного затухания звука из-за многократных отражений от поверхностей.' } },
    { '@type': 'Question', name: 'Что такое дилей?', acceptedAnswer: { '@type': 'Answer', text: 'Дилей — это звуковой эффект, который создаёт повторения исходного сигнала через определённые промежутки времени.' } },
    { '@type': 'Question', name: 'Что такое сатурация?', acceptedAnswer: { '@type': 'Answer', text: 'Сатурация — это эффект лёгкого искажения и насыщения звука, который добавляет теплоту, гармоники и характер.' } },
    { '@type': 'Question', name: 'Что такое лимитер?', acceptedAnswer: { '@type': 'Answer', text: 'Лимитер — это устройство или плагин, который жёстко ограничивает уровень аудиосигнала.' } },
    { '@type': 'Question', name: 'Что такое аудиоинтерфейс?', acceptedAnswer: { '@type': 'Answer', text: 'Аудиоинтерфейс — это устройство для преобразования аналогового звука в цифровой и обратно.' } },
    { '@type': 'Question', name: 'Что такое MIDI?', acceptedAnswer: { '@type': 'Answer', text: 'MIDI — это цифровой протокол для связи музыкальных инструментов и компьютеров.' } },
    { '@type': 'Question', name: 'Что такое битность?', acceptedAnswer: { '@type': 'Answer', text: 'Битность — это количество бит для представления каждого сэмпла звука. Чем выше битность, тем больше уровней громкости.' } },
    { '@type': 'Question', name: 'Что такое частота дискретизации?', acceptedAnswer: { '@type': 'Answer', text: 'Частота дискретизации — это количество измерений звука в секунду.' } },
    { '@type': 'Question', name: 'Что такое LUFS?', acceptedAnswer: { '@type': 'Answer', text: 'LUFS — это единица измерения воспринимаемой громкости для нормализации на стримингах.' } },
    { '@type': 'Question', name: 'Как работает сведение?', acceptedAnswer: { '@type': 'Answer', text: 'Сведение — это процесс объединения и балансировки всех дорожек трека.' } },
    { '@type': 'Question', name: 'Как работает мастеринг?', acceptedAnswer: { '@type': 'Answer', text: 'Мастеринг — это финальный этап обработки трека перед релизом.' } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${oswald.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(98989584,'init',{webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});` }} />
        <noscript><div><img src="https://mc.yandex.ru/watch/98989584" style={{ position: 'absolute', left: '-9999px' }} alt="" /></div></noscript>
      </head>
      <body>
        {/* SKIP-LINK */}
        <a href="#main-content" className="skip-link">
          Перейти к содержанию
        </a>

        <div className="music-bg" id="musicBg" aria-hidden="true" />
        <Header />
        <main id="main-content">
          {children}
        </main>
        <Footer />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const container = document.getElementById('musicBg');
                if (!container) return;

                // ===== ОПТИМИЗАЦИЯ =====
                // На телефонах — НЕТ НОТ
                const isMobile = window.innerWidth <= 768;
                const isTablet = window.innerWidth <= 1024;
                
                // Количество нот: 0 на телефоне, 4 на планшете, 8 на компьютере
                let totalNotes = 8;
                let createInterval = 4000;
                
                if (isMobile) {
                  totalNotes = 0;           // ← НОТ НЕТ
                  createInterval = 0;
                } else if (isTablet) {
                  totalNotes = 4;           // ← МЕНЬШЕ НОТ
                  createInterval = 5000;    // ← РЕЖЕ
                }

                // Если нот нет — выходим
                if (totalNotes === 0) {
                  container.style.display = 'none';
                  return;
                }

                const symbols = ['♪', '♫', '🎵', '🎶'];
                let noteCount = 0;
                let intervalId = null;

                function createNote() {
                  if (noteCount >= totalNotes) return;
                  const note = document.createElement('div');
                  note.classList.add('note');
                  note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                  note.style.left = Math.random() * 100 + '%';
                  note.style.fontSize = (Math.random() * 20 + 10) + 'px';
                  note.style.animationDuration = (Math.random() * 30 + 25) + 's';  // ← МЕДЛЕННЕЕ
                  note.style.animationDelay = (Math.random() * 5) + 's';
                  note.style.opacity = '0.03';  // ← ПРОЗРАЧНЕЕ
                  container.appendChild(note);
                  noteCount++;
                  setTimeout(() => {
                    if (note.parentNode) {
                      note.remove();
                      noteCount--;
                    }
                  }, 30000);
                }

                // Создаём начальные ноты с задержкой
                for (let i = 0; i < totalNotes; i++) {
                  setTimeout(createNote, Math.random() * 2000);
                }

                // Создаём новые ноты реже
                if (!isMobile && createInterval > 0) {
                  intervalId = setInterval(() => {
                    if (noteCount < totalNotes) {
                      createNote();
                    }
                  }, createInterval);
                }

                // Очистка при уходе со страницы
                window.addEventListener('beforeunload', function() {
                  if (intervalId) clearInterval(intervalId);
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
