// components/article/QuickStart.tsx

interface QuickStartProps {
  title: string
  steps: string[]
}

const QuickStart: React.FC<QuickStartProps> = ({ title, steps }) => {
  return (
    <section className="quick-start" style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '20px 24px',
      margin: '16px 0'
    }}>
      <h3 style={{
        color: '#fcf6ba',
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: '12px'
      }}>
        {title}
      </h3>
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <ol style={{
          color: 'var(--text-secondary)',
          lineHeight: 2,
          paddingLeft: '24px'
        }}>
          {steps.map((step, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
          ))}
        </ol>
      </div>
    </section>
  )
}

export default QuickStart