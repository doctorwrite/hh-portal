// lib/articles/data/midi-controller.ts
import { ArticleData } from '../types'

export const midiController: ArticleData = {
  title: 'MIDI-контроллер — что это? Полное руководство по выбору и использованию',
  description: 'MIDI-контроллер — это устройство для управления виртуальными инструментами и DAW через MIDI-протокол. Узнайте, какие бывают типы контроллеров (клавиатурные, pad, микшерные, DJ), как выбрать идеальный для ваших задач, подключить к компьютеру, настроить в DAW и использовать в студии HHRecords.',

  hero: {
    badge: 'Энциклопедия звукозаписи',
    subtitle: 'Узнайте, какие бывают типы контроллеров (клавиатурные, pad, микшерные, DJ), как выбрать идеальный для ваших задач, подключить к компьютеру, настроить в DAW и использовать в студии HHRecords.',
    tags: ['📌 7 вопросов', '⭐ 4.9 на основе 87 отзывов', '🎚️ Студия в Красноярске с 2016', '📚 Ссылки на источники'],
  },

  toc: [
    { id: 'q1', label: '1. Что такое MIDI-контроллер?' },
    { id: 'q2', label: '2. Какие бывают типы MIDI-контроллеров?' },
    { id: 'q3', label: '3. Как подключить MIDI-контроллер?' },
    { id: 'q4', label: '4. Что можно делать с MIDI-контроллером?' },
    { id: 'q5', label: '5. Как выбрать MIDI-контроллер?' },
    { id: 'q6', label: '6. Топ-5 MIDI-контроллеров для разных задач' },
    { id: 'q7', label: '7. Советы по настройке и использованию' },
  ],

  quickAnswer: `
    <strong>MIDI-контроллер</strong> — это устройство для управления виртуальными инструментами, синтезаторами и DAW через MIDI-протокол. Он не генерирует звук сам, а отправляет MIDI-команды (ноты, Velocity, CC) для управления звуком. Это ваш главный инструмент для игры на виртуальных инструментах, записи партий и управления студией.
  `,

  qa: [
    {
      id: 'q1',
      question: 'Что такое MIDI-контроллер?',
      answer: `
        <p><strong>MIDI-контроллер</strong> — это устройство, которое отправляет MIDI-команды в компьютер или синтезатор. Он не генерирует звук сам — он <strong>управляет</strong> звуком.</p>
        <p><strong>Как это работает:</strong></p>
        <ol>
          <li>Вы нажимаете клавишу или пад на контроллере.</li>
          <li>Контроллер отправляет MIDI-сообщение (Note On, Velocity, Channel).</li>
          <li>DAW или синтезатор получает сообщение и генерирует звук.</li>
        </ol>
        <p><strong>Важно:</strong> MIDI-контроллер — это не синтезатор. Он не имеет встроенных звуков. Это инструмент для управления.</p>
        <p><strong>Чем отличается от синтезатора:</strong></p>
        <ul>
          <li><strong>MIDI-контроллер:</strong> Только управление, без звуков.</li>
          <li><strong>Синтезатор:</strong> Генерирует звук сам, может иметь встроенную клавиатуру.</li>
        </ul>
      `
    },
    {
      id: 'q2',
      question: 'Какие бывают типы MIDI-контроллеров?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Особенности</th>
              <th>Для кого</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>🎹 Клавиатурные</strong></td><td>Клавиши как у пианино, 25–88 клавиш</td><td>Пианисты, композиторы</td></tr>
            <tr><td><strong>🥁 Pad-контроллеры</strong></td><td>Чувствительные к удару пэды, 8–64 пэда</td><td>Битмейкеры, продюсеры электронной музыки</td></tr>
            <tr><td><strong>🎛️ Микшерные</strong></td><td>Фейдеры, кнобы, кнопки</td><td>Звукорежиссёры, сведение</td></tr>
            <tr><td><strong>🎚️ DJ-контроллеры</strong></td><td>Джоги, кроссфейдер, пэды</td><td>DJ, живые выступления</td></tr>
            <tr><td><strong>🎸 Гитаро-подобные</strong></td><td>Струны как на гитаре</td><td>Гитаристы</td></tr>
            <tr><td><strong>🌬️ Дыхательные</strong></td><td>Управление дыханием</td><td>Виртуозы</td></tr>
          </tbody>
        </table>
      `
    },
    {
      id: 'q3',
      question: 'Как подключить MIDI-контроллер к компьютеру?',
      answer: `
        <ol>
          <li><strong>USB:</strong> Большинство современных контроллеров подключаются через USB. Просто вставьте кабель и выберите контроллер в DAW.</li>
          <li><strong>MIDI DIN:</strong> Для старых устройств используется 5-пиновый MIDI-кабель + USB-адаптер или MIDI-интерфейс.</li>
          <li><strong>Bluetooth:</strong> Некоторые модели поддерживают беспроводное подключение (удобно для iPad/iPhone).</li>
          <li><strong>Настройка в DAW:</strong> В настройках (Preferences → MIDI) выберите контроллер и включите его.</li>
        </ol>
        <p><strong>Совет:</strong> Убедитесь, что драйверы установлены (для некоторых моделей требуется отдельная установка). Для большинства современных контроллеров драйверы не нужны — работают "plug and play".</p>
      `
    },
    {
      id: 'q4',
      question: 'Что можно делать с MIDI-контроллером?',
      answer: `
        <ul>
          <li><strong>Играть на виртуальных инструментах:</strong> Пианино, синтезаторы, оркестровые сэмплы.</li>
          <li><strong>Управлять эффектами:</strong> Менять параметры плагинов в реальном времени (EQ, компрессор, реверберация).</li>
          <li><strong>Автоматизация:</strong> Записывать движения фейдеров и кнобов для автоматизации в DAW.</li>
          <li><strong>Запуск клипов:</strong> В Ableton Live или Bitwig можно запускать аудио- и MIDI-клипы с пэдов.</li>
          <li><strong>DJ-сеты:</strong> Микшировать треки, управлять эффектами на сцене.</li>
          <li><strong>Обучение:</strong> Использовать контроллер для обучения игре на фортепиано.</li>
          <li><strong>Управление светом и видео:</strong> MIDI может управлять не только звуком, но и световым оборудованием.</li>
        </ul>
      `
    },
    {
      id: 'q5',
      question: 'Как выбрать MIDI-контроллер для домашней студии?',
      answer: `
        <p><strong>Ключевые факторы:</strong></p>
        <ul>
          <li><strong>Бюджет:</strong> От 3 000 ₽ (базовые модели) до 50 000+ ₽ (профессиональные).</li>
          <li><strong>Тип:</strong> Для игры — клавиатура, для битов — pad-контроллер, для сведения — микшер.</li>
          <li><strong>Размер клавиатуры:</strong> 25 клавиш — компактно, 49 — универсально, 61+ — для пианистов.</li>
          <li><strong>Интеграция с DAW:</strong> Некоторые контроллеры специально созданы для Ableton, Logic, FL Studio.</li>
          <li><strong>Дополнительные элементы:</strong> Пэды, фейдеры, кнобы, скроллеры.</li>
        </ul>
        <p><strong>Советы по выбору:</strong></p>
        <ul>
          <li>Для <strong>начала</strong>: 25-49 клавиш + 8 пэдов (Akai MPK Mini, Arturia KeyLab Essential).</li>
          <li>Для <strong>пианистов</strong>: 88 клавиш с молоточковой механикой (StudioLogic, Kawai).</li>
          <li>Для <strong>битмейкеров</strong>: Pad-контроллер (Ableton Push, Akai MPC, Maschine).</li>
          <li>Для <strong>Ableton Live</strong>: Novation Launchkey или Launchpad.</li>
        </ul>
      `
    },
    {
      id: 'q6',
      question: 'Топ-5 MIDI-контроллеров для разных задач',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Модель</th>
              <th>Тип</th>
              <th>Цена</th>
              <th>Для кого</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>1</strong></td><td>Akai MPK Mini MK3</td><td>🎹 Клавиатура + пэды</td><td>~10 000 ₽</td><td>Начинающие, битмейкеры</td></tr>
            <tr><td><strong>2</strong></td><td>Arturia KeyLab Essential 49</td><td>🎹 Клавиатура</td><td>~20 000 ₽</td><td>Универсальный, домашняя студия</td></tr>
            <tr><td><strong>3</strong></td><td>Novation Launchkey 49 MK3</td><td>🎹 Клавиатура + пэды</td><td>~18 000 ₽</td><td>Ableton Live</td></tr>
            <tr><td><strong>4</strong></td><td>Ableton Push 3</td><td>🥁 Pad-контроллер</td><td>~80 000 ₽</td><td>Профессиональные продюсеры</td></tr>
            <tr><td><strong>5</strong></td><td>Native Instruments Komplete Kontrol S49</td><td>🎹 Клавиатура</td><td>~45 000 ₽</td><td>Интеграция с Kontakt, оркестр</td></tr>
          </tbody>
        </table>
        <p><strong>Совет:</strong> Для начала возьмите Akai MPK Mini MK3 или Arturia KeyLab Essential 49 — это лучшие варианты для домашней студии.</p>
      `
    },
    {
      id: 'q7',
      question: 'Советы по настройке и использованию MIDI-контроллера',
      answer: `
        <ul>
          <li><strong>Assign (назначение):</strong> Назначьте фейдеры и кнобы на важные параметры — это ускорит работу.</li>
          <li><strong>MIDI Mapping:</strong> В DAW используйте MIDI Learn для привязки элементов контроллера к параметрам.</li>
          <li><strong>Шаблоны (Templates):</strong> Создайте шаблоны для разных задач (запись, сведение, мастеринг).</li>
          <li><strong>Velocity Curve:</strong> Настройте кривую Velocity под свою игру — это важно для экспрессии.</li>
          <li><strong>Задержка (Latency):</strong> Используйте ASIO-драйверы для минимальной задержки.</li>
          <li><strong>Экспериментируйте:</strong> Пробуйте нестандартные назначения — это может открыть новые звуковые возможности.</li>
          <li><strong>Обновляйте прошивку:</strong> Производители часто выпускают обновления для улучшения работы.</li>
        </ul>
        <p><strong>Совет от HHRecords:</strong> Не бойтесь переназначать кнопки и фейдеры под свои задачи. Стандартные настройки — не всегда лучшие.</p>
      `
    }
  ],

  genreTable: {
    title: '🎯 Какие MIDI-контроллеры мы используем в HHRecords для разных задач',
    rows: [
      { genre: 'Запись клавишных', boost: 'Arturia KeyLab Essential 49, 88 клавиш, молоточковая механика', cut: 'Чувствительность к Velocity, педаль' },
      { genre: 'Битмейкинг', boost: 'Akai MPK Mini MK3, Ableton Push, Maschine', cut: '8–16 пэдов, чувствительность к удару' },
      { genre: 'Сведение и автоматизация', boost: 'Novation Launchkey, микшерные контроллеры', cut: 'Фейдеры, кнобы, MIDI Mapping' },
      { genre: 'Живые выступления', boost: 'Ableton Push, Launchpad, DJ-контроллеры', cut: 'Пэды, клип-запуск, автоматизация' },
      { genre: 'Оркестровые аранжировки', boost: 'Native Instruments Kontrol S49, 88 клавиш', cut: 'Интеграция с Kontakt, артикуляции' },
    ],
    note: 'Мы подбираем контроллер под конкретную задачу. Для битов — Akai MPK или Push, для клавишных — KeyLab, для сведения — Launchkey.'
  },

  quickStart: {
    title: '🚀 Быстрый старт для новичков',
    steps: [
      'Купите <strong>MIDI-контроллер</strong> — для начала подойдёт Akai MPK Mini MK3 или Arturia KeyLab Essential 49.',
      'Подключите его к компьютеру через <strong>USB</strong>.',
      'Откройте <strong>DAW</strong> и создайте MIDI-трек.',
      'Выберите <strong>виртуальный инструмент</strong> (VST) на треке — например, пианино или синтезатор.',
      'Нажмите на клавиши — вы услышите звук!',
      'Настройте <strong>Velocity Curve</strong> в DAW или на самом контроллере для комфортной игры.',
      'Назначьте <strong>фейдеры и кнобы</strong> на параметры плагинов через MIDI Learn.',
    ]
  },

  checklist: {
    title: '✅ Чек-лист: готовы ли вы к работе с MIDI-контроллером?',
    items: [
      { id: 'item1', text: 'MIDI-контроллер подключён к компьютеру', hint: 'Через USB или MIDI-кабель' },
      { id: 'item2', text: 'В DAW выбран правильный MIDI-вход', hint: 'Проверьте настройки MIDI в DAW' },
      { id: 'item3', text: 'Вы выбрали правильный тип контроллера под свои задачи', hint: 'Клавиатура, пэды, микшер, DJ' },
      { id: 'item4', text: 'Вы настроили Velocity Curve под свою игру', hint: 'Важно для экспрессии и динамики' },
      { id: 'item5', text: 'Вы назначили фейдеры и кнобы на важные параметры', hint: 'Используйте MIDI Learn в DAW' },
      { id: 'item6', text: 'Вы знаете, как использовать MIDI-карту (MIDI Mapping)', hint: 'Для привязки элементов к параметрам' },
      { id: 'item7', text: 'Вы создали шаблоны для разных задач', hint: 'Запись, сведение, мастеринг — разные настройки' },
    ],
    storageKey: 'hhrecords_midicontroller_checklist'
  },

  userQuestions: {
    title: '❓ Вопросы от наших клиентов',
    items: [
      {
        question: 'Можно ли использовать MIDI-контроллер без компьютера?',
        answer: 'Да, если у вас есть синтезатор или драм-машина с MIDI-входом. Подключите контроллер через MIDI DIN (5-пиновый кабель) и играйте напрямую. Это называется "MIDI-цепочка".'
      },
      {
        question: 'Какой MIDI-контроллер лучше для начинающих?',
        answer: 'Akai MPK Mini MK3 — компактный, 25 клавиш + 8 пэдов + 8 кнобов, отличная интеграция с DAW. Arturia KeyLab Essential 49 — 49 клавиш, больше возможностей для игры. Оба — отличный старт.'
      },
      {
        question: 'Чем отличается дорогой MIDI-контроллер от бюджетного?',
        answer: 'Качество клавиатуры (молоточковая механика vs синтезаторная), количество элементов (пэды, фейдеры, кнобы), качество пэдов (чувствительность), интеграция с DAW (автоматическое назначение), материалы и сборка.'
      }
    ]
  },

  glossary: [
    { term: 'MIDI-контроллер', definition: 'Устройство для отправки MIDI-команд.' },
    { term: 'Velocity', definition: 'Сила нажатия на клавишу или пад (0–127).' },
    { term: 'MIDI Channel', definition: 'Канал для маршрутизации MIDI-данных (1–16).' },
    { term: 'CC (Control Change)', definition: 'MIDI-сообщение для управления параметрами.' },
    { term: 'MIDI Mapping', definition: 'Привязка элементов контроллера к параметрам DAW.' },
    { term: 'DAW', definition: 'Цифровая рабочая станция для записи и сведения.' },
    { term: 'Pad', definition: 'Чувствительная к удару площадка на контроллере.' },
    { term: 'Fader', definition: 'Скользящий регулятор громкости.' },
    { term: 'Knob', definition: 'Круглый регулятор для управления параметрами.' },
    { term: 'Velocity Curve', definition: 'Кривая зависимости громкости от силы нажатия.' },
    { term: 'MPE (MIDI Polyphonic Expression)', definition: 'Расширенный MIDI-протокол для многомерного управления.' },
  ],

  tip: `
    <p>В студии HHRecords мы используем MIDI-контроллеры на каждом этапе работы. Главный принцип: <strong>MIDI-контроллер — это инструмент для творчества, а не просто устройство ввода</strong>.</p>
    <p><strong>Наш подход к выбору и использованию:</strong></p>
    <ul>
      <li><strong>Для записи клавишных:</strong> Arturia KeyLab Essential 49 — отличная клавиатура с хорошей механикой.</li>
      <li><strong>Для битов:</strong> Akai MPK Mini MK3 — компактный, с 8 пэдами и кнобами.</li>
      <li><strong>Для Ableton Live:</strong> Novation Launchkey или Launchpad — идеальная интеграция.</li>
      <li><strong>Для автоматизации:</strong> Назначаем фейдеры и кнобы на параметры плагинов через MIDI Learn.</li>
    </ul>
    <p><strong>Совет новичкам:</strong></p>
    <ul>
      <li><strong>Начните с бюджетного контроллера.</strong> Akai MPK Mini или Arturia KeyLab Essential — отличный старт.</li>
      <li><strong>Настройте Velocity Curve.</strong> Это сильно влияет на ощущение игры.</li>
      <li><strong>Используйте MIDI Learn.</strong> Назначайте кнобы и фейдеры на параметры, которые часто меняете.</li>
      <li><strong>Создайте шаблоны.</strong> Для записи, сведения и мастеринга — разные настройки.</li>
      <li><strong>Экспериментируйте.</strong> Пробуйте нестандартные назначения — это может открыть новые звуковые возможности.</li>
    </ul>
  `,

  relatedTerms: [
    { slug: 'eq', icon: '🎛️', label: 'Эквализация' },
    { slug: 'compression', icon: '🎚️', label: 'Компрессия' },
    { slug: 'reverb', icon: '🌊', label: 'Реверберация' },
    { slug: 'delay', icon: '⏳', label: 'Дилей' },
    { slug: 'midi', icon: '🎹', label: 'MIDI' },
    { slug: 'audio-interface', icon: '🎧', label: 'Аудиоинтерфейс' },
    { slug: 'vst', icon: '🧩', label: 'VST / Плагины' },
  ],

  sources: [
    { url: 'https://en.wikipedia.org/wiki/MIDI_controller', label: 'Wikipedia — MIDI Controller' },
    { url: 'https://www.soundonsound.com/techniques/choosing-midi-controller', label: 'Sound on Sound — Choosing a MIDI Controller' },
    { url: 'https://www.sweetwater.com/insync/midi-controller-buying-guide/', label: 'Sweetwater — MIDI Controller Buying Guide' },
    { url: 'https://www.akaipro.com/mpk-mini-mk3', label: 'Akai MPK Mini MK3' },
  ],

  widget: 'MIDIControllerWidget',
}