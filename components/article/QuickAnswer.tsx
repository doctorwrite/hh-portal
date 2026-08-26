// components/article/QuickAnswer.tsx

interface QuickAnswerProps {
  text: string
}

const QuickAnswer: React.FC<QuickAnswerProps> = ({ text }) => {
  return (
    <div className="quick-answer">
      <div className="quick-answer-label">⚡ Краткий ответ</div>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}

export default QuickAnswer