import type { MilestoneDefinition } from '../types/game'

export const MILESTONES: MilestoneDefinition[] = [
  {
    id: 'solo-trader',
    label: 'Phase 1: Solo Trader',
    rangeLabel: '0-8 min',
    objective: 'Build your first cash stack, improve click income, and reach the first Junior Trader.',
  },
  {
    id: 'junior-desk',
    label: 'Phase 2: Junior Trader Desk',
    rangeLabel: '8-30 min',
    objective: 'Grow passive income through early hiring and transition into mixed active and idle play.',
  },
  {
    id: 'firm-growth',
    label: 'Phase 3: Senior Trader Firm Growth',
    rangeLabel: '30-60 min',
    objective: 'Unlock Senior Recruitment and turn higher-tier human capital into the core engine of the first run.',
  },
  {
    id: 'bot-era',
    label: 'Phase 4: Trading Bot Era',
    rangeLabel: '60-85 min',
    objective: 'Build a real Senior desk, then open algorithmic trading and push into late-run automation.',
  },
  {
    id: 'prestige-decision',
    label: 'Phase 5: Prestige Decision',
    rangeLabel: '80-90+ min',
    objective: 'Present the slowdown clearly and make Reputation the smart next move.',
  },
]
