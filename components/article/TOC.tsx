// components/article/TOC.tsx

interface TOCItem {
  id: string
  label: string
}

interface TOCProps {
  items: TOCItem[]
}

const TOC: React.FC<TOCProps> = ({ items }) => {
  return (
    <div className="toc">
      <h2 className="toc-title">📑 Содержание</h2>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TOC