import EQWidget from './ui/EQWidget.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('eqContainer');
  const widget = new EQWidget(container, { theme: 'dark' });
  window.__eq = widget;
  console.log('🎛️ HHRecords EQ Pro + Audio Editor (модули) загружен!');
  console.log('');
  console.log('📖 Функции редактора:');
  console.log('  ✂️ Обрезка - меню "Эффекты" → "Обрезка" (или клавиша R)');
  console.log('  🌊 Fade - меню "Эффекты" → "Fade In/Out"');
  console.log('  📊 Нормализация - меню "Эффекты" → "Нормализация"');
  console.log('  🔄 Реверс - меню "Эффекты" → "Реверс"');
  console.log('  ⏱️ Скорость - меню "Эффекты" → "Скорость"');
  console.log('  🎵 Тон - меню "Эффекты" → "Тон"');
  console.log('');
  console.log('⌨️ Горячие клавиши:');
  console.log('  R - Режим обрезки');
  console.log('  Ctrl+Z - Отменить эффект');
  console.log('  Ctrl+Y - Повторить эффект');
  console.log('  Space - Play/Pause');
});