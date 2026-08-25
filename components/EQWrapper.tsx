'use client';

import React, { useEffect, useRef } from 'react';

interface EQWrapperProps {
  theme?: 'dark' | 'light';
  className?: string;
}

declare global {
  interface Window {
    __eq?: any;
  }
}

const EQWrapper: React.FC<EQWrapperProps> = ({ 
  theme = 'dark',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const loadStyles = async (): Promise<void> => {
      return new Promise((resolve) => {
        if (document.getElementById('eq-styles')) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.id = 'eq-styles';
        link.rel = 'stylesheet';
        link.href = '/modules/eq/src/styles.css';
        
        link.onload = () => resolve();
        link.onerror = () => {
          console.warn('Не удалось загрузить стили эквалайзера');
          resolve();
        };
        
        document.head.appendChild(link);
      });
    };

    const initEQ = async () => {
      if (!containerRef.current) return;

      try {
        await loadStyles();
        const { default: EQWidget } = await import('@/modules/eq/src/ui/EQWidget');
        const widget = new EQWidget(containerRef.current, { theme });
        widgetRef.current = widget;
        window.__eq = widget;
        console.log('🎛️ HHRecords EQ Pro + Audio Editor загружен!');
      } catch (error) {
        console.error('Ошибка загрузки эквалайзера:', error);
      }
    };

    initEQ();

    return () => {
      if (widgetRef.current && typeof widgetRef.current.destroy === 'function') {
        widgetRef.current.destroy();
      }
      delete window.__eq;
    };
  }, [theme]);

  return (
    <div 
      className="hh-eq-wrapper"
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '500px',
        position: 'relative'
      }}
    >
      <div 
        id="eqContainer" 
        ref={containerRef} 
        className={className}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '500px'
        }}
      />
    </div>
  );
};

export default EQWrapper;
