// lib/articles/data/bitrate.ts
import { ArticleData } from '../types'

export const bitrate: ArticleData = {
  title: 'Битрейт в музыке — что это? Полное руководство (128, 256, 320 кбит/с, CBR, VBR, Lossless)',
  description: 'Битрейт — это количество данных, передаваемых в секунду при сжатии аудио. Узнайте, чем отличаются 128, 256 и 320 кбит/с, что такое CBR и VBR, какой битрейт у Spotify, Apple Music и YouTube, слышит ли человек разницу между 128 и 320 кбит/с, что такое lossless (FLAC, ALAC) и как выбрать битрейт для экспорта, стримингов и архива. Практические советы от студии HHRecords.',

  hero: {
    badge: 'Энциклопедия звукозаписи',
    subtitle: 'Узнайте, чем отличаются 128, 256 и 320 кбит/с, что такое CBR и VBR, какой битрейт у Spotify, Apple Music и YouTube, слышит ли человек разницу между 128 и 320 кбит/с, что такое lossless (FLAC, ALAC) и как выбрать битрейт для экспорта, стримингов и архива. Практические советы от студии HHRecords.',
    tags: ['📌 10 вопросов', '⭐ 4.9 на основе 87 отзывов', '🎚️ Студия в Красноярске с 2016', '📚 Ссылки на источники'],
  },

  toc: [
    { id: 'q1', label: '1. Что такое битрейт в музыке?' },
    { id: 'q2', label: '2. Чем отличается CBR от VBR?' },
    { id: 'q3', label: '3. Какой битрейт у MP3?' },
    { id: 'q4', label: '4. Какой битрейт выбрать для стримингов?' },
    { id: 'q5', label: '5. Чем отличается 128 от 320 кбит/с?' },
    { id: 'q6', label: '6. Слышит ли человек разницу между 128 и 320 кбит/с?' },
    { id: 'q7', label: '7. Какой битрейт у Spotify, Apple Music и YouTube?' },
    { id: 'q8', label: '8. Что такое lossless (без потерь)?' },
    { id: 'q9', label: '9. Как уменьшить размер файла без потери качества?' },
    { id: 'q10', label: '10. Влияет ли битрейт на битность и частоту дискретизации?' },
  ],

  quickAnswer: `
    <strong>Битрейт (Bitrate)</strong> — это количество данных (бит), передаваемых или обрабатываемых в единицу времени (обычно в секунду). В аудио битрейт определяет качество сжатого звука: чем выше битрейт, тем больше деталей сохраняется, но тем больше размер файла. Для MP3 стандарты: <strong>128 кбит/с</strong> (базовое качество), <strong>256 кбит/с</strong> (хорошее), <strong>320 кбит/с</strong> (максимальное для MP3). Стриминги используют <strong>128–320 кбит/с</strong> в зависимости от платформы и подписки. Для максимального качества используйте <strong>lossless (FLAC, ALAC)</strong> — сжатие без потерь.
  `,

  qa: [
    {
      id: 'q1',
      question: 'Что такое битрейт в музыке?',
      answer: `
        <p><strong>Битрейт (Bitrate)</strong> — это количество данных (бит), передаваемых или обрабатываемых за одну секунду. В аудио это показатель того, сколько информации используется для представления звука в сжатом файле.</p>
        <p><strong>Единицы измерения:</strong></p>
        <ul>
          <li><strong>кбит/с (kbps)</strong> — килобит в секунду (тысячи бит в секунду)</li>
          <li><strong>Мбит/с (Mbps)</strong> — мегабит в секунду (миллионы бит в секунду)</li>
        </ul>
        <p><strong>Простым языком:</strong></p>
        <ul>
          <li><strong>Высокий битрейт (320 кбит/с)</strong> — много данных, высокое качество, большой файл.</li>
          <li><strong>Низкий битрейт (64 кбит/с)</strong> — мало данных, низкое качество, маленький файл.</li>
        </ul>
        <p><strong>Важно:</strong> Битрейт применяется только к сжатым форматам (MP3, AAC, Ogg, Opus). Несжатые форматы (WAV, AIFF) имеют фиксированный битрейт, равный <strong>частота дискретизации × битность × количество каналов</strong>. Например, CD-качество (44.1 кГц, 16 бит, стерео) = 44 100 × 16 × 2 = 1 411 кбит/с.</p>
      `
    },
    {
      id: 'q2',
      question: 'Чем отличается CBR от VBR?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Характеристика</th>
              <th>CBR (Constant Bitrate)</th>
              <th>VBR (Variable Bitrate)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Расшифровка</strong></td><td>Постоянный битрейт</td><td>Переменный битрейт</td></tr>
            <tr><td><strong>Битрейт</strong></td><td>Фиксированный (всегда одинаковый)</td><td>Меняется от участка к участку</td></tr>
            <tr><td><strong>Размер файла</strong></td><td>Предсказуемый</td><td>Зависит от сложности аудио</td></tr>
            <tr><td><strong>Качество</strong></td><td>Одинаковое для всего трека</td><td>Выше на сложных участках, ниже на простых</td></tr>
            <tr><td><strong>Эффективность</strong></td><td>Менее эффективно (тратит данные там, где не нужно)</td><td>Более эффективно (оптимизирует данные)</td></tr>
            <tr><td><strong>Совместимость</strong></td><td>Максимальная (все плееры поддерживают)</td><td>Почти все современные поддерживают</td></tr>
          </tbody>
        </table>
        <p><strong>Что выбрать:</strong></p>
        <ul>
          <li><strong>CBR:</strong> Для стриминга в реальном времени (радио, подкасты), где важна предсказуемость.</li>
          <li><strong>VBR:</strong> Для музыки и большинства экспортов (лучшее качество при том же размере).</li>
        </ul>
        <p><strong>Пример:</strong> При экспорте MP3 с целевым битрейтом 192 кбит/с:</p>
        <ul>
          <li><strong>CBR:</strong> Весь трек будет 192 кбит/с — простые участки перегружены данными.</li>
          <li><strong>VBR:</strong> Тихие участки могут быть 128 кбит/с, сложные — 256 кбит/с, средний битрейт ~192 кбит/с.</li>
        </ul>
        <p><strong>В HHRecords мы используем VBR для экспорта музыки.</strong></p>
      `
    },
    {
      id: 'q3',
      question: 'Какой битрейт у MP3?',
      answer: `
        <p>MP3 поддерживает широкий диапазон битрейтов. Вот стандартные значения:</p>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Битрейт</th>
              <th>Качество</th>
              <th>Размер файла (3 мин)</th>
              <th>Для чего</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>32 кбит/с</strong></td><td>Очень низкое (речь)</td><td>~0.7 МБ</td><td>Подкасты, аудиокниги</td></tr>
            <tr><td><strong>64 кбит/с</strong></td><td>Низкое</td><td>~1.4 МБ</td><td>Голосовые заметки</td></tr>
            <tr><td><strong>128 кбит/с</strong></td><td>Базовое (CD-транскодинг)</td><td>~2.9 МБ</td><td>Портативные плееры (старые)</td></tr>
            <tr><td><strong>192 кбит/с</strong></td><td>Хорошее</td><td>~4.3 МБ</td><td>MP3-плееры, начальный уровень</td></tr>
            <tr><td><strong>256 кбит/с</strong></td><td>Отличное</td><td>~5.8 МБ</td><td>Качественные MP3-сборники</td></tr>
            <tr><td><strong>320 кбит/с</strong></td><td>Максимальное (MP3)</td><td>~7.2 МБ</td><td>Максимальное качество MP3</td></tr>
          </tbody>
        </table>
        <p><strong>Важно:</strong> MP3 с битрейтом 320 кбит/с — это золотой стандарт для сжатых аудиофайлов. Большинство профессиональных звукорежиссёров считают 320 кбит/с достаточным для прослушивания.</p>
        <p><strong>Сравнение с другими форматами:</strong></p>
        <ul>
          <li><strong>MP3 320 кбит/с:</strong> ~7.2 МБ (3 минуты)</li>
          <li><strong>AAC 256 кбит/с:</strong> ~5.8 МБ (качество лучше MP3 320)</li>
          <li><strong>FLAC (lossless):</strong> ~15–20 МБ (без потерь)</li>
          <li><strong>WAV (несжатый):</strong> ~30 МБ (без потерь, оригинальный размер)</li>
        </ul>
      `
    },
    {
      id: 'q4',
      question: 'Какой битрейт выбрать для разных целей?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Цель</th>
              <th>Рекомендуемый битрейт</th>
              <th>Формат</th>
              <th>Примечание</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Стриминг (Spotify, Apple Music)</strong></td><td>128–320 кбит/с</td><td>AAC, Ogg, MP3</td><td>Зависит от подписки и платформы</td></tr>
            <tr><td><strong>YouTube</strong></td><td>256–320 кбит/с</td><td>AAC</td><td>YouTube сжимает до 256 кбит/с</td></tr>
            <tr><td><strong>SoundCloud</strong></td><td>128–320 кбит/с</td><td>MP3, AAC</td><td>Зависит от формата загрузки</td></tr>
            <tr><td><strong>CD-качество</strong></td><td>1 411 кбит/с</td><td>WAV, AIFF</td><td>44.1 кГц, 16 бит, стерео</td></tr>
            <tr><td><strong>Hi-Res (архив)</strong></td><td>2 304–9 216 кбит/с</td><td>WAV, FLAC</td><td>48–192 кГц, 24 бит</td></tr>
            <tr><td><strong>Подкасты (речь)</strong></td><td>64–128 кбит/с</td><td>MP3, AAC</td><td>Речи не нужно много данных</td></tr>
            <tr><td><strong>Демо / черновики</strong></td><td>128–192 кбит/с</td><td>MP3</td><td>Маленький размер, приемлемое качество</td></tr>
          </tbody>
        </table>
        <p><strong>Общие рекомендации:</strong></p>
        <ul>
          <li><strong>Для прослушивания:</strong> 320 кбит/с MP3 или 256 кбит/с AAC.</li>
          <li><strong>Для стримингов:</strong> Экспортируйте в WAV и дайте платформам сжать самим.</li>
          <li><strong>Для архива:</strong> Всегда сохраняйте оригинал в WAV или FLAC.</li>
          <li><strong>Для подкастов:</strong> 128 кбит/с MP3 (CBR) или 64 кбит/с Opus.</li>
        </ul>
        <p><strong>В HHRecords мы экспортируем в WAV для стримингов и сохраняем FLAC для архива.</strong></p>
      `
    },
    {
      id: 'q5',
      question: 'Чем отличается 128 от 320 кбит/с? Насколько это заметно?',
      answer: `
        <p><strong>Основные различия:</strong></p>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Характеристика</th>
              <th>128 кбит/с</th>
              <th>320 кбит/с</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Данных в секунду</strong></td><td>128 000 бит</td><td>320 000 бит</td></tr>
            <tr><td><strong>Размер файла (3 мин)</strong></td><td>~2.9 МБ</td><td>~7.2 МБ</td></tr>
            <tr><td><strong>Потеря качества</strong></td><td>Заметная (особенно на тарелках, шумах)</td><td>Минимальная (почти незаметна)</td></tr>
            <tr><td><strong>Слышимость</strong></td><td>Заметно на хорошем оборудовании</td><td>Почти неотличимо от оригинала</td></tr>
            <tr><td><strong>Артефакты</strong></td><td>Есть (пре-эхо, "звенящие" тарелки)</td><td>Практически нет</td></tr>
          </tbody>
        </table>
        <p><strong>На чём заметна разница:</strong></p>
        <ul>
          <li><strong>На студийных мониторах</strong> — разница хорошо слышна.</li>
          <li><strong>На хороших наушниках</strong> — заметна на сложных участках.</li>
          <li><strong>На дешёвых колонках</strong> — почти не заметна.</li>
          <li><strong>В машине</strong> — разница малозаметна из-за шума.</li>
        </ul>
        <p><strong>На чём особенно заметна:</strong></p>
        <ul>
          <li><strong>Тарелки и шумы</strong> — становятся "звенящими" и нечёткими.</li>
          <li><strong>Реверберация</strong> — становится "грязной", теряет натуральность.</li>
          <li><strong>Вокал</strong> — теряет детализацию, появляются артефакты.</li>
          <li><strong>Тихие участки</strong> — появляется шум квантования.</li>
        </ul>
        <p><strong>Вывод:</strong> Для серьёзного прослушивания используйте 320 кбит/с или lossless. 128 кбит/с оставьте для подкастов и демо.</p>
      `
    },
    {
      id: 'q6',
      question: 'Слышит ли человек разницу между 128 и 320 кбит/с?',
      answer: `
        <p><strong>Краткий ответ: да, на качественном оборудовании и при правильных условиях.</strong></p>
        <p><strong>Что говорят исследования:</strong></p>
        <ul>
          <li><strong>Большинство людей</strong> не слышат разницу между 256 и 320 кбит/с в слепых тестах.</li>
          <li><strong>Разницу между 128 и 256 кбит/с</strong> слышат примерно 60–70% людей.</li>
          <li><strong>Разницу между 128 и 320 кбит/с</strong> слышат около 70–80% людей.</li>
          <li><strong>Обученные слушатели</strong> (звукорежиссёры) слышат разницу почти всегда.</li>
        </ul>
        <p><strong>От чего зависит слышимость:</strong></p>
        <ul>
          <li><strong>Качество оборудования</strong> — на дешёвых колонках разницы нет.</li>
          <li><strong>Акустика помещения</strong> — в хорошей комнате слышно больше.</li>
          <li><strong>Тип музыки</strong> — на сложной музыке (оркестр, джаз) разница заметнее.</li>
          <li><strong>Возраст и слух</strong> — молодые люди слышат лучше.</li>
          <li><strong>Усталость слуха</strong> — после долгого прослушивания разница становится незаметной.</li>
        </ul>
        <p><strong>Мнение профессионалов:</strong></p>
        <ul>
          <li>Большинство звукорежиссёров считают <strong>320 кбит/с</strong> минимальным стандартом для прослушивания.</li>
          <li><strong>256 кбит/с AAC</strong> (Apple Music) эквивалентен 320 кбит/с MP3 по качеству.</li>
          <li><strong>128 кбит/с</strong> считается устаревшим стандартом.</li>
        </ul>
        <p><strong>В HHRecords мы рекомендуем 320 кбит/с MP3 или 256 кбит/с AAC как минимальный стандарт для качественного прослушивания.</strong></p>
      `
    },
    {
      id: 'q7',
      question: 'Какой битрейт у Spotify, Apple Music, YouTube и Яндекс.Музыки?',
      answer: `
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Платформа</th>
              <th>Формат</th>
              <th>Битрейт</th>
              <th>Примечание</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Spotify (бесплатно)</strong></td><td>Ogg Vorbis</td><td>160 кбит/с</td><td>Веб-плеер и мобильное приложение</td></tr>
            <tr><td><strong>Spotify (Premium)</strong></td><td>Ogg Vorbis</td><td>320 кбит/с</td><td>Максимальное качество Spotify</td></tr>
            <tr><td><strong>Apple Music</strong></td><td>AAC</td><td>256 кбит/с</td><td>Стандартное качество (эквивалент MP3 320)</td></tr>
            <tr><td><strong>Apple Music (Lossless)</strong></td><td>ALAC</td><td>1411 кбит/с</td><td>CD-качество (только по подписке)</td></tr>
            <tr><td><strong>YouTube</strong></td><td>AAC</td><td>128–256 кбит/с</td><td>Зависит от качества видео</td></tr>
            <tr><td><strong>YouTube Music</strong></td><td>AAC</td><td>256 кбит/с</td><td>Для Premium</td></tr>
            <tr><td><strong>Яндекс.Музыка</strong></td><td>AAC</td><td>192–320 кбит/с</td><td>Зависит от подписки</td></tr>
            <tr><td><strong>Tidal (Hi-Fi)</strong></td><td>FLAC</td><td>1411 кбит/с</td><td>CD-качество (lossless)</td></tr>
            <tr><td><strong>Tidal (Master)</strong></td><td>MQA</td><td>2304–9216 кбит/с</td><td>Hi-Res качество</td></tr>
            <tr><td><strong>SoundCloud</strong></td><td>MP3 / AAC</td><td>128–320 кбит/с</td><td>Зависит от загруженного файла</td></tr>
          </tbody>
        </table>
        <p><strong>Важно:</strong></p>
        <ul>
          <li><strong>Spotify Premium</strong> — 320 кбит/с Ogg Vorbis (отличное качество).</li>
          <li><strong>Apple Music</strong> — 256 кбит/с AAC (эквивалент 320 кбит/с MP3).</li>
          <li><strong>YouTube</strong> — 256 кбит/с AAC (хорошее качество для видео).</li>
          <li><strong>Яндекс.Музыка</strong> — до 320 кбит/с AAC.</li>
        </ul>
        <p><strong>Совет:</strong> Для максимального качества загружайте на стриминги файлы в WAV 24 бит, 48 кГц. Платформы сами сожмут до нужного битрейта.</p>
      `
    },
    {
      id: 'q8',
      question: 'Что такое lossless (без потерь) и чем отличается от lossy?',
      answer: `
        <p><strong>Lossless (без потерь)</strong> — это метод сжатия, при котором данные восстанавливаются без потерь. Звук остаётся идентичным оригиналу.</p>
        <p><strong>Lossy (с потерями)</strong> — это метод сжатия, при котором часть данных безвозвратно удаляется для уменьшения размера файла.</p>
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Характеристика</th>
              <th>Lossless (FLAC, ALAC)</th>
              <th>Lossy (MP3, AAC, Ogg)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Качество</strong></td><td>Идентично оригиналу</td><td>Потеря части данных</td></tr>
            <tr><td><strong>Размер файла</strong></td><td>~50–70% от WAV</td><td>~10–20% от WAV</td></tr>
            <tr><td><strong>Применение</strong></td><td>Архив, Hi-Fi, студия</td><td>Стриминг, портативные плееры</td></tr>
            <tr><td><strong>Совместимость</strong></td><td>Ограниченная (не все плееры)</td><td>Почти все устройства</td></tr>
            <tr><td><strong>Восстановление</strong></td><td>100% оригинал</td><td>Невозможно восстановить потерянные данные</td></tr>
          </tbody>
        </table>
        <p><strong>Популярные lossless форматы:</strong></p>
        <ul>
          <li><strong>FLAC</strong> — Free Lossless Audio Codec (самый популярный).</li>
          <li><strong>ALAC</strong> — Apple Lossless Audio Codec (для Apple).</li>
          <li><strong>WAV</strong> — несжатый аудиофайл (без сжатия).</li>
          <li><strong>AIFF</strong> — формат Apple без сжатия.</li>
        </ul>
        <p><strong>Когда использовать lossless:</strong></p>
        <ul>
          <li><strong>Архив:</strong> Сохраняйте мастеринг-файлы в FLAC или WAV.</li>
          <li><strong>Hi-Fi прослушивание:</strong> Для качественных систем.</li>
          <li><strong>Студийная работа:</strong> Для импорта в DAW.</li>
        </ul>
        <p><strong>В HHRecords мы сохраняем все мастеринг-файлы в FLAC для архива.</strong></p>
      `
    },
    {
      id: 'q9',
      question: 'Как уменьшить размер файла без потери качества?',
      answer: `
        <p><strong>Краткий ответ: используйте lossless сжатие вместо lossy.</strong></p>
        <p><strong>Способы уменьшить размер без потери качества:</strong></p>
        <ol>
          <li><strong>Используйте FLAC вместо WAV:</strong> FLAC сжимает без потерь на ~30–50%.</li>
          <li><strong>Используйте ALAC для Apple-экосистемы:</strong> Аналогично FLAC, но для Apple.</li>
          <li><strong>Уменьшите частоту дискретизации:</strong> 48 кГц вместо 96 кГц (если не нужен Hi-Res).</li>
          <li><strong>Уменьшите битность:</strong> 24 бит → 16 бит (для стримингов).</li>
          <li><strong>Используйте VBR вместо CBR:</strong> Более эффективное распределение данных.</li>
          <li><strong>Оптимизируйте метаданные:</strong> Удалите лишние теги и обложки.</li>
        </ol>
        <p><strong>Сравнение размеров (3 минуты, стерео, 44.1 кГц):</strong></p>
        <ul>
          <li><strong>WAV (16 бит):</strong> ~30 МБ</li>
          <li><strong>WAV (24 бит):</strong> ~45 МБ</li>
          <li><strong>FLAC (16 бит):</strong> ~15–20 МБ</li>
          <li><strong>FLAC (24 бит):</strong> ~25–35 МБ</li>
          <li><strong>MP3 320 кбит/с:</strong> ~7.2 МБ</li>
          <li><strong>MP3 256 кбит/с:</strong> ~5.8 МБ</li>
          <li><strong>AAC 256 кбит/с:</strong> ~5.8 МБ (качество лучше MP3 320)</li>
          <li><strong>MP3 128 кбит/с:</strong> ~2.9 МБ</li>
        </ul>
        <p><strong>Совет:</strong> Для повседневного прослушивания используйте MP3 320 или AAC 256. Для архива — FLAC.</p>
      `
    },
    {
      id: 'q10',
      question: 'Влияет ли битрейт на битность и частоту дискретизации?',
      answer: `
        <p><strong>Нет, битрейт не влияет на битность и частоту дискретизации напрямую.</strong> Это разные параметры.</p>
        <p><strong>Разница:</strong></p>
        <ul>
          <li><strong>Битность (Bit Depth):</strong> Сколько бит на один сэмпл (16, 24, 32). Влияет на динамический диапазон.</li>
          <li><strong>Частота дискретизации (Sample Rate):</strong> Сколько сэмплов в секунду (44.1, 48, 96 кГц). Влияет на максимальную частоту.</li>
          <li><strong>Битрейт (Bitrate):</strong> Сколько бит в секунду. Влияет на качество сжатия.</li>
        </ul>
        <p><strong>Однако есть связь:</strong></p>
        <ul>
          <li><strong>Высокая битность и частота увеличивают "сырой" битрейт</strong> (несжатый файл).</li>
          <li><strong>Сжатие (MP3, AAC) уменьшает битрейт</strong>, но битность и частота остаются в метаданных.</li>
          <li><strong>При конвертации 24/96 в MP3</strong> MP3 всё равно будет 16 бит (внутренняя обработка).</li>
        </ul>
        <p><strong>Примеры:</strong></p>
        <ul>
          <li><strong>WAV 16/44.1 (CD):</strong> 1 411 кбит/с</li>
          <li><strong>WAV 24/48:</strong> 2 304 кбит/с</li>
          <li><strong>WAV 24/96:</strong> 4 608 кбит/с</li>
          <li><strong>MP3 320 кбит/с:</strong> Неважно, был ли файл 16/44.1 или 24/96 — битрейт 320 кбит/с.</li>
        </ul>
        <p><strong>Важно:</strong> При экспорте в MP3 исходная битность и частота не имеют значения — MP3 сжимает до своих стандартов. Для максимального качества экспортируйте в WAV и дайте платформам сжать самим.</p>
      `
    }
  ],

  genreTable: {
    title: '🎯 Какой битрейт мы используем в HHRecords для разных задач',
    rows: [
      { genre: 'Мастеринг (архив)', boost: 'FLAC 24/48 (lossless)', cut: 'Сохраняем максимальное качество' },
      { genre: 'Экспорт для стримингов', boost: 'WAV 16/44.1 или 24/48', cut: 'Платформы сожмут сами' },
      { genre: 'Экспорт для SoundCloud', boost: 'MP3 320 кбит/с', cut: 'Или AAC 256 кбит/с' },
      { genre: 'Демо и черновики', boost: 'MP3 192 кбит/с (VBR)', cut: 'Хорошее качество, маленький размер' },
      { genre: 'Подкасты (речь)', boost: 'MP3 128 кбит/с (CBR)', cut: 'Достаточно для речи' },
      { genre: 'Архив для клиента', boost: 'FLAC 24/48', cut: 'Без потерь, компактный' },
    ],
    note: 'Мы всегда выбираем битрейт под конкретную задачу. Для архива — FLAC, для стримингов — WAV, для демо — MP3 192 кбит/с.'
  },

  quickStart: {
    title: '🚀 Быстрый старт для новичков',
    steps: [
      'Для <strong>мастеринга и архива</strong> сохраняйте <strong>WAV</strong> или <strong>FLAC</strong> (без потерь).',
      'Для <strong>стримингов</strong> загружайте <strong>WAV</strong> — платформы сожмут сами до нужного битрейта.',
      'Для <strong>демо и черновиков</strong> используйте <strong>MP3 192 кбит/с (VBR)</strong> — хорошее качество, маленький размер.',
      'Для <strong>подкастов</strong> используйте <strong>MP3 128 кбит/с (CBR)</strong> — достаточно для речи.',
      'Для <strong>личного прослушивания</strong> используйте <strong>MP3 320 кбит/с</strong> или <strong>AAC 256 кбит/с</strong>.',
      '<strong>Никогда не конвертируйте lossy → lossy</strong> (MP3 → MP3) — качество ухудшается.',
      '<strong>Всегда сохраняйте оригинал в lossless</strong> (WAV или FLAC).',
    ]
  },

  checklist: {
    title: '✅ Чек-лист: правильно ли вы выбрали битрейт?',
    items: [
      { id: 'item1', text: 'Для архива сохранён FLAC или WAV (lossless)', hint: 'Никогда не удаляйте оригинал в lossless' },
      { id: 'item2', text: 'Для стримингов загружен WAV (не MP3)', hint: 'Платформы лучше сжимают сами' },
      { id: 'item3', text: 'Для демо выбран MP3 192 кбит/с (VBR)', hint: 'Хороший баланс качества и размера' },
      { id: 'item4', text: 'Вы не конвертировали lossy → lossy', hint: 'MP3 → MP3 ухудшает качество' },
      { id: 'item5', text: 'Вы выбрали правильный формат для платформы', hint: 'Spotify — Ogg 320, Apple — AAC 256' },
      { id: 'item6', text: 'Размер файла соответствует цели', hint: 'Демо — маленький, архив — большой' },
      { id: 'item7', text: 'Вы знаете, какой битрейт поддерживает ваша платформа', hint: 'Проверьте требования перед загрузкой' },
    ],
    storageKey: 'hhrecords_bitrate_checklist'
  },

  userQuestions: {
    title: '❓ Вопросы от наших клиентов',
    items: [
      {
        question: 'Какой битрейт лучше: MP3 320 или AAC 256?',
        answer: 'AAC 256 кбит/с обычно звучит лучше MP3 320 кбит/с благодаря более современному алгоритму сжатия. Если у вас выбор — выбирайте AAC 256 для Apple-экосистемы или Ogg 320 для Spotify. Для максимальной совместимости — MP3 320.'
      },
      {
        question: 'Можно ли восстановить качество из 128 кбит/с MP3?',
        answer: 'Нет, нельзя. Потерянные данные безвозвратно удалены при сжатии. Вы можете попробовать повысить битрейт, но это только увеличит размер файла, не добавляя качества. Всегда сохраняйте оригинал в lossless.'
      },
      {
        question: 'Какой битрейт выбрать для саундтрека к фильму?',
        answer: 'Для видео-продакшна используйте WAV 24 бит, 48 кГц. Это стандарт для кино и телевидения. Битрейт будет 2 304 кбит/с (несжатый). Для финального экспорта — FLAC 24/48 для архива или AAC 256 кбит/с для интернета.'
      }
    ]
  },

  glossary: [
    { term: 'Битрейт (Bitrate)', definition: 'Количество данных в секунду. Определяет качество сжатого звука.' },
    { term: 'CBR (Constant Bitrate)', definition: 'Постоянный битрейт — одинаковый для всего файла.' },
    { term: 'VBR (Variable Bitrate)', definition: 'Переменный битрейт — меняется в зависимости от сложности аудио.' },
    { term: 'Lossless', definition: 'Сжатие без потерь — данные восстанавливаются полностью.' },
    { term: 'Lossy', definition: 'Сжатие с потерями — часть данных безвозвратно удаляется.' },
    { term: 'FLAC', definition: 'Free Lossless Audio Codec — самый популярный lossless формат.' },
    { term: 'ALAC', definition: 'Apple Lossless Audio Codec — lossless формат от Apple.' },
    { term: 'WAV', definition: 'Несжатый аудиоформат — максимальное качество, большой размер.' },
    { term: 'MP3', definition: 'Самый популярный сжатый формат с потерями.' },
    { term: 'AAC', definition: 'Advanced Audio Coding — более современный формат, лучше MP3.' },
    { term: 'Ogg Vorbis', definition: 'Открытый формат сжатия, используется Spotify.' },
    { term: 'Транскодинг', definition: 'Конвертация из одного сжатого формата в другой (lossy → lossy).' },
  ],

  tip: `
    <p>В студии HHRecords мы относимся к битрейту очень серьёзно. Главный принцип: <strong>сохраняйте оригинал в lossless, а для распространения используйте правильный битрейт</strong>.</p>
    <p><strong>Наш подход к битрейту:</strong></p>
    <ul>
      <li><strong>Архив:</strong> Всегда FLAC 24/48 (lossless). Это наша цифровая библиотека.</li>
      <li><strong>Стриминги:</strong> Загружаем WAV 24/48. Платформы сжимают до своего стандарта.</li>
      <li><strong>Демо:</strong> MP3 192 кбит/с (VBR) — отличный баланс качества и размера.</li>
      <li><strong>Клиентам:</strong> FLAC или MP3 320 в зависимости от запроса.</li>
      <li><strong>Подкасты:</strong> MP3 128 кбит/с (CBR) — достаточно для речи.</li>
    </ul>
    <p><strong>Совет новичкам:</strong></p>
    <ul>
      <li><strong>Всегда сохраняйте оригинал в lossless.</strong> WAV или FLAC — это ваш мастер-файл.</li>
      <li><strong>Не конвертируйте lossy → lossy.</strong> MP3 → MP3 ухудшает качество.</li>
      <li><strong>Для стримингов загружайте WAV.</strong> Платформы знают, как сжать лучше.</li>
      <li><strong>Для демо используйте 192 кбит/с VBR.</strong> Это золотая середина.</li>
      <li><strong>Проверяйте требования платформы.</strong> Каждая платформа имеет свои стандарты.</li>
    </ul>
    <p><strong>Важно:</strong> Битрейт — это компромисс между качеством и размером. Для архива — качество, для распространения — баланс.</p>
  `,

  relatedTerms: [
    { slug: 'bit-depth', icon: '💾', label: 'Битность' },
    { slug: 'sample-rate', icon: '📊', label: 'Частота дискретизации' },
    { slug: 'lufs', icon: '📈', label: 'LUFS' },
    { slug: 'audio-interface', icon: '🎧', label: 'Аудиоинтерфейс' },
    { slug: 'mixing', icon: '🎛️', label: 'Сведение' },
    { slug: 'mastering', icon: '🎧', label: 'Мастеринг' },
  ],

  sources: [
    { url: 'https://en.wikipedia.org/wiki/Bit_rate', label: 'Wikipedia — Bit Rate' },
    { url: 'https://en.wikipedia.org/wiki/MP3', label: 'Wikipedia — MP3' },
    { url: 'https://en.wikipedia.org/wiki/FLAC', label: 'Wikipedia — FLAC' },
    { url: 'https://www.soundonsound.com/techniques/mp3-bit-rates-explained', label: 'Sound on Sound — MP3 Bit Rates' },
    { url: 'https://www.masteringthemix.com/blogs/learn/bit-rate-in-audio', label: 'Mastering The Mix — Bit Rate' },
  ],

  widget: 'BitrateWidget',
}