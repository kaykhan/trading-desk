type UnitCardProps = {
  title: string
  description: string
  meta: string
  status: string
  actionLabel?: string
  actionDisabled?: boolean
  onAction?: () => void
}

export function UnitCard({ title, description, meta, status, actionLabel, actionDisabled = false, onAction }: UnitCardProps) {
  return (
    <article className="shop-card unit-card">
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="status-badge">{status}</span>
      </div>
      <p className="card-meta">{meta}</p>
      {actionLabel ? (
        <button type="button" className="card-action" disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  )
}
