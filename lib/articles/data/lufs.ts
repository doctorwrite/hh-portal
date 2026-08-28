// lib/articles/data/lufs.ts
import { ArticleData } from '../types'

export const lufs: ArticleData = {
  title: 'LUFS в музыке — что это? Полное руководство по громкости для стримингов',
  description: 'LUFS (Loudness Units Full Scale) — это единица измерения воспринимаемой громкости звука, стандартизированная для стриминговых платформ. Узнайте, чем LUFS отличается от dBFS, как измеряется Integrated, Short-term и Momentary LUFS, какие стандарты у Spotify, Apple Music, YouTube и Яндекс.Музыки, как достичь целевого LUFS при мастеринге, что такое нормализация громкости и почему ваш трек может звучать тише на стримингах. Практические советы от студии HHRecords.',

  hero: {
    badge: 'Энциклопедия звукозаписи',
    subtitle: 'Узнайте, чем LUFS отличается от dBFS, как измеряется Integrated, Short-term и Momentary LUFS, какие стандарты у Spotify, Apple Music, YouTube и Яндекс.Музыки, как достичь целевого LUFS при мастеринге, что такое нормализация громкости и почему ваш трек может звучать тише на стримингах. Практические советы от студии HHRecords.',
    tags: ['📌 10 вопросов', '⭐ 4.9 на основе 87 отзывов', '🎚️ Студия в Красноярске с 2016', '📚 Ссылки на источники'],
  },

  toc: [
    { id: 'q1', label: '1. Что такое LUFS в музыке?' },
    { id: 'q2', label: '2. Чем LUFS отличается от dBFS?' },
    { id: 'q3', label: '3. Как измеряется LUFS?' },
    { id: 'q4', label: '4. Какие бывают типы LUFS?' },
    { id: 'q5', label: '5. Какой LUFS у стримингов?' },
    { id: 'q6', label: '6. Какой LUFS должен быть у трека?' },
    { id: 'q7', label: '7. Как измерить LUFS?' },
    { id: 'q8', label: '8. Как достичь целевого LUFS?' },
    { id: 'q9', label: '9. Что такое нормализация громкости?' },
    { id: 'q10', label: '10. Почему мой трек тише на Spotify?' },
  ],

  quickAnswer: `
    <strong>LUFS (Loudness Units Full Scale)</strong> — это единица измерения воспринимаемой громкости звука. В отличие от dBFS, который измеряет пиковые уровни сигнала, LUFS измеряет то, как человек реально слышит громкость, с учётом частотной характеристики уха и усреднения по времени. Стриминговые платформы используют LUFS для <strong>нормализации громкости</strong>, чтобы все треки звучали примерно одинаково. Стандарт для большинства платформ — <strong>-14 LUFS Integrated</strong> (Spotify, Apple Music, YouTube). Если ваш трек громче -14 LUFS, платформа приглушит его, а динамика не восстановится. Поэтому лучше делать трек динамичным и соответствовать -14 LUFS.
  `,

  qa: [
    {
      id: 'q1',
      question: 'Что такое LUFS в музыке?',
      answer: `
        <p><strong>LUFS (Loudness Units Full Scale)</strong> — это единица измерения воспринимаемой громкости звука. Это международный стандарт, который используется в телевидении, радио и стриминговых платформах для нормализации громкости.</p>
        <p><strong>Ключевые особенности LUFS:</strong></p>
        <ul>
          <li><strong>Воспринимаемая громкость:</strong> LUFS учитывает, как человек реально слышит звук (частотная характеристика уха).</li>
          <li><strong>Усреднение по времени:</strong> LUFS измеряет громкость не в момент, а за определённый промежуток времени.</li>
          <li><strong>Стандартизация:</strong> Все стриминговые платформы используют LUFS для нормализации.</li>
        </ul>
        <p><strong>Простыми словами:</strong></p>
        <ul>
          <li><strong>dBFS</strong> — показывает, насколько громко <em>сейчас</em> (пики).</li>
          <li><strong>LUFS</strong> — показывает, насколько громко <em>воспринимается</em> звук в целом.</li>
        </ul>
        <p><strong>Единица измерения:</strong> LUFS измеряется в децибелах относительно полной шкалы (Full Scale). Значения обычно отрицательные: -14 LUFS, -16 LUFS и т.д. Чем ближе к нулю — тем громче.</p>
      `
    },
    {
      id: 'q2',
      question: 'Чем LUFS отличается от dBFS?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Характеристика</th>
              <th>dBFS</th>
              <th>LUFS</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Что измеряет</strong></td><td>Пиковые уровни сигнала</td><td>Воспринимаемую громкость</td></tr>
            <tr><td><strong>Учитывает частоты</strong></td><td>Нет</td><td>Да (кривая K-взвешивания)</td></tr>
            <tr><td><strong>Усреднение</strong></td><td>Мгновенное</td><td>По времени (Integrated, Short-term)</td></tr>
            <tr><td><strong>Использование</strong></td><td>Технический контроль (клиппинг, headroom)</td><td>Нормализация громкости</td></tr>
            <tr><td><strong>Стриминги</strong></td><td>Не используется</td><td>Стандарт для всех платформ</td></tr>
          </tbody>
        </table>
        <p><strong>Главное отличие:</strong></p>
        <ul>
          <li><strong>dBFS</strong> — показывает, насколько громко в моменте (пик). Трек может иметь пик -0.1 dBFS, но звучать тихо.</li>
          <li><strong>LUFS</strong> — показывает, насколько громко воспринимается трек в целом. Два трека с одинаковым пиком могут иметь разный LUFS.</li>
        </ul>
        <p><strong>Пример:</strong></p>
        <ul>
          <li><strong>Классическая музыка:</strong> Пик -0.1 dBFS, LUFS -20 LUFS (тихо).</li>
          <li><strong>Электронная музыка:</strong> Пик -0.1 dBFS, LUFS -8 LUFS (громко).</li>
        </ul>
        <p><strong>Важно:</strong> Для стримингов важен LUFS, а не dBFS. Но dBFS всё ещё важен для контроля клиппинга.</p>
      `
    },
    {
      id: 'q3',
      question: 'Как измеряется LUFS?',
      answer: `
        <p>LUFS измеряется по стандарту <strong>ITU-R BS.1770</strong>, который определяет алгоритм расчёта воспринимаемой громкости.</p>
        <p><strong>Как это работает:</strong></p>
        <ol>
          <li><strong>Частотная фильтрация:</strong> Сигнал пропускается через фильтр K-взвешивания, который имитирует частотную характеристику человеческого уха (менее чувствителен к низким и очень высоким частотам).</li>
          <li><strong>Измерение энергии:</strong> Для каждого канала (L, R, C, Ls, Rs) вычисляется среднеквадратичное (RMS) значение.</li>
          <li><strong>Суммирование:</strong> Энергия всех каналов суммируется с учётом весов.</li>
          <li><strong>Усреднение:</strong> Результат усредняется по времени (в зависимости от типа LUFS).</li>
        </ol>
        <p><strong>K-взвешивание (K-weighting):</strong></p>
        <ul>
          <li>Это фильтр, который имитирует восприятие громкости человеческим ухом.</li>
          <li>Учитывает, что мы хуже слышим низкие и очень высокие частоты.</li>
          <li>Благодаря этому LUFS коррелирует с тем, как мы реально слышим громкость.</li>
        </ul>
        <p><strong>Важно:</strong> LUFS — это <strong>объективная</strong> мера воспринимаемой громкости, но она не всегда совпадает с <strong>субъективным</strong> восприятием (разные люди слышат по-разному).</p>
      `
    },
    {
      id: 'q4',
      question: 'Какие бывают типы LUFS?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Временное окно</th>
              <th>Для чего используется</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Integrated LUFS (I)</strong></td><td>Весь трек</td><td>Общая громкость трека (главный показатель для стримингов)</td></tr>
            <tr><td><strong>Short-term LUFS (S)</strong></td><td>3 секунды</td><td>Громкость в течение короткого отрезка (например, припев)</td></tr>
            <tr><td><strong>Momentary LUFS (M)</strong></td><td>400 мс</td><td>Мгновенная громкость (пиковые участки)</td></tr>
            <tr><td><strong>True Peak (TP)</strong></td><td>Мгновенный</td><td>Реальные пиковые значения с учётом интерполяции (межвыборочные пики)</td></tr>
            <tr><td><strong>Loudness Range (LRA)</strong></td><td>Весь трек</td><td>Динамический диапазон громкости (разница между тихими и громкими участками)</td></tr>
          </tbody>
        </table>
        <p><strong>Что важно для музыканта:</strong></p>
        <ul>
          <li><strong>Integrated LUFS</strong> — главный показатель для стримингов. Именно его нормализуют платформы.</li>
          <li><strong>True Peak</strong> — важен для контроля клиппинга (не должен превышать -1 dBTP для стримингов).</li>
          <li><strong>LRA</strong> — показывает динамику трека. Чем выше LRA, тем больше динамический диапазон.</li>
        </ul>
        <p><strong>В HHRecords мы смотрим на Integrated LUFS и True Peak при мастеринге.</strong></p>
      `
    },
    {
      id: 'q5',
      question: 'Какой LUFS у стримингов?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Платформа</th>
              <th>Целевой LUFS</th>
              <th>True Peak</th>
              <th>Примечание</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Spotify</strong></td><td>-14 LUFS</td><td>-1 dBTP</td><td>Нормализация по умолчанию (можно отключить)</td></tr>
            <tr><td><strong>Apple Music</strong></td><td>-16 LUFS</td><td>-1 dBTP</td><td>Sound Check включён по умолчанию</td></tr>
            <tr><td><strong>YouTube</strong></td><td>-14 LUFS</td><td>-1 dBTP</td><td>Нормализация для всех видео</td></tr>
            <tr><td><strong>Яндекс.Музыка</strong></td><td>-14 LUFS</td><td>-1 dBTP</td><td>Аналогично Spotify</td></tr>
            <tr><td><strong>Tidal</strong></td><td>-14 LUFS</td><td>-1 dBTP</td><td>Для Hi-Fi и Master качества</td></tr>
            <tr><td><strong>Amazon Music</strong></td><td>-14 LUFS</td><td>-1 dBTP</td><td>Для HD и Ultra HD</td></tr>
            <tr><td><strong>SoundCloud</strong></td><td>Нет нормализации</td><td>-</td><td>Не нормализует громкость</td></tr>
            <tr><td><strong>Bandcamp</strong></td><td>Нет нормализации</td><td>-</td><td>Не нормализует громкость</td></tr>
          </tbody>
        </table>
        <p><strong>Важно:</strong></p>
        <ul>
          <li>Большинство платформ нормализуют громкость к <strong>-14 LUFS</strong>.</li>
          <li>Apple Music использует <strong>-16 LUFS</strong> (чуть тише).</li>
          <li>Если ваш трек громче целевого значения, платформа <strong>приглушит</strong> его.</li>
          <li>Если тише — <strong>усилит</strong> (но с ограничениями).</li>
        </ul>
        <p><strong>В HHRecords мы мастерим треки под -14 LUFS для стримингов.</strong></p>
      `
    },
    {
      id: 'q6',
      question: 'Какой LUFS должен быть у трека?',
      answer: `
        <p><strong>Ответ зависит от цели:</strong></p>
        <ul>
          <li><strong>Для стримингов:</strong> -14 LUFS (Spotify, YouTube) или -16 LUFS (Apple Music).</li>
          <li><strong>Для клубов и радио:</strong> -9…-6 LUFS (громче, но с меньшей динамикой).</li>
          <li><strong>Для классической музыки:</strong> -20…-16 LUFS (большая динамика).</li>
          <li><strong>Для подкастов:</strong> -16…-14 LUFS (разборчивость важнее громкости).</li>
        </ul>
        <p><strong>Рекомендации по жанрам:</strong></p>
        <ul>
          <li><strong>Рэп/Хип-хоп:</strong> -14…-12 LUFS (плотный, насыщенный звук).</li>
          <li><strong>Поп:</strong> -14…-12 LUFS (коммерческая громкость).</li>
          <li><strong>Рок:</strong> -14…-12 LUFS (энергичный звук).</li>
          <li><strong>Электроника:</strong> -14…-10 LUFS (клубный звук).</li>
          <li><strong>Джаз/Классика:</strong> -18…-14 LUFS (большая динамика).</li>
        </ul>
        <p><strong>Главное правило:</strong></p>
        <ul>
          <li><strong>Не делайте трек громче -9 LUFS</strong> — это убивает динамику.</li>
          <li><strong>Лучше сделать тише, но с сохранением динамики</strong>, чем громкий и плоский.</li>
          <li><strong>Слушайте свой трек в контексте плейлиста</strong> — так вы поймёте, правильный ли уровень.</li>
        </ul>
        <p><strong>В HHRecords мы всегда ориентируемся на -14 LUFS для стримингов.</strong></p>
      `
    },
    {
      id: 'q7',
      question: 'Как измерить LUFS?',
      answer: `
        <p><strong>Способы измерения LUFS:</strong></p>
        <ol>
          <li><strong>Плагины для DAW:</strong>
            <ul>
              <li><strong>Youlean Loudness Meter</strong> — бесплатный, отличный, показывает Integrated, Short-term, Momentary, True Peak, LRA.</li>
              <li><strong>iZotope Insight 2</strong> — профессиональный, полный набор метрик.</li>
              <li><strong>FabFilter Pro-L 2</strong> — лимитер со встроенным LUFS-метром.</li>
              <li><strong>WLM Plus</strong> — простой и понятный.</li>
            </ul>
          </li>
          <li><strong>Отдельные приложения:</strong>
            <ul>
              <li><strong>Orban Loudness Meter</strong> — бесплатный для Windows.</li>
              <li><strong>Audacity</strong> — есть плагин для измерения LUFS.</li>
            </ul>
          </li>
          <li><strong>Онлайн-сервисы:</strong>
            <ul>
              <li><strong>Loudness Penalty</strong> — показывает, как платформы изменят громкость вашего трека.</li>
              <li><strong>MeterPlugs</strong> — онлайн-анализ LUFS.</li>
            </ul>
          </li>
        </ol>
        <p><strong>Как правильно измерять:</strong></p>
        <ul>
          <li>Измеряйте <strong>Integrated LUFS</strong> за весь трек.</li>
          <li>Измеряйте <strong>True Peak</strong> — он не должен превышать -1 dBTP.</li>
          <li>Смотрите на <strong>LRA</strong> — чем выше, тем больше динамика.</li>
          <li>Измеряйте на <strong>громких и тихих участках</strong> отдельно.</li>
        </ul>
        <p><strong>В HHRecords мы используем Youlean Loudness Meter и FabFilter Pro-L 2.</strong></p>
      `
    },
    {
      id: 'q8',
      question: 'Как достичь целевого LUFS при мастеринге?',
      answer: `
        <p><strong>Пошаговая инструкция:</strong></p>
        <ol>
          <li><strong>Начните с правильного микса:</strong>
            <ul>
              <li>Хороший баланс инструментов.</li>
              <li>Контроль низких частот (они сильно влияют на LUFS).</li>
              <li>Чистый спектр без резонансов.</li>
            </ul>
          </li>
          <li><strong>Используйте компрессию и лимитирование:</strong>
            <ul>
              <li>Сначала <strong>компрессор</strong> — для выравнивания динамики.</li>
              <li>Потом <strong>лимитер</strong> — для финального контроля пиков.</li>
              <li>Не делайте Gain Reduction больше 3-4 дБ на лимитере.</li>
            </ul>
          </li>
          <li><strong>Настройте лимитер:</strong>
            <ul>
              <li><strong>Ceiling:</strong> -1 dBTP (для стримингов).</li>
              <li><strong>Threshold:</strong> опускайте, пока не увидите 2-4 дБ GR.</li>
              <li><strong>Attack:</strong> 0.5-1 мс (быстрая реакция).</li>
              <li><strong>Release:</strong> 50-150 мс (естественное восстановление).</li>
            </ul>
          </li>
          <li><strong>Измеряйте LUFS в реальном времени:</strong>
            <ul>
              <li>Включите LUFS-метр на мастер-канале.</li>
              <li>Слушайте трек от начала до конца.</li>
              <li>Смотрите на Integrated LUFS.</li>
            </ul>
          </li>
          <li><strong>Корректируйте:</strong>
            <ul>
              <li>Если слишком громко (>-12 LUFS) — поднимите Threshold.</li>
              <li>Если слишком тихо (<-16 LUFS) — опустите Threshold.</li>
              <li>Добавьте Make-up Gain для компенсации.</li>
            </ul>
          </li>
          <li><strong>Проверьте True Peak:</strong>
            <ul>
              <li>Убедитесь, что TP не превышает -1 dBTP.</li>
              <li>Если превышает — уменьшите Ceiling.</li>
            </ul>
          </li>
        </ol>
        <p><strong>Важно:</strong> Не пытайтесь достичь -14 LUFS любой ценой. Если ваш трек звучит хорошо при -16 LUFS — оставьте так. Динамика важнее громкости.</p>
      `
    },
    {
      id: 'q9',
      question: 'Что такое нормализация громкости?',
      answer: `
        <p><strong>Нормализация громкости</strong> — это процесс автоматического выравнивания уровня громкости всех треков на платформе до единого значения (обычно -14 LUFS).</p>
        <p><strong>Как это работает:</strong></p>
        <ul>
          <li>Платформа анализирует Integrated LUFS каждого трека.</li>
          <li>Если трек громче целевого значения, платформа <strong>приглушает</strong> его.</li>
          <li>Если трек тише, платформа <strong>усиливает</strong> его (но с ограничениями).</li>
        </ul>
        <p><strong>Важные нюансы:</strong></p>
        <ul>
          <li><strong>Приглушение:</strong> Простое уменьшение громкости — динамика не страдает.</li>
          <li><strong>Усиление:</strong> Может добавить шум и искажения, если трек слишком тихий.</li>
          <li><strong>Платформы делают это по-разному:</strong>
            <ul>
              <li>Spotify — нормализует к -14 LUFS.</li>
              <li>Apple Music — к -16 LUFS.</li>
              <li>YouTube — к -14 LUFS.</li>
            </ul>
          </li>
          <li><strong>Пользователь может отключить нормализацию:</strong>
            <ul>
              <li>В Spotify — настройка "Normalize Volume".</li>
              <li>В Apple Music — "Sound Check".</li>
            </ul>
          </li>
        </ul>
        <p><strong>Почему это важно:</strong></p>
        <ul>
          <li>Если вы сделаете трек громче -14 LUFS, Spotify приглушит его, а динамика не восстановится.</li>
          <li>Лучше сделать трек динамичным и соответствовать -14 LUFS.</li>
          <li>Ваш трек будет звучать одинаково хорошо на всех платформах.</li>
        </ul>
      `
    },
    {
      id: 'q10',
      question: 'Почему мой трек тише на Spotify?',
      answer: `
        <p><strong>Самая частая причина: ваш трек громче -14 LUFS.</strong></p>
        <p><strong>Как это работает:</strong></p>
        <ol>
          <li>Вы сделали трек с Integrated LUFS = <strong>-8 LUFS</strong> (очень громкий).</li>
          <li>Spotify нормализует громкость до <strong>-14 LUFS</strong>.</li>
          <li>Spotify <strong>приглушает</strong> ваш трек на <strong>6 дБ</strong>.</li>
          <li>В результате трек звучит <strong>тише</strong> и <strong>площе</strong> (без динамики).</li>
        </ol>
        <p><strong>Почему так происходит:</strong></p>
        <ul>
          <li>При мастеринге вы использовали агрессивный лимитер, чтобы сделать трек громче.</li>
          <li>Это убило динамику (сжало транзиенты).</li>
          <li>Когда Spotify приглушает трек, динамика не восстанавливается.</li>
        </ul>
        <p><strong>Что делать:</strong></p>
        <ol>
          <li><strong>Перемастерите трек</strong> с целевым LUFS = -14 LUFS.</li>
          <li><strong>Используйте меньше лимитера</strong> — оставьте динамику.</li>
          <li><strong>Проверьте True Peak</strong> — он должен быть -1 dBTP.</li>
          <li><strong>Используйте плагин-эмулятор</strong> (например, Youlean Loudness Meter) для проверки.</li>
        </ol>
        <p><strong>Совет от HHRecords:</strong> Всегда проверяйте ваш трек в контексте плейлиста. Сравните с треками других артистов в том же жанре.</p>
      `
    }
  ],

  genreTable: {
    title: '🎯 Какой LUFS мы используем в HHRecords для разных жанров',
    rows: [
      { genre: 'Рэп / Хип-хоп', boost: '-14…-12 LUFS', cut: 'Плотный, насыщенный звук для стримингов' },
      { genre: 'Поп-музыка', boost: '-14…-12 LUFS', cut: 'Коммерческая громкость с сохранением динамики' },
      { genre: 'Рок / Металл', boost: '-14…-12 LUFS', cut: 'Энергичный звук с хорошей атакой' },
      { genre: 'Электронная музыка', boost: '-14…-10 LUFS', cut: 'Для клубов и фестивалей' },
      { genre: 'Классическая музыка', boost: '-20…-16 LUFS', cut: 'Большая динамика, минимальная компрессия' },
      { genre: 'Подкасты', boost: '-16…-14 LUFS', cut: 'Разборчивость важнее громкости' },
      { genre: 'Джаз / Акустика', boost: '-18…-14 LUFS', cut: 'Естественная динамика' },
    ],
    note: 'Мы всегда подбираем LUFS под конкретный жанр и платформу. Для стримингов — -14 LUFS, для клубов — -9…-6 LUFS.'
  },

  quickStart: {
    title: '🚀 Быстрый старт для новичков',
    steps: [
      'Установите <strong>Ceiling -1 dBTP</strong> на лимитере — это стандарт для стримингов.',
      'Настройте <strong>Threshold</strong> так, чтобы Integrated LUFS был около <strong>-14 LUFS</strong>.',
      'Используйте <strong>Youlean Loudness Meter</strong> для измерения LUFS в реальном времени.',
      'Не делайте <strong>Gain Reduction</strong> больше 3-4 дБ на лимитере.',
      'Следите за <strong>True Peak</strong> — не выше -1 dBTP.',
      'Проверьте <strong>LRA (Loudness Range)</strong> — чем выше, тем больше динамика.',
      '<strong>Сравните с референсным треком</strong> в том же жанре.',
      '<strong>Проверьте на разных системах</strong> — наушники, мониторы, машина, телефон.',
    ]
  },

  checklist: {
    title: '✅ Чек-лист: готов ли ваш трек по LUFS для стримингов?',
    items: [
      { id: 'item1', text: 'Integrated LUFS в диапазоне -14…-12 LUFS', hint: 'Для Spotify и YouTube — -14 LUFS' },
      { id: 'item2', text: 'True Peak не превышает -1 dBTP', hint: 'Для стримингов — стандарт -1 dBTP' },
      { id: 'item3', text: 'LRA (Loudness Range) не меньше 6-8 LU', hint: 'Слишком низкий LRA — плоская динамика' },
      { id: 'item4', text: 'Gain Reduction на лимитере не превышает 4 дБ', hint: 'Слишком много GR убивает динамику' },
      { id: 'item5', text: 'Вы проверили трек на разных системах', hint: 'Наушники, мониторы, машина, телефон' },
      { id: 'item6', text: 'Вы сравнили с референсным треком в том же жанре', hint: 'Сравните громкость и динамику' },
      { id: 'item7', text: 'Вы проверили трек в контексте плейлиста', hint: 'Используйте Loudness Penalty для эмуляции' },
    ],
    storageKey: 'hhrecords_lufs_checklist'
  },

  userQuestions: {
    title: '❓ Вопросы от наших клиентов',
    items: [
      {
        question: 'Можно ли сделать трек громче -14 LUFS для стримингов?',
        answer: 'Можно, но не нужно. Если вы сделаете трек громче -14 LUFS, платформа приглушит его, а динамика не восстановится. Лучше сделать трек динамичным и соответствовать -14 LUFS. Это даст более качественный звук на всех платформах.'
      },
      {
        question: 'Какой LUFS у профессиональных треков?',
        answer: 'Профессиональные треки обычно имеют Integrated LUFS в диапазоне -14…-10 LUFS в зависимости от жанра. Однако многие артисты делают треки громче (-8…-6 LUFS) для клубов и радио. Для стримингов лучше ориентироваться на -14 LUFS.'
      },
      {
        question: 'Влияет ли LUFS на качество звука?',
        answer: 'Косвенно — да. Стремление к высокому LUFS часто приводит к агрессивной компрессии и лимитированию, что убивает динамику и делает звук плоским. Качество звука зависит от правильного баланса между громкостью и динамикой, а не от абсолютного значения LUFS.'
      }
    ]
  },

  glossary: [
    { term: 'LUFS', definition: 'Loudness Units Full Scale — единица измерения воспринимаемой громкости.' },
    { term: 'Integrated LUFS', definition: 'Средняя громкость за весь трек. Главный показатель для стримингов.' },
    { term: 'Short-term LUFS', definition: 'Громкость за последние 3 секунды.' },
    { term: 'Momentary LUFS', definition: 'Мгновенная громкость (за 400 мс).' },
    { term: 'True Peak (TP)', definition: 'Реальные пиковые значения с учётом интерполяции между сэмплами.' },
    { term: 'LRA (Loudness Range)', definition: 'Динамический диапазон громкости — разница между тихими и громкими участками.' },
    { term: 'Нормализация громкости', definition: 'Автоматическое выравнивание уровня громкости всех треков до единого значения.' },
    { term: 'K-взвешивание (K-weighting)', definition: 'Фильтр, имитирующий частотную характеристику человеческого уха.' },
    { term: 'Gain Reduction (GR)', definition: 'Уровень сжатия сигнала (в дБ) на компрессоре или лимитере.' },
    { term: 'Loudness Penalty', definition: 'Разница в громкости между оригиналом и версией после нормализации на платформе.' },
  ],

  tip: `
    <p>В студии HHRecords мы уделяем особое внимание LUFS при мастеринге. Главный принцип: <strong>динамика важнее громкости</strong>.</p>
    <p><strong>Наш подход к работе с LUFS:</strong></p>
    <ul>
      <li><strong>Целевой LUFS:</strong> Всегда -14 LUFS для стримингов (Spotify, YouTube, Яндекс.Музыка).</li>
      <li><strong>True Peak:</strong> Строго -1 dBTP, чтобы избежать клиппинга при конвертации.</li>
      <li><strong>Gain Reduction:</strong> Не более 3-4 дБ на лимитере, чтобы сохранить динамику.</li>
      <li><strong>Проверка:</strong> Всегда проверяем на разных системах (наушники, мониторы, машина, телефон).</li>
      <li><strong>Сравнение:</strong> Сравниваем с референсными треками в том же жанре.</li>
    </ul>
    <p><strong>Совет новичкам:</strong></p>
    <ul>
      <li><strong>Не гонитесь за громкостью.</strong> Лучше сделать трек тише, но с сохранением динамики.</li>
      <li><strong>Используйте Youlean Loudness Meter.</strong> Это бесплатный и отличный плагин для измерения LUFS.</li>
      <li><strong>Проверяйте Loudness Penalty.</strong> Используйте сайт loudnesspenalty.com, чтобы увидеть, как платформы изменят ваш трек.</li>
      <li><strong>Слушайте в контексте плейлиста.</strong> Добавьте свой трек в плейлист с другими треками и послушайте — так вы поймёте, правильный ли уровень.</li>
      <li><strong>Помните:</strong> Громкость ≠ качество. Динамичный трек всегда звучит лучше сжатого.</li>
    </ul>
    <p><strong>Важно:</strong> Если вы не уверены в мастеринге — доверьте это профессионалам. В HHRecords мы делаем мастеринг с учётом всех требований стриминговых платформ.</p>
  `,

  relatedTerms: [
    { slug: 'bit-depth', icon: '💾', label: 'Битность' },
    { slug: 'sample-rate', icon: '📊', label: 'Частота дискретизации' },
    { slug: 'bitrate', icon: '📈', label: 'Битрейт' },
    { slug: 'limiter', icon: '📈', label: 'Лимитер' },
    { slug: 'compression', icon: '🎚️', label: 'Компрессия' },
    { slug: 'mastering', icon: '🎧', label: 'Мастеринг' },
  ],

  sources: [
    { url: 'https://en.wikipedia.org/wiki/LUFS', label: 'Wikipedia — LUFS' },
    { url: 'https://www.youlean.co/loudness-meter/', label: 'Youlean Loudness Meter' },
    { url: 'https://www.izotope.com/en/learn/what-is-lufs.html', label: 'iZotope — What is LUFS' },
    { url: 'https://www.masteringthemix.com/blogs/learn/loudness-normalization', label: 'Mastering The Mix — Loudness Normalization' },
    { url: 'https://loudnesspenalty.com/', label: 'Loudness Penalty — Check your LUFS' },
    { url: 'https://www.soundonsound.com/techniques/loudness-part-1', label: 'Sound on Sound — Loudness' },
  ],

  widget: 'LUFSWidget',
}