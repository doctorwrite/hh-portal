// components/article/RelatedTerms.tsx

interface RelatedTerm {
  slug: string
  icon: string
  label: string
}

interface RelatedTermsProps {
  items: RelatedTerm[]
}

const RelatedTerms: React.FC<RelatedTermsProps> = ({ items }) => {
  return (
    <div className="related-terms">
      {items.map((item) => (
        <a key={item.slug} href={`/encyclopedia/${item.slug}`}>
          {item.icon} {item.label}
        </a>
      ))}
    </div>
  )
}

export default RelatedTerms