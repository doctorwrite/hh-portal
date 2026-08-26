// components/article/TipBlock.tsx

interface TipBlockProps {
  text: string
}

const TipBlock: React.FC<TipBlockProps> = ({ text }) => {
  return (
    <div className="tip-with-photo">
      <h3 className="question">💡 Совет от звукорежиссёра HHRecords</h3>
      <div className="tip-content">
        <div className="tip-text" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    </div>
  )
}

export default TipBlock