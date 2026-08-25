'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Главная' },
  { href: '/encyclopedia', label: 'Энциклопедия' },
  { href: '/eq', label: '🎛️ Эквалайзер' },
]

export default function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Логотип */}
        <Link href="/" className="logo-block" aria-label="HHRecords на главную">
          <Image
            src="/images/logo.webp"
            alt="HHRecords — Студия звукозаписи в Красноярске"
            width={48}
            height={48}
            className="logo-img"
            priority
          />
          <span className="logo-text">
            <span className="logo-name">HHRecords</span>
            <span className="logo-sub">Студия звукозаписи</span>
          </span>
        </Link>

        {/* Навигация — всегда видна */}
        <nav className="main-nav" role="navigation" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA кнопки */}
        <div className="cta-buttons">
          <a href="tel:+79138376772" className="btn btn-outline" aria-label="Позвонить">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
            </svg>
            <span className="btn-label">Телефон</span>
          </a>
          <a
            href="tg://resolve?domain=Nickkrsk"
            className="btn btn-primary"
            aria-label="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span className="btn-label">Telegram</span>
          </a>
          <a
            href="https://vk.com/hhrecords24"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-vk"
            aria-label="Группа ВКонтакте"
          >
            VK
          </a>
        </div>
      </div>
    </header>
  )
}
