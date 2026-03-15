type UpgradeCardProps = {
  title: string
  description: string
  cost: number
  stateLabel: string
  actionLabel?: string
  actionDisabled?: boolean
  onAction?: () => void
}

export function UpgradeCard({ title, description, cost, stateLabel, actionLabel, actionDisabled = false, onAction }: UpgradeCardProps) {
  return (
    <article className="shop-card upgrade-card">
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="status-badge">{stateLabel}</span>
      </div>
      <p className="card-meta">Cost: ${cost.toLocaleString()}</p>
      {actionLabel ? (
        <button type="button" className="card-action" disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </article>
  )
}
