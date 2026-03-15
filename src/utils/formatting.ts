type FormatNumberOptions = {
  decimalsBelowThreshold?: number
}

export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { decimalsBelowThreshold = 0 } = options

  if (value < 1_000_000) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalsBelowThreshold,
      maximumFractionDigits: decimalsBelowThreshold,
    })
  }

  if (value < 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }

  if (value < 1_000_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }

  return `${(value / 1_000_000_000_000).toFixed(1)}T`
}

export function formatCurrency(value: number, decimalsBelowThreshold = 0): string {
  return `$${formatNumber(value, { decimalsBelowThreshold })}`
}

export function formatCurrencyTicker(value: number): string {
  if (value < 10_000_000) {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: value < 100 ? 1 : 0,
      maximumFractionDigits: value < 100 ? 1 : 0,
    })}`
  }

  if (value < 1_000_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}m`
  }

  if (value < 1_000_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}b`
  }

  return `$${(value / 1_000_000_000_000).toFixed(2)}t`
}

export function formatRate(value: number): string {
  return `${formatCurrency(value, value < 100 ? 1 : 0)} / sec`
}

export function formatPlainRate(value: number): string {
  return `${formatNumber(value, { decimalsBelowThreshold: value < 10 ? 2 : value < 100 ? 1 : 0 })} / sec`
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`
}
