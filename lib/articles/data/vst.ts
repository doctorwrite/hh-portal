// lib/articles/data/vst.ts
import { ArticleData } from '../types'

export const vst: ArticleData = {
  title: 'VST / Плагины — что это? Полное руководство по виртуальным инструментам и эффектам',
  description: 'VST (Virtual Studio Technology) — это формат плагинов для обработки звука и виртуальных инструментов. Узнайте, что такое VST, какие бывают типы плагинов (VSTi, эффекты, MIDI-эффекты), чем отличаются форматы VST, AU, AAX, как установить и использовать плагины в DAW, а также лучшие бесплатные и платные VST для сведения и мастеринга.',

  hero: {
    badge: 'Энциклопедия звукозаписи',
    subtitle: 'Узнайте, что такое VST, какие бывают типы плагинов (VSTi, эффекты, MIDI-эффекты), чем отличаются форматы VST, AU, AAX, как установить и использовать плагины в DAW, а также лучшие бесплатные и платные VST для сведения и мастеринга.',
    tags: ['📌 8 вопросов', '⭐ 4.9 на основе 87 отзывов', '🎚️ Студия в Красноярске с 2016', '📚 Ссылки на источники'],
  },

  toc: [
    { id: 'q1', label: '1. Что такое VST плагины?' },
    { id: 'q2', label: '2. Как работают VST плагины?' },
    { id: 'q3', label: '3. Типы VST плагинов' },
    { id: 'q4', label: '4. Форматы плагинов: VST, AU, AAX, CLAP' },
    { id: 'q5', label: '5. Как установить и использовать VST?' },
    { id: 'q6', label: '6. Топ-10 лучших VST плагинов' },
    { id: 'q7', label: '7. Бесплатные vs платные VST' },
    { id: 'q8', label: '8. Ошибки при работе с VST' },
  ],

  quickAnswer: `
    <strong>VST (Virtual Studio Technology)</strong> — это формат плагинов, разработанный компанией Steinberg в 1996 году. Плагины — это программы, которые работают внутри вашей DAW (цифровой рабочей станции) и добавляют новые инструменты или эффекты. Они делятся на <strong>инструментальные (VSTi)</strong> — синтезаторы, сэмплеры, драм-машины, и <strong>эффекты</strong> — эквалайзеры, компрессоры, ревербераторы, дилеи. Сегодня VST — это стандарт для всей музыкальной индустрии.
  `,

  qa: [
    {
      id: 'q1',
      question: 'Что такое VST плагины?',
      answer: `
        <p><strong>VST (Virtual Studio Technology)</strong> — это формат плагинов, разработанный компанией Steinberg в 1996 году. Плагины — это небольшие программы, которые работают внутри вашей DAW (цифровой рабочей станции) и добавляют новые инструменты или эффекты.</p>
        <p><strong>Два основных типа VST плагинов:</strong></p>
        <ul>
          <li><strong>VST Instruments (VSTi):</strong> Виртуальные инструменты — синтезаторы, сэмплеры, драм-машины. Они генерируют звук.</li>
          <li><strong>VST Effects:</strong> Эффекты — эквалайзеры, компрессоры, ревербераторы, дилеи. Они обрабатывают уже существующий звук.</li>
        </ul>
        <p>Сегодня VST — это стандарт для всей музыкальной индустрии. Почти все профессиональные DAW поддерживают этот формат.</p>
      `
    },
    {
      id: 'q2',
      question: 'Как работают VST плагины?',
      answer: `
        <p>VST плагины работают внутри <strong>хоста (DAW)</strong> — программы, которая загружает и управляет плагинами.</p>
        <p><strong>Принцип работы:</strong></p>
        <ol>
          <li><strong>Загрузка:</strong> DAW загружает VST-плагин в память.</li>
          <li><strong>Маршрутизация:</strong> Аудиосигнал направляется на вход плагина.</li>
          <li><strong>Обработка:</strong> Плагин обрабатывает сигнал (генерирует звук или применяет эффекты).</li>
          <li><strong>Выход:</strong> Обработанный сигнал возвращается в DAW.</li>
          <li><strong>Управление:</strong> Параметры плагина управляются через MIDI или автоматизацию.</li>
        </ol>
        <p>Плагины используют <strong>процессор (CPU)</strong> компьютера для обработки звука в реальном времени. Чем сложнее плагин, тем больше ресурсов он потребляет.</p>
      `
    },
    {
      id: 'q3',
      question: 'Какие бывают типы VST плагинов?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Примеры</th>
              <th>Назначение</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>🎹 Синтезаторы</strong></td><td>Serum, Omnisphere, Massive, Diva</td><td>Создание синтезированных звуков</td></tr>
            <tr><td><strong>🎚️ Сэмплеры</strong></td><td>Kontakt, EXS24, HALion, Decent Sampler</td><td>Воспроизведение записанных сэмплов</td></tr>
            <tr><td><strong>🎛️ Эффекты</strong></td><td>FabFilter Pro-Q, Pro-C, Valhalla, EchoBoy</td><td>Обработка звука</td></tr>
            <tr><td><strong>🎧 Мастеринговые</strong></td><td>iZotope Ozone, Waves L2, FabFilter Pro-L</td><td>Финальная обработка трека</td></tr>
            <tr><td><strong>🎸 Эмуляции</strong></td><td>Amplitube, Guitar Rig, Neural DSP</td><td>Эмуляция гитарных усилителей</td></tr>
            <tr><td><strong>🔧 Утилиты</strong></td><td>Vocalign, Melodyne, RX, Soothe2</td><td>Специализированные задачи</td></tr>
          </tbody>
        </table>
      `
    },
    {
      id: 'q4',
      question: 'Какие бывают форматы плагинов?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Формат</th>
              <th>Разработчик</th>
              <th>ОС</th>
              <th>DAW</th>
              <th>Особенности</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>VST</strong></td><td>Steinberg</td><td>Windows, macOS</td><td>Почти все DAW</td><td>Самый распространённый формат</td></tr>
            <tr><td><strong>VST3</strong></td><td>Steinberg</td><td>Windows, macOS</td><td>Почти все DAW</td><td>Новое поколение, лучшее управление CPU</td></tr>
            <tr><td><strong>AU (Audio Units)</strong></td><td>Apple</td><td>macOS только</td><td>Logic, GarageBand</td><td>Нативный формат Apple</td></tr>
            <tr><td><strong>AAX</strong></td><td>Avid</td><td>Windows, macOS</td><td>Pro Tools</td><td>Требуется для Pro Tools</td></tr>
            <tr><td><strong>CLAP</strong></td><td>Open Source</td><td>Windows, macOS, Linux</td><td>Bitwig, REAPER</td><td>Новый открытый формат</td></tr>
          </tbody>
        </table>
        <p><strong>Совет от HHRecords:</strong> При покупке плагинов убедитесь, что они поддерживают формат вашей DAW и операционной системы.</p>
      `
    },
    {
      id: 'q5',
      question: 'Как установить и использовать VST плагины?',
      answer: `
        <p><strong>Пошаговая инструкция:</strong></p>
        <ol>
          <li><strong>Скачайте плагин:</strong> С сайта производителя или через менеджер установки (Native Access, iZotope Portal).</li>
          <li><strong>Установите:</strong> Запустите установщик и выберите папку для VST (обычно <code>C:/Program Files/VSTPlugins</code> или <code>/Library/Audio/Plug-Ins/VST</code>).</li>
          <li><strong>Запустите DAW:</strong> Откройте вашу программу для записи.</li>
          <li><strong>Сканирование:</strong> DAW автоматически просканирует папки с плагинами при запуске. Иногда нужно нажать "Rescan" вручную.</li>
          <li><strong>Добавление на трек:</strong> Вставьте плагин на дорожку через меню вставок или эффектов.</li>
          <li><strong>Настройка:</strong> Откройте окно плагина и настройте параметры.</li>
        </ol>
        <p><strong>Совет:</strong> Держите все VST в одной папке, чтобы упростить управление.</p>
      `
    },
    {
      id: 'q6',
      question: 'Топ-10 лучших VST плагинов для сведения и мастеринга',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Цена</th>
              <th>Для чего</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>1</strong></td><td>FabFilter Pro-Q 3</td><td>🎛️ EQ</td><td>~$200</td><td>Профессиональный эквалайзер</td></tr>
            <tr><td><strong>2</strong></td><td>FabFilter Pro-C 2</td><td>📊 Компрессор</td><td>~$200</td><td>Универсальный компрессор</td></tr>
            <tr><td><strong>3</strong></td><td>Valhalla Room</td><td>🌊 Реверберация</td><td>~$50</td><td>Лучшая реверберация</td></tr>
            <tr><td><strong>4</strong></td><td>Soundtoys EchoBoy</td><td>⏳ Дилей</td><td>~$200</td><td>Классический дилей</td></tr>
            <tr><td><strong>5</strong></td><td>FabFilter Saturn 2</td><td>🔥 Сатурация</td><td>~$200</td><td>Многополосная сатурация</td></tr>
            <tr><td><strong>6</strong></td><td>FabFilter Pro-L 2</td><td>📈 Лимитер</td><td>~$200</td><td>True Peak лимитер</td></tr>
            <tr><td><strong>7</strong></td><td>iZotope Ozone 11</td><td>🎧 Мастеринг</td><td>~$400</td><td>Полный набор для мастеринга</td></tr>
            <tr><td><strong>8</strong></td><td>Serum</td><td>🎹 Синтезатор</td><td>~$200</td><td>Мощный синтезатор</td></tr>
            <tr><td><strong>9</strong></td><td>Native Instruments Kontakt 7</td><td>🎚️ Сэмплер</td><td>~$400</td><td>Сэмплер для оркестровых звуков</td></tr>
            <tr><td><strong>10</strong></td><td>Waves Tune</td><td>🎤 Вокал</td><td>~$100</td><td>Автотюн для вокала</td></tr>
          </tbody>
        </table>
        <p><strong>В HHRecords мы используем FabFilter Suite как основу для сведения и мастеринга.</strong></p>
      `
    },
    {
      id: 'q7',
      question: 'Бесплатные vs платные VST — что выбрать?',
      answer: `
        <p><strong>Бесплатные VST (Freeware):</strong></p>
        <ul>
          <li><strong>Плюсы:</strong> Бесплатно, можно попробовать много разных плагинов</li>
          <li><strong>Минусы:</strong> Ограниченный функционал, могут быть баги, нет поддержки</li>
        </ul>
        <p><strong>Платные VST:</strong></p>
        <ul>
          <li><strong>Плюсы:</strong> Профессиональный функционал, поддержка, обновления, высокое качество звука</li>
          <li><strong>Минусы:</strong> Стоят денег ($50–$600)</li>
        </ul>
        <p><strong>Топ-5 бесплатных VST:</strong></p>
        <ul>
          <li><strong>Vital:</strong> Бесплатный синтезатор, альтернатива Serum</li>
          <li><strong>Youlean Loudness Meter:</strong> Измерение LUFS</li>
          <li><strong>OTT:</strong> Мультибендный компрессор</li>
          <li><strong>Valhalla Supermassive:</strong> Бесплатный ревербератор и дилей</li>
          <li><strong>Voxengo SPAN:</strong> Спектроанализатор</li>
        </ul>
        <p><strong>Совет:</strong> Начните с бесплатных VST, а затем постепенно покупайте профессиональные плагины для конкретных задач.</p>
      `
    },
    {
      id: 'q8',
      question: 'Какие ошибки часто допускают при работе с VST плагинами?',
      answer: `
        <ul>
          <li><strong>Перегрузка CPU.</strong> Слишком много плагинов одновременно. <strong>Решение:</strong> замораживайте (freeze) треки или используйте плагины экономно.</li>
          <li><strong>Неправильные пути установки.</strong> DAW не видит плагин. <strong>Решение:</strong> проверьте, что плагин установлен в правильную папку (VST, VST3, AU).</li>
          <li><strong>Несовместимость форматов.</strong> Плагин не работает в вашей DAW. <strong>Решение:</strong> проверьте, что плагин поддерживает ваш формат (VST, AU, AAX).</li>
          <li><strong>Устаревшие версии.</strong> Плагин работает нестабильно. <strong>Решение:</strong> обновите плагин до последней версии.</li>
          <li><strong>Слишком агрессивные настройки.</strong> Перебор с эффектами. <strong>Решение:</strong> делайте небольшие изменения и проверяйте результат.</li>
        </ul>
      `
    }
  ],

  genreTable: {
    title: '🎯 Какие VST плагины мы используем в HHRecords для разных жанров',
    rows: [
      { genre: 'Хип-хоп / Рэп', boost: 'Serum (синтезатор), Kontakt (сэмплы), Waves Tune (вокал)', cut: 'FabFilter Pro-Q 3, Pro-C 2, Pro-L 2' },
      { genre: 'Электронная музыка', boost: 'Serum, Massive, Valhalla Room, EchoBoy', cut: 'OTT, Saturn 2, Pro-L 2' },
      { genre: 'Рок / Поп', boost: 'Amplitube (гитара), Kontakt (барабаны), Pro-Q 3', cut: 'Pro-C 2, Valhalla Room, Pro-L 2' },
      { genre: 'Кино / Оркестр', boost: 'Kontakt (оркестр), Cinematic Studio Series, Valhalla Room', cut: 'Pro-Q 3, Pro-C 2, Ozone 11' },
      { genre: 'Мастеринг', boost: 'Ozone 11, Pro-L 2, Pro-Q 3', cut: 'Saturn 2, Ozone Maximizer' },
      { genre: 'Подкасты / Речь', boost: 'Waves Tune, Vocalign, RX (шумоподавление)', cut: 'Pro-Q 3, Pro-C 2, DeEsser' },
    ],
    note: 'Мы подбираем плагины под конкретную задачу. Для сведения используем FabFilter Suite, для мастеринга — iZotope Ozone, для творческих задач — Soundtoys и Valhalla.'
  },

  quickStart: {
    title: '🚀 Быстрый старт для новичков',
    steps: [
      'Скачайте <strong>бесплатные VST</strong> — начните с Vital (синтезатор), OTT (компрессор), Valhalla Supermassive (реверберация).',
      'Установите VST в <strong>одну папку</strong> (например, <code>C:/Program Files/VSTPlugins</code>).',
      'Запустите <strong>DAW</strong> и просканируйте плагины (обычно автоматически).',
      'Создайте <strong>дорожку</strong> и добавьте плагин через меню вставок.',
      'Откройте окно плагина и <strong>настройте параметры</strong>.',
      'Попробуйте <strong>пресеты</strong> — это готовые настройки плагина.',
      'Начните с <strong>бесплатных плагинов</strong>, а для профессиональных задач покупайте <strong>FabFilter, Valhalla, iZotope</strong>.',
    ]
  },

  checklist: {
    title: '✅ Чек-лист: готовы ли вы к работе с VST?',
    items: [
      { id: 'item1', text: 'Вы установили VST-плагины в правильную папку', hint: 'VST/VST3/AU — зависит от DAW' },
      { id: 'item2', text: 'DAW видит ваши плагины (сканирование прошло успешно)', hint: 'Проверьте список плагинов в DAW' },
      { id: 'item3', text: 'Вы знаете, как добавить плагин на дорожку', hint: 'Меню вставок или эффектов в DAW' },
      { id: 'item4', text: 'Вы понимаете разницу между VSTi (инструмент) и VST (эффект)', hint: 'VSTi генерирует звук, VST — обрабатывает' },
      { id: 'item5', text: 'Вы знаете, что такое CPU и как не перегружать его', hint: 'Замораживайте (freeze) тяжёлые треки' },
      { id: 'item6', text: 'Вы пробовали бесплатные VST и знаете, что вам нужно', hint: 'Vital, OTT, Valhalla Supermassive — отличный старт' },
      { id: 'item7', text: 'Вы понимаете, какой формат плагина нужен для вашей DAW', hint: 'VST для Windows, AU для macOS, AAX для Pro Tools' },
    ],
    storageKey: 'hhrecords_vst_checklist'
  },

  userQuestions: {
    title: '❓ Вопросы от наших клиентов',
    items: [
      {
        question: 'Чем VST отличается от AU?',
        answer: 'VST — это формат от Steinberg, работает на Windows и macOS. AU (Audio Units) — это формат от Apple, работает только на macOS (Logic Pro, GarageBand). Если вы работаете на macOS, плагины часто идут в двух форматах — VST и AU. Выберите тот, который поддерживает ваша DAW.'
      },
      {
        question: 'Можно ли использовать VST без DAW?',
        answer: 'Обычно нет. VST плагины работают внутри хоста (DAW). Но есть отдельные программы-хосты, которые позволяют запускать VST без полноценной DAW (например, Blue Cat Audio PatchWork, MainStage). Также есть VST-плееры для живых выступлений.'
      },
      {
        question: 'Какой VST плагин самый важный?',
        answer: 'Эквалайзер (EQ) — основа сведения. Начните с FabFilter Pro-Q 3 (платный) или TDR Nova (бесплатный). Компрессор — второй по важности. Для начала достаточно стандартного компрессора в вашей DAW.'
      }
    ]
  },

  glossary: [
    { term: 'VST', definition: 'Virtual Studio Technology — формат плагинов от Steinberg.' },
    { term: 'VSTi', definition: 'VST Instrument — виртуальный инструмент (синтезатор, сэмплер).' },
    { term: 'AU', definition: 'Audio Units — формат плагинов для macOS от Apple.' },
    { term: 'AAX', definition: 'Avid Audio Extensions — формат для Pro Tools.' },
    { term: 'DAW', definition: 'Digital Audio Workstation — программа для записи и сведения.' },
    { term: 'CPU', definition: 'Центральный процессор — ресурс, который потребляют плагины.' },
    { term: 'Preset', definition: 'Готовые настройки плагина.' },
    { term: 'Freeze', definition: 'Замораживание трека — рендеринг аудио для экономии CPU.' },
  ],

  tip: `
    <p>В студии HHRecords мы используем широкий спектр VST плагинов. Главный принцип: <strong>качество, а не количество</strong>. Лучше иметь 5–10 отличных плагинов, чем 100 посредственных.</p>
    <p><strong>Наш основной набор:</strong></p>
    <ul>
      <li><strong>FabFilter Suite:</strong> Pro-Q 3, Pro-C 2, Pro-R, Pro-L 2 — основа сведения и мастеринга.</li>
      <li><strong>Soundtoys:</strong> EchoBoy, Decapitator, MicroShift — для творческих эффектов.</li>
      <li><strong>Valhalla:</strong> Room, VintageVerb — реверберации.</li>
      <li><strong>iZotope Ozone 11:</strong> Финальный мастеринг.</li>
      <li><strong>Native Instruments Kontakt:</strong> Оркестровые и студийные сэмплы.</li>
    </ul>
    <p><strong>Совет новичкам:</strong></p>
    <ul>
      <li>Начните с <strong>бесплатных VST</strong> (Vital, OTT, Valhalla Supermassive, SPAN).</li>
      <li>Постепенно покупайте <strong>профессиональные плагины</strong> по мере необходимости.</li>
      <li>Не гонитесь за количеством — <strong>изучите один плагин досконально</strong>, прежде чем покупать следующий.</li>
      <li>Используйте <strong>пресеты</strong> как стартовую точку, но всегда настраивайте под свой трек.</li>
    </ul>
  `,

  relatedTerms: [
    { slug: 'eq', icon: '🎛️', label: 'Эквализация' },
    { slug: 'compression', icon: '🎚️', label: 'Компрессия' },
    { slug: 'reverb', icon: '🌊', label: 'Реверберация' },
    { slug: 'delay', icon: '⏳', label: 'Дилей' },
    { slug: 'midi', icon: '🎹', label: 'MIDI' },
    { slug: 'audio-interface', icon: '🎧', label: 'Аудиоинтерфейс' },
    { slug: 'sample', icon: '🔊', label: 'Сэмпл' },
  ],

  sources: [
    { url: 'https://en.wikipedia.org/wiki/Virtual_Studio_Technology', label: 'Wikipedia — VST' },
    { url: 'https://www.steinberg.net/vst/', label: 'Steinberg — VST' },
    { url: 'https://www.soundonsound.com/techniques/vst-plugins-explained', label: 'Sound on Sound — VST Plugins' },
    { url: 'https://www.musicradar.com/news/best-free-vst-plugins', label: 'MusicRadar — Best Free VST Plugins' },
  ],

  widget: 'VSTWidget',
}