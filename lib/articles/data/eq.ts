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
        </div>
      </div>

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

      <!-- ===== ПОХОЖИЕ ТЕРМИНЫ ===== -->
      <div class="related-terms">
        <a href="/encyclopedia/compression">🎚️ Компрессия</a>
        <a href="/encyclopedia/reverb">🌊 Реверберация</a>
        <a href="/encyclopedia/delay">⏳ Дилей</a>
        <a href="/encyclopedia/saturation">🔥 Сатурация</a>
        <a href="/encyclopedia/limiter">🧱 Лимитер</a>
      </div>

      <!-- ===== БРЕНДОВЫЙ БЛОК ===== -->
      <div class="brand-block" id="contacts">
        <h2>🎧 HHRecords — студия звукозаписи в Красноярске</h2>
        <p>Запись вокала, сведение, мастеринг. 10 лет опыта, оборудование премиум-класса (Neumann, Focal, Apollo).</p>
        <div class="btn-row">
          <a href="tel:+79138376772" class="btn" style="background:linear-gradient(135deg, var(--gold-start), var(--gold-mid), var(--gold-end)); color:#000;">📞 Позвонить</a>
          <a href="https://t.me/Nickkrsk" class="btn" style="background:linear-gradient(135deg,#0088cc,#005f8a); color:#fff;">✈️ Telegram</a>
          <a href="https://vk.com/hhrecords24" target="_blank" class="btn btn-secondary" style="background:transparent; border:2px solid var(--gold-start); color:var(--gold-start);">📱 VK</a>
          <a href="/" class="btn btn-secondary" style="background:transparent; border:2px solid var(--gold-start); color:var(--gold-start);">🏠 На главную</a>
        </div>
        <p style="margin-top:16px; font-size:0.85rem; color:var(--text-secondary);">📍 Красноярск, ул. Дудинская 3с5, 3 этаж, офис 311</p>
      </div>

    </div>
  `
}