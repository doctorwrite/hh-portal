// components/article/UserQuestions.tsx

interface QuestionItem {
  question: string
  answer: string
}

interface UserQuestionsProps {
  title: string
  items: QuestionItem[]
}

const UserQuestions: React.FC<UserQuestionsProps> = ({ title, items }) => {
  return (
    <section style={{ margin: '16px 0' }}>
      <h3 style={{
        color: '#fcf6ba',
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: '12px'
      }}>
        {title}
      </h3>
      {items.map((item, index) => (
        <article
          key={index}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '10px'
          }}
        >
          <div style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            marginBottom: '4px'
          }}>
            Вопрос: "{item.question}"
          </div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Ответ: {item.answer}
          </div>
        </article>
      ))}
    </section>
  )
}

export default UserQuestions