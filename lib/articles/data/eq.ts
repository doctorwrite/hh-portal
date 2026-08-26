// lib/articles/data/eq.ts
import { ArticleData } from '../types'

export const eq: ArticleData = {
  title: 'Эквализация (EQ) — что это? Полное руководство',
  description: 'Эквализация — это регулировка частот звука. Узнайте, как работает EQ, какие бывают типы эквалайзеров.',
  content: `
    <div class="article-content">

      <!-- ===== МЕТА-ИНФОРМАЦИЯ ===== -->
      <div class="meta">
        Обновлено: 22 июля 2026 • Автор: Звукорежиссёр HHRecords •
        <a href="https://hiphoprecords.ru">HHRecords — студия звукозаписи в Красноярске</a>
      </div>

      <!-- ===== HERO-БЛОК ===== -->
      <div class="hero-article" style="text-align: center; padding: 20px 0 30px;">
        <div class="hero-badge" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(245,197,66,0.06); border: 1px solid rgba(245,197,66,0.08); border-radius: 50px; padding: 4px 16px 4px 8px; margin-bottom: 16px; font-size: 0.75rem; color: #fcf6ba;">
          <span class="badge-icon" style="font-size: 1rem;">🎛️</span>
          <span class="badge-text">Энциклопедия звукозаписи</span>
        </div>
        <div class="hero-title-wrapper" style="display: inline-block; background: rgba(22, 22, 28, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(245,197,66,0.08); border-radius: 20px; padding: 16px 32px; margin-bottom: 20px; box-shadow: 0 0 40px rgba(245,197,66,0.03); transition: all 0.4s;">
          <h1 style="font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 700; line-height: 1.2; margin: 0;">
            <span class="title-accent" style="background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Эквализация (EQ)</span>
            <span class="title-main" style="color: #ffffff;">— что это? Полное определение, виды, применение, советы</span>
          </h1>
          <div class="hero-accent-line" style="width: 120px; height: 3px; background: linear-gradient(90deg, #bf953f, #fcf6ba, #b38728); margin: 12px auto 0; border-radius: 3px;"></div>
        </div>
        <p class="hero-subtitle" style="color: var(--text-secondary); font-size: 1.05rem; max-width: 700px; margin: 0 auto 20px;">Узнайте, как работает эквализация, какие бывают типы эквалайзеров и как мы используем EQ в студии HHRecords.</p>
        <div class="hero-tags" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          <span class="hero-tag" style="background: rgba(245,197,66,0.06); color: #fcf6ba; padding: 4px 16px; border-radius: 20px; font-size: 0.78rem; border: 1px solid rgba(245,197,66,0.06); transition: all 0.3s; cursor: default;">📌 6 вопросов</span>
          <span class="hero-tag" style="background: rgba(245,197,66,0.06); color: #fcf6ba; padding: 4px 16px; border-radius: 20px; font-size: 0.78rem; border: 1px solid rgba(245,197,66,0.06); transition: all 0.3s; cursor: default;">⭐ 4.9 на основе 87 отзывов</span>
          <span class="hero-tag" style="background: rgba(245,197,66,0.06); color: #fcf6ba; padding: 4px 16px; border-radius: 20px; font-size: 0.78rem; border: 1px solid rgba(245,197,66,0.06); transition: all 0.3s; cursor: default;">🎚️ Студия в Красноярске с 2016</span>
          <span class="hero-tag" style="background: rgba(245,197,66,0.06); color: #fcf6ba; padding: 4px 16px; border-radius: 20px; font-size: 0.78rem; border: 1px solid rgba(245,197,66,0.06); transition: all 0.3s; cursor: default;">📚 Ссылки на источники</span>
        </div>
      </div>

      <!-- ===== ОГЛАВЛЕНИЕ ===== -->
      <div class="toc">
        <h2 class="toc-title">📑 Содержание</h2>
        <ul class="toc-list">
          <li><a href="#q1">1. Что такое эквализация?</a></li>
          <li><a href="#q2">2. Виды эквализации</a></li>
          <li><a href="#q3">3. Где применяется</a></li>
          <li><a href="#q4">4. Типы эквалайзеров</a></li>
          <li><a href="#q5">5. Принципы настройки</a></li>
          <li><a href="#q6">6. Ошибки при эквализации</a></li>
        </ul>
      </div>

      <!-- ===== КРАТКИЙ ОТВЕТ ===== -->
      <div class="quick-answer">
        <div class="quick-answer-label">⚡ Краткий ответ</div>
        <p><strong>Эквализация (EQ)</strong> — это процесс изменения тембра и частотного баланса звука с помощью эквалайзера. Она используется для очистки звука от шумов, устранения частотных конфликтов между инструментами и придания звучанию нужного характера. Эквалайзеры бывают параметрическими, графическими и в виде фильтров (HPF, LPF).</p>
      </div>

      <!-- ===== ВОПРОС 1 ===== -->
      <div class="qa-block" id="q1">
        <h3 class="question"><span class="num">1</span>Что такое эквализация?</h3>
        <div class="answer">
          <div class="article-image">
            <img src="/images/eq-frequency-spectrum.webp" alt="Частотный спектр звука" loading="lazy" />
            <figcaption>Частотный спектр звука</figcaption>
          </div>
          <p><strong>Эквализация (EQ)</strong> — это процесс изменения тембра и частотного баланса звукового сигнала путём усиления или ослабления определённых частот с помощью эквалайзера. Проще говоря, это регулировка низких, средних и высоких частот, чтобы сделать звук чище, сбалансированнее или придать ему нужный характер.</p>
          <p>Человеческое ухо воспринимает звуки в диапазоне примерно от 20 Гц до 20 кГц. Разные частотные диапазоны отвечают за разные характеристики:</p>
          <ul>
            <li><strong>Низкие частоты (20–250 Гц)</strong> — придают звуку глубину и мощь (бас).</li>
            <li><strong>Средние частоты (500–2000 Гц)</strong> — отвечают за разборчивость и основу звучания (вокал).</li>
            <li><strong>Высокие частоты (4–10 кГц)</strong> — добавляют яркость и детализацию.</li>
            <li><strong>Сверхвысокие частоты (10–20 кГц)</strong> — создают «воздушность» и пространство.</li>
          </ul>
          <div style="clear:both;"></div>
        </div>
      </div>

      <!-- ===== ВОПРОС 2 ===== -->
      <div class="qa-block" id="q2">
        <h3 class="question"><span class="num">2</span>Какие бывают виды эквализации?</h3>
        <div class="answer">
          <div class="article-image">
            <img src="/images/eq-types.webp" alt="Виды эквализации: техническая и художественная" loading="lazy" />
            <figcaption>Виды эквализации</figcaption>
          </div>
          <p>Эквализация делится на два направления:</p>
          <ul>
            <li><strong>Техническая (коррекционная).</strong> Удаление нежелательных резонансов, гула, шумов или обрезка неслышимых частот (например, с помощью фильтра низких частот High-Pass). Используется для устранения частотных конфликтов между инструментами и компенсации искажений, вносимых акустикой помещения.</li>
            <li><strong>Художественная (творческая).</strong> Придание звуку плотности, яркости, теплоты или «воздуха» для того, чтобы инструмент лучше читался в общем миксе. Это про создание характера и настроения звука.</li>
          </ul>
          <div style="clear:both;"></div>
        </div>
      </div>

      <!-- ===== ВОПРОС 3 ===== -->
      <div class="qa-block" id="q3">
        <h3 class="question"><span class="num">3</span>Где применяется эквализация?</h3>
        <div class="answer">
          <p>Эквализация используется на всех этапах работы со звуком:</p>
          <ul>
            <li><strong>Сведение музыки.</strong> Выравнивание баланса между вокалом, барабанами, гитарами и другими инструментами.</li>
            <li><strong>Постпродакшн видео и подкастов.</strong> Очистка голоса диктора от фонового шума и бубнения.</li>
            <li><strong>Повседневное прослушивание.</strong> Настройка звучания в музыкальных плеерах или автомобильных магнитолах.</li>
            <li><strong>Мастеринг.</strong> Финальная настройка всего трека для подготовки к релизу.</li>
            <li><strong>Живой звук.</strong> Коррекция акустики зала и борьба с обратной связью.</li>
          </ul>
        </div>
      </div>

      <!-- ===== ВОПРОС 4 ===== -->
      <div class="qa-block" id="q4">
        <h3 class="question"><span class="num">4</span>Какие бывают типы эквалайзеров?</h3>
        <div class="answer">
          <div class="article-image">
            <img src="/images/eq-types-diagram.webp" alt="Типы эквалайзеров: параметрический, графический, фильтры" loading="lazy" />
            <figcaption>Типы эквалайзеров</figcaption>
          </div>
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Гибкость</th>
                <th>Сложность</th>
                <th>Где используется</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Параметрический</strong></td><td>⭐⭐⭐⭐⭐</td><td>Высокая</td><td>Профессиональные студии</td></tr>
              <tr><td><strong>Графический</strong></td><td>⭐⭐⭐</td><td>Низкая</td><td>Концертная акустика</td></tr>
              <tr><td><strong>Фильтры (HPF/LPF)</strong></td><td>⭐⭐</td><td>Низкая</td><td>Очистка звука</td></tr>
              <tr><td><strong>Динамический</strong></td><td>⭐⭐⭐⭐</td><td>Средняя</td><td>Сведение и мастеринг</td></tr>
              <tr><td><strong>Линейно-фазовый</strong></td><td>⭐⭐⭐⭐⭐</td><td>Высокая</td><td>Мастеринг</td></tr>
            </tbody>
          </table>
          <div style="clear:both;"></div>
        </div>
      </div>

      <!-- ===== ВОПРОС 5 ===== -->
      <div class="qa-block" id="q5">
        <h3 class="question"><span class="num">5</span>Какие важные принципы настройки эквалайзера?</h3>
        <div class="answer">
          <div class="article-image">
            <img src="/images/eq-tips.webp" alt="Советы по настройке эквалайзера" loading="lazy" />
            <figcaption>Принципы настройки EQ</figcaption>
          </div>
          <ul>
            <li><strong>Работайте в контексте.</strong> Настраивайте эквалайзер, слушая весь микс целиком, а не изолированно один инструмент.</li>
            <li><strong>Начинайте с подрезки (субтрактивная эквализация).</strong> Сначала убирайте проблемные частоты, а потом, если нужно, усиливайте.</li>
            <li><strong>Делайте небольшие изменения.</strong> Резкие подъёмы или срезы (более 5 дБ) могут привести к неестественному звуку. Оптимально — 1–3 дБ.</li>
            <li><strong>Проверяйте на разных системах.</strong> То, что звучит хорошо на студийных мониторах, может быть провалом на наушниках или в машине.</li>
            <li><strong>Используйте фильтры.</strong> HPF и LPF — ваши лучшие друзья для очистки звука от мусора.</li>
            <li><strong>Не злоупотребляйте.</strong> Иногда инструмент звучит отлично и без дополнительной обработки.</li>
          </ul>
          <div style="clear:both;"></div>
        </div>
      </div>

      <!-- ===== ВОПРОС 6 ===== -->
      <div class="qa-block" id="q6">
        <h3 class="question"><span class="num">6</span>Какие ошибки часто допускают при эквализации?</h3>
        <div class="answer">
          <div class="article-image">
            <img src="/images/eq-mistakes.webp" alt="Ошибки при эквализации" loading="lazy" />
            <figcaption>Ошибки при эквализации</figcaption>
          </div>
          <ul>
            <li><strong>Слишком много баса.</strong> Микс становится «грязным» и утомительным для слуха.</li>
            <li><strong>Перебор с высокими частотами.</strong> Звук становится резким и неприятным.</li>
            <li><strong>Настройка в соло, а не в миксе.</strong> Инструмент звучит идеально отдельно, но теряется в общем миксе.</li>
            <li><strong>Слишком агрессивные изменения.</strong> Подъёмы или срезы более 5 дБ делают звук неестественным.</li>
            <li><strong>Игнорирование фильтров.</strong> HPF и LPF — простейший способ убрать «грязь».</li>
          </ul>
          <div style="clear:both;"></div>
        </div>
      </div>

      <!-- ===== ПРИМЕНЕНИЕ В ЖАНРАХ ===== -->
      <section>
        <h2>🎯 Как мы используем эквализацию в разных жанрах в HHRecords</h2>
        <div style="color: var(--text-secondary); line-height: 1.9;">
          <p>В студии HHRecords мы подходим к эквализации индивидуально, в зависимости от жанра. Вот наши базовые настройки:</p>
          <div class="genre-table-wrap" style="overflow-x: auto; margin: 12px 0;">
            <table class="genre-table" style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; font-size: 0.85rem;">
              <thead>
                <tr>
                  <th style="background: rgba(245, 197, 66, 0.1); color: #fcf6ba; padding: 10px 14px; text-align: left; font-weight: 600;">Жанр</th>
                  <th style="background: rgba(245, 197, 66, 0.1); color: #fcf6ba; padding: 10px 14px; text-align: left; font-weight: 600;">Какие частоты подчёркиваем</th>
                  <th style="background: rgba(245, 197, 66, 0.1); color: #fcf6ba; padding: 10px 14px; text-align: left; font-weight: 600;">Какие убираем</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);"><strong style="color: #fff;">Рэп-вокал</strong></td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">2–4 кГц (для разборчивости)</td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">Ниже 80 Гц (для чистоты)</td></tr>
                <tr><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);"><strong style="color: #fff;">Рок-гитара</strong></td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">100–200 Гц (для плотности)</td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">2–4 кГц (для мягкости)</td></tr>
                <tr><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);"><strong style="color: #fff;">Акустическая гитара</strong></td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">4–6 кГц (для яркости)</td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">Ниже 80 Гц (для чистоты)</td></tr>
                <tr><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);"><strong style="color: #fff;">Бас-гитара</strong></td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">60–80 Гц (для плотности)</td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">Выше 4 кГц (чтобы не мешать вокалу)</td></tr>
                <tr><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);"><strong style="color: #fff;">Сведение микса</strong></td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">2–4 кГц (для вокала)</td><td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--text-secondary);">200–300 Гц (для устранения «коробочности»)</td></tr>
              </tbody>
            </table>
          </div>
          <p><em>Эти настройки — стартовая точка. Мы всегда корректируем их под конкретный трек и голос исполнителя.</em></p>
        </div>
      </section>

      <!-- ===== БЫСТРЫЙ СТАРТ ===== -->
      <section class="quick-start" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px 24px; margin: 16px 0;">
        <h3 class="quick-start-title" style="color: #fcf6ba; font-weight: 700; font-size: 1rem; margin-bottom: 12px;">🚀 Быстрый старт для новичков</h3>
        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 20px;">
          <ol style="color: var(--text-secondary); line-height: 2; padding-left: 24px;">
            <li><strong style="color: #fff;">Шаг 1:</strong> Включите эквалайзер на дорожке.</li>
            <li><strong style="color: #fff;">Шаг 2:</strong> Установите <strong style="color: #fff;">HPF (High-Pass Filter)</strong> на 80 Гц для вокала, чтобы убрать гул.</li>
            <li><strong style="color: #fff;">Шаг 3:</strong> Найдите проблемные частоты с помощью узкого Q (усиление и поиск).</li>
            <li><strong style="color: #fff;">Шаг 4:</strong> Ослабьте найденные проблемные частоты (субтрактивная эквализация).</li>
            <li><strong style="color: #fff;">Шаг 5:</strong> Добавьте лёгкое усиление на 2–4 кГц для яркости (если нужно).</li>
            <li><strong style="color: #fff;">Шаг 6:</strong> <strong style="color: #fff;">Проверьте в контексте микса</strong> — никогда не настраивайте EQ в соло!</li>
            <li><strong style="color: #fff;">Шаг 7:</strong> Сравните с эталонным треком.</li>
          </ol>
        </div>
      </section>

      <!-- ===== ЧЕК-ЛИСТ ===== -->
      <div class="checklist-wrapper" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px 28px; margin: 16px 0;">
        <div class="checklist-title" style="color: #fcf6ba; font-weight: 700; font-size: 1.1rem; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
          ✅ Чек-лист: готов ли ваш трек к эквализации?
          <span class="badge" style="font-size: 0.6rem; background: rgba(245,197,66,0.1); padding: 2px 10px; border-radius: 12px; color: #fcf6ba;">0/6</span>
        </div>
        <div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">Вокал записан с запасом по громкости (-6 dB)</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">Чтобы избежать клиппинга при обработке</span>
            </span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">В записи нет клиппинга</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">Проверьте пиковые значения на мастер-канале</span>
            </span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">Вы слушаете микс в контексте, а не соло</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">Настройка в соло убивает понимание баланса</span>
            </span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">Вы проверили фазу на всех дорожках</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">Фазовые проблемы убивают плотность звука</span>
            </span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">У вас есть хорошие студийные мониторы или наушники</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">На дешёвой акустике вы не услышите реальный баланс</span>
            </span>
          </div>
          <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; margin-bottom: 2px;">
            <span class="check-box" style="width: 22px; height: 22px; min-width: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.3s; margin-top: 2px; background: rgba(255,255,255,0.03);">✓</span>
            <span class="check-text" style="flex: 1; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
              <strong style="color: #fff; display: block;">Вы знаете цель эквализации (очистка / характер)</strong>
              <span class="hint" style="display: block; font-size: 0.75rem; color: #666; font-weight: 400; margin-top: 2px;">Сначала убираем мусор, потом добавляем характер</span>
            </span>
          </div>
        </div>
        <div class="checklist-progress" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 14px;">
          <span class="progress-label" style="font-size: 0.75rem; color: #888; white-space: nowrap;">Прогресс:</span>
          <div class="progress-bar" style="flex: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
            <div class="progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #bf953f, #fcf6ba); border-radius: 4px; transition: width 0.5s ease;"></div>
          </div>
          <span class="progress-text" style="font-size: 0.75rem; color: #fcf6ba; font-weight: 600; min-width: 60px; text-align: right;">0%</span>
        </div>
        <div class="checklist-celebration" style="display: none; margin-top: 16px; padding: 14px 20px; background: rgba(245,197,66,0.08); border: 1px solid rgba(245,197,66,0.15); border-radius: 12px; text-align: center;">
          <span class="emoji" style="font-size: 2rem; display: block;">🎉</span>
          <span class="msg" style="color: #fcf6ba; font-weight: 600; font-size: 1rem;">Отлично! Вы готовы к эквализации уровня PRO! 🔥</span>
        </div>
      </div>

      <!-- ===== ВОПРОСЫ ОТ ЧИТАТЕЛЕЙ ===== -->
      <section class="user-questions" style="margin: 16px 0;">
        <h3 class="user-questions-title" style="color: #fcf6ba; font-weight: 700; font-size: 1rem; margin-bottom: 12px;">❓ Вопросы от наших клиентов</h3>
        <article class="user-question" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px;">
          <div class="user-q" style="color: #fff; font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Вопрос: "Можно ли использовать эквалайзер на мастер-канале?"</div>
          <div class="user-a" style="color: var(--text-secondary); font-size: 0.9rem;">Ответ: Да, но только на финальном этапе мастеринга. На мастер-канале используют линейно-фазовые эквалайзеры, чтобы минимизировать фазовые искажения.</div>
        </article>
        <article class="user-question" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px;">
          <div class="user-q" style="color: #fff; font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Вопрос: "Какой эквалайзер лучше для начинающих?"</div>
          <div class="user-a" style="color: var(--text-secondary); font-size: 0.9rem;">Ответ: Начните с графического эквалайзера — он самый простой и наглядный. Позже переходите на параметрический для тонкой настройки.</div>
        </article>
        <article class="user-question" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px;">
          <div class="user-q" style="color: #fff; font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">Вопрос: "Можно ли испортить звук эквалайзером?"</div>
          <div class="user-a" style="color: var(--text-secondary); font-size: 0.9rem;">Ответ: Да, если переборщить с усилением частот или использовать слишком агрессивные настройки. Всегда делайте небольшие изменения и проверяйте результат на разных системах.</div>
        </article>
      </section>

      <!-- ===== МИКРО-ГЛОССАРИЙ ===== -->
      <div class="micro-glossary">
        <h3 class="micro-glossary-title">📖 Микро-глоссарий</h3>
        <dl>
          <dt>Эквализация (EQ)</dt><dd>Регулировка громкости отдельных частот звука.</dd>
          <dt>HPF (High-Pass Filter)</dt><dd>Фильтр, срезающий частоты ниже заданного порога.</dd>
          <dt>LPF (Low-Pass Filter)</dt><dd>Фильтр, срезающий частоты выше заданного порога.</dd>
          <dt>Параметрический эквалайзер</dt><dd>Эквалайзер с регулировкой частоты, усиления и ширины полосы.</dd>
          <dt>Графический эквалайзер</dt><dd>Эквалайзер с фиксированными полосами частот.</dd>
          <dt>Q (Quality factor)</dt><dd>Параметр, определяющий ширину полосы обработки в параметрическом эквалайзере.</dd>
        </dl>
      </div>

      <!-- ===== СОВЕТ ОТ ЗВУКОРЕЖИССЁРА ===== -->
      <div class="tip-with-photo">
        <h3 class="question">💡 Совет от звукорежиссёра HHRecords</h3>
        <div class="tip-content">
          <div class="tip-photo">
            <img src="/images/studio-control.webp" alt="Звукорежиссёр HHRecords за работой" loading="lazy" />
          </div>
          <div class="tip-text">
            <p>В студии HHRecords мы начинаем любой микс с эквализации. Наша базовая техника для вокала:</p>
            <ul>
              <li><strong>Срез ниже 80 Гц (HPF)</strong> — убирает гул и вибрации от микрофона.</li>
              <li><strong>Усиление в диапазоне 2–4 кГц</strong> — добавляет яркости и разборчивости.</li>
              <li><strong>Проверка в диапазоне 200–300 Гц</strong> — иногда убираем «коробочность».</li>
            </ul>
            <p>Для гитары мы используем срез ниже 100 Гц, чтобы освободить место для баса и бочки. Для бас-гитары мы добавляем плотность на 60–80 Гц.</p>
            <p><strong>Главное правило:</strong> всегда настраивайте эквалайзер в контексте всего микса. Проверяйте результат на разных устройствах — студийные мониторы, наушники, автомобильная акустика.</p>
          </div>
        </div>
      </div>

      <!-- ===== ИСТОЧНИКИ + ПОХОЖИЕ ТЕРМИНЫ ===== -->
      <div class="bottom-links" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 20px 0 0; background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
        <div class="sources" style="padding: 16px 20px; border-right: 1px solid rgba(255,255,255,0.05);">
          <h3 style="color: #fcf6ba; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">📚 Источники</h3>
          <div class="links" style="display: flex; flex-wrap: wrap; gap: 6px 14px;">
            <a href="https://ru.wikipedia.org/wiki/%D0%AD%D0%BA%D0%B2%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); font-size: 0.8rem; transition: color 0.3s;">Википедия</a>
            <a href="https://wikisound.org/%D0%AD%D0%BA%D0%B2%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); font-size: 0.8rem; transition: color 0.3s;">WikiSound</a>
            <a href="https://www.soundonsound.com/techniques/equalization" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); font-size: 0.8rem; transition: color 0.3s;">Sound on Sound</a>
          </div>
        </div>
        <div class="terms" style="padding: 16px 20px;">
          <h3 style="color: #fcf6ba; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">📌 Похожие термины</h3>
          <div class="tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            <a href="/encyclopedia/compression" style="background: rgba(245, 197, 66, 0.06); color: #fcf6ba; padding: 3px 12px; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(245, 197, 66, 0.06); transition: all 0.3s;">🎚️ Компрессия</a>
            <a href="/encyclopedia/reverb" style="background: rgba(245, 197, 66, 0.06); color: #fcf6ba; padding: 3px 12px; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(245, 197, 66, 0.06); transition: all 0.3s;">🌊 Реверберация</a>
            <a href="/encyclopedia/delay" style="background: rgba(245, 197, 66, 0.06); color: #fcf6ba; padding: 3px 12px; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(245, 197, 66, 0.06); transition: all 0.3s;">⏳ Дилей</a>
            <a href="/encyclopedia/saturation" style="background: rgba(245, 197, 66, 0.06); color: #fcf6ba; padding: 3px 12px; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(245, 197, 66, 0.06); transition: all 0.3s;">🔥 Сатурация</a>
            <a href="/encyclopedia/limiter" style="background: rgba(245, 197, 66, 0.06); color: #fcf6ba; padding: 3px 12px; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(245, 197, 66, 0.06); transition: all 0.3s;">🧱 Лимитер</a>
          </div>
        </div>
      </div>

      <!-- ===== БРЕНДОВЫЙ БЛОК ===== -->
      <div class="brand-block" id="contacts">
        <h2>🎧 HHRecords — студия звукозаписи в Красноярске</h2>
        <p>Запись вокала, сведение, мастеринг. 10 лет опыта, оборудование премиум-класса (Neumann, Focal, Apollo).</p>
        <div class="btn-row">
          <a href="tel:+79138376772" class="btn" style="background:linear-gradient(135deg, #bf953f, #fcf6ba, #b38728); color:#000;">📞 Позвонить</a>
          <a href="https://t.me/Nickkrsk" class="btn" style="background:linear-gradient(135deg,#0088cc,#005f8a); color:#fff;">✈️ Telegram</a>
          <a href="https://vk.com/hhrecords24" target="_blank" class="btn btn-secondary" style="background:transparent; border:2px solid #bf953f; color:#fcf6ba;">📱 VK</a>
          <a href="/" class="btn btn-secondary" style="background:transparent; border:2px solid #bf953f; color:#fcf6ba;">🏠 На главную</a>
        </div>
        <p style="margin-top:16px; font-size:0.85rem; color:var(--text-secondary);">📍 Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311</p>
      </div>

      <!-- ===== ПОДЕЛИТЬСЯ (НОВЫЙ БЛОК) ===== -->
      <div style="text-align:center; margin:10px 0 5px; color:#888; font-size:0.8rem;">Поделиться статьёй:</div>
      <div class="share-buttons" style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin: 20px 0;">
        <a href="https://vk.com/share.php?url=https://hiphoprecords.ru/encyclopedia/eq" target="_blank" rel="noopener noreferrer" class="share-btn vk" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; text-decoration: none !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); color: #fff; border: none; cursor: pointer; background: #0077FF;">
          <span>📱</span><span class="share-label" style="font-weight: 600;">Поделиться в VK</span>
        </a>
        <a href="https://t.me/share/url?url=https://hiphoprecords.ru/encyclopedia/eq" target="_blank" rel="noopener noreferrer" class="share-btn tg" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; text-decoration: none !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); color: #fff; border: none; cursor: pointer; background: #0088cc;">
          <span>✈️</span><span class="share-label" style="font-weight: 600;">Поделиться в Telegram</span>
        </a>
        <button class="share-btn copy" onclick="copyLink()" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-weight: 600; font-size: 0.9rem; text-decoration: none !important; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); color: #fff; border: none; cursor: pointer; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.08);">
          <span>📋</span><span class="share-label" style="font-weight: 600;">Копировать ссылку</span>
        </button>
      </div>

      <div id="copyNotification" style="display: none; position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); color: #fff; padding: 14px 28px; border-radius: 12px; border: 1px solid rgba(245,197,66,0.2); z-index: 9999; font-size: 0.95rem; box-shadow: 0 8px 30px rgba(0,0,0,0.5); animation: fadeInUp 0.3s ease;">✅ Ссылка скопирована!</div>

      <script>
        function copyLink() {
          navigator.clipboard.writeText('https://hiphoprecords.ru/encyclopedia/eq').then(() => {
            const notification = document.getElementById('copyNotification');
            notification.style.display = 'block';
            setTimeout(() => {
              notification.style.display = 'none';
            }, 2500);
          }).catch(() => {
            const input = document.createElement('input');
            input.value = 'https://hiphoprecords.ru/encyclopedia/eq';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            const notification = document.getElementById('copyNotification');
            notification.style.display = 'block';
            setTimeout(() => {
              notification.style.display = 'none';
            }, 2500);
          });
        }
      </script>

    </div>
  `
}
