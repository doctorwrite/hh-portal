// components/article/QABlock.tsx

interface QAItem {
  id: string
  question: string
  answer: string
}

interface QABlockProps {
  items: QAItem[]
}

const QABlock: React.FC<QABlockProps> = ({ items }) => {
  return (
    <>
      {items.map((item, index) => (
        <div className="qa-block" id={item.id} key={item.id}>
          <h3 className="question">
            <span className="num">{index + 1}</span>
            {item.question}
          </h3>
          <div className="answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
        </div>
      ))}
    </>
  )
}

export default QABlock