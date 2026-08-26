// components/article/GenreTable.tsx

interface GenreRow {
  genre: string
  boost: string
  cut: string
}

interface GenreTableProps {
  title: string
  rows: GenreRow[]
  note: string
}

const GenreTable: React.FC<GenreTableProps> = ({ title, rows, note }) => {
  return (
    <section>
      <h3 style={{
        color: '#fcf6ba',
        fontSize: '1.2rem',
        fontWeight: 700,
        margin: '24px 0 12px',
        fontFamily: "'Oswald', sans-serif"
      }}>
        {title}
      </h3>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>
        <p>В студии HHRecords мы подходим к эквализации индивидуально, в зависимости от жанра. Вот наши базовые настройки:</p>
        <div style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            overflow: 'hidden',
            fontSize: '0.85rem'
          }}>
            <thead>
              <tr>
                <th style={{
                  background: 'rgba(245, 197, 66, 0.1)',
                  color: '#fcf6ba',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600
                }}>Жанр</th>
                <th style={{
                  background: 'rgba(245, 197, 66, 0.1)',
                  color: '#fcf6ba',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600
                }}>Какие частоты подчёркиваем</th>
                <th style={{
                  background: 'rgba(245, 197, 66, 0.1)',
                  color: '#fcf6ba',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600
                }}>Какие убираем</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong style={{ color: '#fff' }}>{row.genre}</strong>
                  </td>
                  <td style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--text-secondary)'
                  }}>{row.boost}</td>
                  <td style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: 'var(--text-secondary)'
                  }}>{row.cut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p><em>{note}</em></p>
      </div>
    </section>
  )
}

export default GenreTable