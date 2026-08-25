import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
        <h2 style={{ color: 'var(--gold-mid)', marginBottom: '20px' }}>Страница не найдена</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Извините, такой страницы не существует.
        </p>
        <Link href="/" className="btn btn-primary">
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  )
}