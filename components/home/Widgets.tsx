// components/home/Widgets.tsx
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    VK?: {
      Widgets?: {
        Playlist: (elementId: string, ownerId: number, playlistId: number, hash: string) => void;
      };
    };
  }
}

export default function Widgets() {
  useEffect(() => {
    // ===== VK ПЛЕЙЛИСТ =====
    const loadVK = () => {
      if (typeof window !== 'undefined' && !document.querySelector('#vk-api-script')) {
        const script = document.createElement('script');
        script.id = 'vk-api-script';
        script.src = 'https://vk.com/js/api/openapi.js?173';
        script.async = true;
        script.onload = () => {
          try {
            if (window.VK && window.VK.Widgets) {
              window.VK.Widgets.Playlist(
                'vk_playlist_-79491923_2',
                -79491923,
                2,
                'ef3afaf65c2319e00b'
              );
            } else {
              const fallback = document.getElementById('playlist-fallback');
              if (fallback) fallback.style.display = 'block';
            }
          } catch (e) {
            console.warn('VK Widget error:', e);
            const fallback = document.getElementById('playlist-fallback');
            if (fallback) fallback.style.display = 'block';
          }
        };
        script.onerror = () => {
          const fallback = document.getElementById('playlist-fallback');
          if (fallback) fallback.style.display = 'block';
        };
        document.head.appendChild(script);
      }
    };

    // ===== 2ГИС ОТЗЫВЫ =====
    const load2GIS = () => {
      const iframe = document.getElementById('big_light_70000001031628028') as HTMLIFrameElement;
      if (!iframe) return;
      if (!iframe.contentWindow) return;

      const base64 = 'PGhlYWQ+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPgogICAgd2luZG93Ll9fc2l6ZV9fPSdiaWcnOwogICAgd2luZG93Ll9fdGhlbWVfXz0nbGlnaHQnOwogICAgd2luZG93Ll9fYnJhbmNoSWRfXz0nNzAwMDAwMDEwMzE2MjgwMjgnCiAgICB3aW5kb3cuX19vcmdJZF9fPSc3MDAwMDAwMTAzMTYyODAyNycKICAgPC9zY3JpcHQ+PHNjcmlwdCBjcm9zc29yaWdpbj0iYW5vbnltb3VzIiB0eXBlPSJtb2R1bGUiIHNyYz0iaHR0cHM6Ly9kaXNrLjJnaXMuY29tL3dpZGdldC1jb25zdHJ1Y3Rvci9hc3NldHMvaWZyYW1lLmpzIj48L3NjcmlwdD48bGluayByZWw9Im1vZHVsZXByZWxvYWQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lzLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmpzIj48bGluayByZWw9InN0eWxlc2hlZXQiIGNyb3Nzb3JpZ2luPSJhbm9ueW1vdXMiIGhyZWY9Imh0dHBzOi8vZGlzay4yZ2lsLmNvbS93aWRnZXQtY29uc3RydWN0b3IvYXNzZXRzL2RlZmF1bHRzLmNzcyI+PC9oZWFkPjxib2R5PjxkaXYgaWQ9ImlmcmFtZSI+PC9kaXY+PC9ib2R5Pg==';

      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const html = new TextDecoder('utf-8').decode(bytes);

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
      } catch (e) {
        console.warn('2GIS Widget error:', e);
      }
    };

    loadVK();
    setTimeout(load2GIS, 500);
  }, []);

  return null;
}
