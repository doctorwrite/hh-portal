// lib/articles/data/gear-case.ts
import { ArticleData } from '../types'

export const gearCase: ArticleData = {
  title: 'Наше оборудование — что мы используем в студии звукозаписи HHRecords',
  description: 'В студии HHRecords мы используем профессиональное оборудование премиум-класса: микрофон Neumann TLM 103, аудиоинтерфейс UA Apollo Twin Solo, мониторы Focal Solo6 Be. Узнайте, какое оборудование мы используем для записи, сведения и мастеринга, и почему мы выбрали именно эти инструменты.',

  hero: {
    badge: 'Кейсы HHRecords',
    subtitle: 'В студии HHRecords мы используем профессиональное оборудование премиум-класса: микрофон Neumann TLM 103, аудиоинтерфейс UA Apollo Twin Solo, мониторы Focal Solo6 Be. Узнайте, какое оборудование мы используем для записи, сведения и мастеринга, и почему мы выбрали именно эти инструменты.',
    tags: ['⚙️ 10+ единиц оборудования', '⭐ 4.9 на основе 87 отзывов', '🎚️ Студия в Красноярске с 2016', '📚 Ссылки на источники'],
  },

  toc: [
    { id: 'q1', label: '1. Микрофон Neumann TLM 103' },
    { id: 'q2', label: '2. Аудиоинтерфейс UA Apollo Twin Solo' },
    { id: 'q3', label: '3. Студийные мониторы Focal Solo6 Be' },
    { id: 'q4', label: '4. Студийные наушники' },
    { id: 'q5', label: '5. Акустическая обработка помещения' },
    { id: 'q6', label: '6. Программное обеспечение' },
    { id: 'q7', label: '7. Почему мы выбрали это оборудование' },
  ],

  quickAnswer: `
    <strong>В студии HHRecords</strong> мы используем профессиональное оборудование премиум-класса: <strong>микрофон Neumann TLM 103</strong> (универсальный конденсаторный микрофон), <strong>аудиоинтерфейс UA Apollo Twin Solo</strong> (премиум-класс с DSP-процессором), <strong>мониторы Focal Solo6 Be</strong> (нейтральный звук для точного сведения), <strong>акустическую обработку</strong> и <strong>профессиональное ПО</strong>. Мы выбрали это оборудование за <strong>качество, надёжность и прозрачность звука</strong>.
  `,

  qa: [
    {
      id: 'q1',
      question: 'Микрофон Neumann TLM 103',
      answer: `
        <p><strong>Neumann TLM 103</strong> — это универсальный конденсаторный микрофон премиум-класса, который мы используем в студии HHRecords.</p>
        <p><strong>Технические характеристики:</strong></p>
        <ul>
          <li><strong>Тип:</strong> Конденсаторный (Large Diaphragm)</li>
          <li><strong>Диафрагма:</strong> 1 дюйм</li>
          <li><strong>Частотный диапазон:</strong> 20 Гц – 20 кГц</li>
          <li><strong>Диаграмма направленности:</strong> Кардиоида</li>
          <li><strong>Чувствительность:</strong> 23 мВ/Па</li>
          <li><strong>Уровень шума:</strong> 7 дБ (A-взвешенный)</li>
          <li><strong>Макс. SPL:</strong> 138 дБ (с падом)</li>
        </ul>
        <p><strong>Почему мы выбрали TLM 103:</strong></p>
        <ul>
          <li><strong>Нейтральный звук:</strong> Микрофон не окрашивает звук — записывает голос таким, какой он есть.</li>
          <li><strong>Универсальность:</strong> Подходит для любых голосов — от тихого шёпота до громкого рэпа.</li>
          <li><strong>Надёжность:</strong> Немецкое качество, проверенное десятилетиями.</li>
          <li><strong>Мало шума:</strong> 7 дБ — один из лучших показателей в классе.</li>
        </ul>
        <p><strong>На что способен TLM 103:</strong></p>
        <ul>
          <li><strong>Вокал:</strong> Детальный, чистый звук с хорошей передачей нюансов.</li>
          <li><strong>Рэп:</strong> Плотный, разборчивый звук с хорошей атакой.</li>
          <li><strong>Акустические инструменты:</strong> Гитар, фортепиано, струнные.</li>
          <li><strong>Озвучка:</strong> Чистый голос для подкастов и аудиокниг.</li>
        </ul>
        <p><strong>В HHRecords мы используем TLM 103 для записи вокала, рэпа и акустических инструментов.</strong></p>
      `
    },
    {
      id: 'q2',
      question: 'Аудиоинтерфейс UA Apollo Twin Solo',
      answer: `
        <p><strong>UA Apollo Twin Solo</strong> — это профессиональный аудиоинтерфейс премиум-класса, который мы используем в студии HHRecords.</p>
        <p><strong>Технические характеристики:</strong></p>
        <ul>
          <li><strong>DSP-процессор:</strong> 1 ядро (Solo)</li>
          <li><strong>Входы:</strong> 2 комбинированных (XLR/TRS)</li>
          <li><strong>Выходы:</strong> 4 (2 мониторных, 2 линейных)</li>
          <li><strong>Подключение:</strong> Thunderbolt</li>
          <li><strong>Предусилители:</strong> Class-A, 65 дБ усиления</li>
          <li><strong>Преобразователи:</strong> 24 бит / 192 кГц</li>
          <li><strong>Фантомное питание:</strong> +48 В</li>
        </ul>
        <p><strong>Почему мы выбрали Apollo Twin Solo:</strong></p>
        <ul>
          <li><strong>Качество звука:</strong> Профессиональные преобразователи и предусилители.</li>
          <li><strong>DSP-процессор:</strong> Обработка плагинов (UAD) без задержки.</li>
          <li><strong>Надёжность:</strong> Universal Audio — стандарт индустрии.</li>
          <li><strong>Универсальность:</strong> Подходит для записи вокала, гитары, синтезаторов.</li>
        </ul>
        <p><strong>В HHRecords мы используем Apollo Twin Solo для записи и сведения треков.</strong></p>
      `
    },
    {
      id: 'q3',
      question: 'Студийные мониторы Focal Solo6 Be',
      answer: `
        <p><strong>Focal Solo6 Be</strong> — это студийные мониторы ближнего поля, которые мы используем в HHRecords для точного сведения.</p>
        <p><strong>Технические характеристики:</strong></p>
        <ul>
          <li><strong>Тип:</strong> Ближнее поле (Nearfield)</li>
          <li><strong>Вуфер:</strong> 6.5" (бериллий)</li>
          <li><strong>Твитер:</strong> 1" (бериллий, инвертированный купол)</li>
          <li><strong>Частотный диапазон:</strong> 40 Гц – 40 кГц</li>
          <li><strong>Мощность:</strong> 100 Вт (класс AB)</li>
          <li><strong>Кроссовер:</strong> 2.4 кГц</li>
        </ul>
        <p><strong>Почему мы выбрали Focal Solo6 Be:</strong></p>
        <ul>
          <li><strong>Нейтральный звук:</strong> Минимум окраски — слышно правду о миксе.</li>
          <li><strong>Детализация:</strong> Бериллиевый твитер даёт высокую детализацию.</li>
          <li><strong>Глубокий бас:</strong> 6.5" вуфер даёт хорошую низкочастотную отдачу.</li>
          <li><strong>Надёжность:</strong> Французское качество, ручная сборка.</li>
        </ul>
        <p><strong>В HHRecords мы используем Focal Solo6 Be для сведения и мастеринга.</strong></p>
      `
    },
    {
      id: 'q4',
      question: 'Студийные наушники',
      answer: `
        <p><strong>В HHRecords мы используем профессиональные студийные наушники для контроля звука.</strong></p>
        <p><strong>Основные модели:</strong></p>
        <ul>
          <li><strong>Beyerdynamic DT 770 Pro (закрытые):</strong> Для записи вокала — изолируют звук, не подводят.</li>
          <li><strong>Audio-Technica ATH-M50x (закрытые):</strong> Для контроля микса — сбалансированный звук.</li>
          <li><strong>Sennheiser HD 600 (открытые):</strong> Для мастеринга — детальный, естественный звук.</li>
        </ul>
        <p><strong>Зачем нам несколько пар:</strong></p>
        <ul>
          <li><strong>Закрытые:</strong> Для записи — изолируют звук и не подводят.</li>
          <li><strong>Открытые:</strong> Для контроля — дают более естественную звуковую картину.</li>
        </ul>
      `
    },
    {
      id: 'q5',
      question: 'Акустическая обработка помещения',
      answer: `
        <p><strong>Акустическая обработка — это половина успеха.</strong> Мы уделяем этому особое внимание.</p>
        <p><strong>Что мы используем:</strong></p>
        <ul>
          <li><strong>Звукопоглощающие панели:</strong> В точках первых отражений (сбоку, сверху, сзади).</li>
          <li><strong>Бас-ловушки (Bass Traps):</strong> В углах комнаты для контроля низких частот.</li>
          <li><strong>Диффузоры:</strong> На задней стене для рассеивания звука.</li>
          <li><strong>Ковровое покрытие:</strong> Для уменьшения отражений от пола.</li>
        </ul>
        <p><strong>Почему это важно:</strong></p>
        <ul>
          <li>Позволяет слышать реальный звук без окраски комнаты.</li>
          <li>Делает запись чище (без эха и отражений).</li>
          <li>Упрощает сведение (мониторы не врут).</li>
        </ul>
      `
    },
    {
      id: 'q6',
      question: 'Программное обеспечение',
      answer: `
        <p><strong>В HHRecords мы используем профессиональное ПО для записи, сведения и мастеринга.</strong></p>
        <p><strong>Основное ПО:</strong></p>
        <ul>
          <li><strong>Ableton Live 11 Suite:</strong> Основная DAW для записи и сведения.</li>
          <li><strong>Logic Pro X:</strong> Альтернативная DAW для работы с вокалом.</li>
          <li><strong>FabFilter Suite:</strong> Pro-Q 3, Pro-C 2, Pro-L 2, Saturn 2.</li>
          <li><strong>iZotope Ozone 11:</strong> Мастеринг.</li>
          <li><strong>Soundtoys 5:</strong> Творческие эффекты (Decapitator, EchoBoy).</li>
          <li><strong>Valhalla DSP:</strong> Reverb (Room, VintageVerb).</li>
        </ul>
      `
    },
    {
      id: 'q7',
      question: 'Почему мы выбрали это оборудование?',
      answer: `
        <p><strong>Мы выбирали оборудование по трём принципам:</strong></p>
        <ul>
          <li><strong>Качество:</strong> Только проверенные бренды с безупречной репутацией.</li>
          <li><strong>Надёжность:</strong> Оборудование, которое не подведёт в ответственный момент.</li>
          <li><strong>Прозрачность:</strong> Мы должны слышать правду о звуке — без украшательств.</li>
        </ul>
        <p><strong>Наш выбор:</strong></p>
        <ul>
          <li><strong>Neumann TLM 103:</strong> Честный микрофон, который не врет.</li>
          <li><strong>UA Apollo Twin Solo:</strong> Профессиональное сердце студии.</li>
          <li><strong>Focal Solo6 Be:</strong> Мониторы, которые показывают правду.</li>
        </ul>
        <p><strong>Мы считаем, что правильное оборудование — это инструмент, а не самоцель. Оно помогает нам делать качественный звук для наших клиентов.</strong></p>
      `
    }
  ],

  // Нет genreTable, quickStart, checklist — это имиджевая статья
  genreTable: undefined,
  quickStart: undefined,
  checklist: undefined,

  userQuestions: {
    title: '❓ Часто задаваемые вопросы об оборудовании',
    items: [
      {
        question: 'Почему вы выбрали Neumann TLM 103, а не другой микрофон?',
        answer: 'TLM 103 — это универсальный микрофон с нейтральным звуком. Он подходит для любых голосов и даёт честную запись без окраски. Мы можем работать с любым вокалом — от тихого до громкого.'
      },
      {
        question: 'Чем UA Apollo Twin Solo лучше других интерфейсов?',
        answer: 'Apollo Twin Solo имеет профессиональные преобразователи, Class-A предусилители и DSP-процессор для обработки плагинов без задержки. Это даёт чистый сигнал и возможность использовать UAD-плагины в реальном времени.'
      },
      {
        question: 'Почему мониторы Focal?',
        answer: 'Focal Solo6 Be даёт нейтральный и детальный звук. Мы слышим правду о миксе, а не "красивую" картинку. Бериллиевый твитер даёт высокую детализацию, а 6.5" вуфер — хороший бас.'
      }
    ]
  },

  glossary: [
    { term: 'Конденсаторный микрофон', definition: 'Микрофон с высокой чувствительностью для записи вокала.' },
    { term: 'Кардиоида', definition: 'Диаграмма направленности, захватывающая звук спереди.' },
    { term: 'DSP-процессор', definition: 'Процессор для обработки звука в реальном времени.' },
    { term: 'Бериллиевый твитер', definition: 'Высокочастотный динамик из бериллия для детального звука.' },
    { term: 'Бас-ловушки (Bass Traps)', definition: 'Угловые панели для поглощения низких частот.' },
  ],

  tip: `
    <p>В HHRecords мы считаем, что <strong>оборудование — это инструмент, а не самоцель</strong>. Мы выбрали технику, которая даёт <strong>честный, прозрачный и детальный звук</strong>. Это позволяет нам сосредоточиться на главном — на музыке и эмоциях.</p>
    <p><strong>Наш подход к оборудованию:</strong></p>
    <ul>
      <li><strong>Качество:</strong> Мы не экономим на том, что влияет на звук.</li>
      <li><strong>Надёжность:</strong> Мы используем проверенное оборудование, которое не подведёт.</li>
      <li><strong>Прозрачность:</strong> Мы слышим правду о звуке, чтобы принимать правильные решения.</li>
    </ul>
  `,

  relatedTerms: [
    { slug: 'philosophy', icon: '💡', label: 'Наша философия' },
    { slug: 'case1', icon: '🎤', label: 'Кейс: спасли трек с плохим вокалом' },
    { slug: 'case2', icon: '🎸', label: 'Кейс: спасли трек с плохим гитарным звуком' },
    { slug: 'case3', icon: '🎧', label: 'Кейс: мастеринг за 2 часа' },
    { slug: 'case4', icon: '🎵', label: 'Кейс: рэп-исполнитель' },
    { slug: 'case5', icon: '🎛️', label: 'Кейс: работа с "сырым" материалом' },
    { slug: 'case6', icon: '🔊', label: 'Кейс: создание мощного звука' },
  ],

  sources: [
    { url: 'https://www.neumann.com/en-us/products/microphones/tlm-103/', label: 'Neumann TLM 103' },
    { url: 'https://www.uaudio.com/audio-interfaces/apollo-twin.html', label: 'UA Apollo Twin' },
    { url: 'https://www.focal.com/en/pro-audio/solo6-be/', label: 'Focal Solo6 Be' },
  ],

  widget: 'GearWidget',
}