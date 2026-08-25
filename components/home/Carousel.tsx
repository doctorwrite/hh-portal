// components/home/Carousel.tsx
'use client';

import { useState, useEffect } from 'react';

const images = [
  { 
    src: '/images/studio-control.jpg', 
    alt: 'Пульт и мониторы в студии звукозаписи HHRecords',
    fallback: '🎛️ Пульт и мониторы'
  },
  { 
    src: '/images/studio-microphone.jpg', 
    alt: 'Микрофон Neumann в студии звукозаписи HHRecords',
    fallback: '🎙️ Микрофон Neumann'
  },
  { 
    src: '/images/studio-recording.jpg', 
    alt: 'Процесс записи вокала в студии HHRecords',
    fallback: '🎤 Запись вокала'
  },
  { 
    src: '/images/studio-gear.jpg', 
    alt: 'Стойка с оборудованием в студии HHRecords',
    fallback: '⚙️ Оборудование студии'
  },
  { 
    src: '/images/studio-lounge.jpg', 
    alt: 'Зона отдыха в студии звукозаписи HHRecords',
    fallback: '🛋️ Зона отдыха'
  },
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const changeSlide = (n: number) => {
    setCurrentSlide((prev) => (prev + n + images.length) % images.length);
  };

  const goToSlide = (n: number) => {
    setCurrentSlide(n);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const changeLightboxImage = (n: number) => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + n + images.length) % images.length);
  };

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxIndex !== null) changeLightboxImage(-1);
      if (e.key === 'ArrowRight' && lightboxIndex !== null) changeLightboxImage(1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      changeSlide(1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="carousel-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          >
            {imageErrors[index] ? (
              <div className="carousel-fallback">
                <span style={{ fontSize: '4rem', display: 'block' }}>
                  {image.fallback.split(' ')[0]}
                </span>
                <p>{image.alt}</p>
              </div>
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                onError={() => handleImageError(index)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div 
              className="carousel-overlay"
              onClick={() => {
                if (!imageErrors[index]) {
                  openLightbox(index);
                }
              }}
            >
              🔍
            </div>
          </div>
        ))}
        <button
          className="carousel-btn prev"
          onClick={() => changeSlide(-1)}
          aria-label="Предыдущее фото"
        >
          ‹
        </button>
        <button
          className="carousel-btn next"
          onClick={() => changeSlide(1)}
          aria-label="Следующее фото"
        >
          ›
        </button>
        <div className="carousel-dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* ===== ЛАЙТБОКС ===== */}
      {lightboxIndex !== null && (
        <div 
          className="lightbox-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button 
            className="lightbox-prev" 
            onClick={(e) => { e.stopPropagation(); changeLightboxImage(-1); }}
          >
            ‹
          </button>
          <img 
            src={images[lightboxIndex].src} 
            alt={images[lightboxIndex].alt}
            className="lightbox-image"
          />
          <button 
            className="lightbox-next" 
            onClick={(e) => { e.stopPropagation(); changeLightboxImage(1); }}
          >
            ›
          </button>
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
