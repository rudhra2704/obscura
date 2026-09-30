/* Placeholder */
export default function ImagePlaceholder({ label, sub, style = {} }) {
  return (
    <div className="ph-wrap" data-label={label} style={style}>
      <span className="ph-icon">⬚</span>
      <span className="ph-label">{label}</span>
      {sub && <span className="ph-sub">{sub}</span>}
    </div>
  )
}
