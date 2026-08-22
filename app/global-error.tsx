'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="error-page">
          <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>500</h1>
            <h2 style={{ color: 'var(--gold-mid)', marginBottom: '20px' }}>Что-то пошло не так</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Произошла внутренняя ошибка сервера. Попробуйте обновить страницу.
            </p>
            <Link href="/" className="btn btn-primary">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}