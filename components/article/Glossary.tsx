// components/article/Glossary.tsx

interface GlossaryItem {
  term: string
  definition: string
}

interface GlossaryProps {
  items: GlossaryItem[]
}

const Glossary: React.FC<GlossaryProps> = ({ items }) => {
  return (
    <div className="micro-glossary">
      <h3 className="micro-glossary-title">📖 Микро-глоссарий</h3>
      <dl>
        {items.map((item, index) => (
          <div key={index}>
            <dt>{item.term}</dt>
            <dd>{item.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default Glossary