import { memo, useMemo, useState } from 'react'
import { Background, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BrainCircuit, ChevronDown, ChevronUp, Cpu, Expand, GitBranch, Landmark, TrendingUp, Users } from 'lucide-react'
import { RESEARCH_BRANCH_DESCRIPTIONS, RESEARCH_BRANCH_LABELS, RESEARCH_BRANCH_ORDER, RESEARCH_SUBGROUPS, getResearchTechsByBranch, RESEARCH_TECH } from '@/data/researchTech'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { ResearchBranchId, ResearchTechDefinition, ResearchTechId } from '@/types/game'
import { playResearchUnlockChime } from '@/utils/audio'
import { formatCurrency, formatNumber, formatPlainRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SummaryTile } from './DashboardPrimitives'

type ResearchGraphData = {
  title: string
  costLabel: string
  branchLabel: string
  status: string
  reason: string
  isPurchased: boolean
  isLocked: boolean
  isReady: boolean
  accentClass: string
}

type ResearchGroupData = {
  title: string
  subtitle: string
  accentClass: string
  variant?: 'default' | 'office' | 'energy'
}

const NODE_WIDTH = 210
const NODE_HEIGHT = 124

const BRANCH_THEMES: Record<ResearchBranchId, {
  icon: typeof GitBranch
  badge: string
  edge: string
  background: string
  glow: string
}> = {
  markets: {
    icon: TrendingUp,
    badge: 'text-amber-300',
    edge: 'rgba(245, 158, 11, 0.65)',
    background: 'from-amber-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(245,158,11,0.18)]',
  },
  humanCapital: {
    icon: Users,
    badge: 'text-sky-300',
    edge: 'rgba(56, 189, 248, 0.65)',
    background: 'from-sky-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(56,189,248,0.18)]',
  },
  infrastructure: {
    icon: Cpu,
    badge: 'text-emerald-300',
    edge: 'rgba(16, 185, 129, 0.65)',
    background: 'from-emerald-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(16,185,129,0.18)]',
  },
  automation: {
    icon: BrainCircuit,
    badge: 'text-violet-300',
    edge: 'rgba(167, 139, 250, 0.7)',
    background: 'from-violet-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(167,139,250,0.18)]',
  },
  boosts: {
    icon: Expand,
    badge: 'text-cyan-300',
    edge: 'rgba(34, 211, 238, 0.7)',
    background: 'from-cyan-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(34,211,238,0.18)]',
  },
  regulation: {
    icon: Landmark,
    badge: 'text-rose-300',
    edge: 'rgba(244, 63, 94, 0.65)',
    background: 'from-rose-500/10 via-background to-background',
    glow: 'shadow-[inset_0_1px_0_rgba(244,63,94,0.18)]',
  },
}

function formatResearchCostLabel(cost: number, currency: 'cash' | 'researchPoints') {
  return currency === 'cash' ? formatCurrency(cost) : `${formatNumber(cost)} RP`
}

function getResearchStatus(gameState: ReturnType<typeof useGameStore.getState>, techId: ResearchTechId) {
  const purchased = selectors.isResearchTechPurchased(techId)(gameState)
  const visible = selectors.isResearchTechVisible(techId)(gameState)
  const unlocked = selectors.isResearchTechUnlocked(techId)(gameState)
  const shortfall = selectors.researchTechShortfall(techId)(gameState)
  const missingPrerequisites = selectors.missingResearchPrerequisites(techId)(gameState)
  const tech = RESEARCH_TECH.find((item) => item.id === techId)

  if (purchased) {
    return { status: 'Purchased', tone: 'done', disabled: true, reason: 'Already researched.' }
  }

  if (missingPrerequisites.length > 0) {
    return {
      status: 'Locked',
      tone: 'locked',
      disabled: true,
      reason: `Requires ${missingPrerequisites.map((item) => item.name).join(', ')} first.`,
    }
  }

  if (tech?.lockedReason && (!visible || !unlocked)) {
    return {
      status: 'Locked',
      tone: 'locked',
      disabled: true,
      reason: tech.lockedReason(gameState),
    }
  }

  if (!visible) {
    return { status: 'Future', tone: 'locked', disabled: true, reason: 'Progress further in the current run to reveal this node.' }
  }

  if (!unlocked) {
    return {
      status: 'Locked',
      tone: 'locked',
      disabled: true,
      reason: tech?.lockedReason ? tech.lockedReason(gameState) : 'Meet this node\'s run requirement first.',
    }
  }

  if (shortfall > 0) {
    return {
      status: 'Need funds',
      tone: 'default',
      disabled: true,
      reason: `Need ${formatResearchCostLabel(shortfall, tech?.currency ?? 'researchPoints')} more.`,
    }
  }

  return { status: 'Ready', tone: 'ready', disabled: false, reason: 'Ready to research.' }
}

function getResearchTechById(techId: ResearchTechId) {
  return RESEARCH_TECH.find((item) => item.id === techId)
}

const ResearchFlowNode = memo(({ data }: NodeProps<Node<ResearchGraphData>>) => {
  const tone = data.isPurchased
    ? 'border-emerald-500/50 bg-emerald-500/12 text-emerald-100'
    : data.isLocked
      ? 'border-border/70 bg-[#2a2a2a] text-muted-foreground'
      : data.isReady
        ? 'border-primary/50 bg-primary/10 text-foreground'
        : 'border-border/80 bg-background/80 text-foreground'

  return (
    <div className={`w-[210px] rounded-lg border px-3 py-2 shadow-sm transition ${tone}`}>
      <Handle type="target" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-border/80" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-[8px] uppercase tracking-[0.16em] ${data.accentClass}`}>{data.branchLabel}</p>
          <h3 className="mt-1 text-[12px] font-semibold leading-4">{data.title}</h3>
        </div>
        <div className="rounded-md border border-border/70 bg-background/60 px-1.5 py-1 text-[9px] font-mono uppercase tracking-[0.08em] text-primary">
          {data.costLabel}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase tracking-[0.12em]">{data.status}</p>
      </div>
      <p className="mt-1 text-[9px] leading-3.5 text-muted-foreground">{data.reason}</p>
      <Handle type="source" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-border/80" />
    </div>
  )
})

const ResearchGroupNode = memo(({ data }: NodeProps<Node<ResearchGroupData>>) => {
  const variantClasses = data.variant === 'office'
    ? 'border-cyan-400/35 bg-cyan-500/6 shadow-[inset_0_1px_0_rgba(34,211,238,0.08)]'
    : data.variant === 'energy'
      ? 'border-emerald-400/35 bg-emerald-500/6 shadow-[inset_0_1px_0_rgba(52,211,153,0.08)]'
      : 'border-border/70 bg-background/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'

  return (
    <div className={`h-full w-full rounded-2xl border border-dashed p-4 ${variantClasses}`}>
      <p className={`text-[9px] uppercase tracking-[0.18em] ${data.accentClass}`}>{data.title}</p>
      <p className="mt-1 max-w-[260px] text-[10px] leading-4 text-muted-foreground">{data.subtitle}</p>
    </div>
  )
})

const nodeTypes = { researchNode: ResearchFlowNode, researchGroup: ResearchGroupNode }

function getLocalPrerequisites(techs: ResearchTechDefinition[], tech: ResearchTechDefinition) {
  const techIds = new Set(techs.map((candidate) => candidate.id))
  return (tech.prerequisites ?? []).filter((prerequisiteId) => techIds.has(prerequisiteId))
}

function getBranchTreeLayout(techs: ResearchTechDefinition[]) {
  const depthMap = new Map<ResearchTechId, number>()

  function getDepth(tech: ResearchTechDefinition): number {
    const cachedDepth = depthMap.get(tech.id)

    if (cachedDepth !== undefined) {
      return cachedDepth
    }

    const localPrerequisites = getLocalPrerequisites(techs, tech)
      .map((prerequisiteId) => techs.find((candidate) => candidate.id === prerequisiteId))
      .filter((candidate): candidate is ResearchTechDefinition => Boolean(candidate))

    const depth = localPrerequisites.length === 0
      ? 0
      : Math.max(...localPrerequisites.map((candidate) => getDepth(candidate))) + 1

    depthMap.set(tech.id, depth)
    return depth
  }

  const groupedByDepth = new Map<number, ResearchTechDefinition[]>()

  techs.forEach((tech) => {
    const depth = getDepth(tech)
    groupedByDepth.set(depth, [...(groupedByDepth.get(depth) ?? []), tech])
  })

  const maxDepth = Math.max(...groupedByDepth.keys(), 0)
  const maxWidth = Math.max(...Array.from(groupedByDepth.values(), (level) => level.length), 1)
  const horizontalGap = 340
  const verticalGap = 210
  const positions = new Map<ResearchTechId, { x: number; y: number }>()

  Array.from(groupedByDepth.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([depth, levelTechs]) => {
      const levelOffset = ((maxWidth - levelTechs.length) * horizontalGap) / 2

      levelTechs.forEach((tech, index) => {
        positions.set(tech.id, {
          x: 40 + levelOffset + index * horizontalGap,
          y: 40 + (maxDepth - depth) * verticalGap,
        })
      })
    })

  return positions
}

function buildBranchGraph(techs: ResearchTechDefinition[], gameState: ReturnType<typeof useGameStore.getState>, branchId: ResearchBranchId) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const theme = BRANCH_THEMES[branchId]
  const treeLayout = getBranchTreeLayout(techs)
  const subgroupDefinitions = RESEARCH_SUBGROUPS[branchId] ?? []
  const techNodeMap = new Map<ResearchTechId, Node<ResearchGraphData>>()

  subgroupDefinitions.forEach((group) => {
    const groupMembers = group.techIds
      .map((techId) => techs.find((candidate) => candidate.id === techId))
      .filter((tech): tech is ResearchTechDefinition => Boolean(tech))

    if (groupMembers.length === 0) {
      return
    }

    const groupPositions = groupMembers.map((tech, index) => ({
      tech,
      position: tech.graphPosition ?? treeLayout.get(tech.id) ?? { x: index * 280, y: 60 },
    }))

    const minX = Math.min(...groupPositions.map(({ position }) => position.x))
    const maxX = Math.max(...groupPositions.map(({ position }) => position.x + NODE_WIDTH))
    const minY = Math.min(...groupPositions.map(({ position }) => position.y))
    const maxY = Math.max(...groupPositions.map(({ position }) => position.y + NODE_HEIGHT))
    const paddingX = group.paddingX ?? 36
    const paddingTop = group.paddingTop ?? 92
    const paddingBottom = group.paddingBottom ?? 56
    const groupX = minX - paddingX
    const groupY = minY - paddingTop
    const extraNodeBottomInset = 42

    nodes.push({
      id: group.id,
      type: 'researchGroup',
      position: { x: groupX, y: groupY },
      draggable: false,
      selectable: false,
      connectable: false,
      data: {
        title: group.title,
        subtitle: group.subtitle,
        accentClass: theme.badge,
        variant: group.variant,
      },
      style: {
        width: maxX - minX + paddingX * 2,
        height: maxY - minY + paddingTop + paddingBottom + extraNodeBottomInset,
      },
    })

    groupPositions.forEach(({ tech, position }) => {
      const state = getResearchStatus(gameState, tech.id)
      techNodeMap.set(tech.id, {
        id: tech.id,
        type: 'researchNode',
        parentId: group.id,
        extent: 'parent',
        draggable: false,
        position: {
          x: position.x - groupX,
          y: position.y - groupY + 14,
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
        data: {
          title: tech.name,
          costLabel: formatResearchCostLabel(tech.researchCost, tech.currency),
          branchLabel: RESEARCH_BRANCH_LABELS[tech.branch],
          status: state.status,
          reason: state.reason,
          isPurchased: state.tone === 'done',
          isLocked: state.tone === 'locked',
          isReady: state.tone === 'ready',
          accentClass: theme.badge,
        },
      })
    })
  })

  techs.forEach((tech, index) => {
    if (techNodeMap.has(tech.id)) {
      return
    }

    const state = getResearchStatus(gameState, tech.id)
    techNodeMap.set(tech.id, {
      id: tech.id,
      type: 'researchNode',
      position: treeLayout.get(tech.id) ?? tech.graphPosition ?? { x: index * 280, y: 60 },
      sourcePosition: Position.Top,
      targetPosition: Position.Bottom,
      data: {
        title: tech.name,
        costLabel: formatResearchCostLabel(tech.researchCost, tech.currency),
        branchLabel: RESEARCH_BRANCH_LABELS[tech.branch],
        status: state.status,
        reason: state.reason,
        isPurchased: state.tone === 'done',
        isLocked: state.tone === 'locked',
        isReady: state.tone === 'ready',
        accentClass: theme.badge,
      },
    })
  })

  techs.forEach((tech) => {
    const node = techNodeMap.get(tech.id)

    if (node) {
      nodes.push(node)
    }
  })

  techs.forEach((tech) => {
    ;(tech.prerequisites ?? []).forEach((prerequisiteId) => {
      if (!techs.some((candidate) => candidate.id === prerequisiteId)) return

      edges.push({
        id: `${prerequisiteId}-${tech.id}`,
        source: prerequisiteId,
        target: tech.id,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: theme.edge, strokeWidth: 1.8 },
      })
    })
  })

  return { nodes, edges }
}

function ResearchPurchaseDialog({
  techId,
  onClose,
}: {
  techId: ResearchTechId | null
  onClose: () => void
}) {
  const gameState = useGameStore((state) => state)
  const buyResearchTech = useGameStore((state) => state.buyResearchTech)

  if (!techId) {
    return null
  }

  const tech = getResearchTechById(techId)

  if (!tech) {
    return null
  }

  const status = getResearchStatus(gameState, techId)
  const missingPrerequisites = selectors.missingResearchPrerequisites(techId)(gameState)

  return (
    <Dialog open={techId !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg border-border/80 bg-card/95 text-foreground">
        <DialogHeader>
          <DialogTitle>{tech.name}</DialogTitle>
          <DialogDescription>
            {RESEARCH_BRANCH_LABELS[tech.branch]} - {formatResearchCostLabel(tech.researchCost, tech.currency)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-xl border border-border/80 bg-background/60 p-3 text-muted-foreground">
            {tech.description}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-background/50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Status</p>
              <p className="mt-1 text-sm">{status.status}</p>
              <p className="mt-1 text-xs text-muted-foreground">{status.reason}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Prerequisites</p>
              <p className="mt-1 text-sm">
                {tech.prerequisites && tech.prerequisites.length > 0
                  ? tech.prerequisites.map((prerequisiteId) => getResearchTechById(prerequisiteId)?.name ?? prerequisiteId).join(', ')
                  : 'None'}
              </p>
              {missingPrerequisites.length > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Missing: {missingPrerequisites.map((item) => item.name).join(', ')}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            disabled={status.disabled}
            onClick={() => {
              buyResearchTech(techId)
              playResearchUnlockChime()
              onClose()
            }}
          >
            Confirm Research
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResearchBranchSection({
  branchId,
  expanded = false,
  isOpen,
  onToggle,
  onSelectTech,
}: {
  branchId: ResearchBranchId
  expanded?: boolean
  isOpen: boolean
  onToggle: () => void
  onSelectTech: (_techId: ResearchTechId) => void
}) {
  const gameState = useGameStore((state) => state)
  const techs = getResearchTechsByBranch(branchId)
  const { nodes, edges } = useMemo(() => buildBranchGraph(techs, gameState, branchId), [techs, gameState, branchId])
  const theme = BRANCH_THEMES[branchId]
  const BranchIcon = theme.icon
  const graphHeight = Math.max(...nodes.map((node) => node.position.y + ((node.style && typeof node.style.height === 'number') ? node.style.height : 180)), expanded ? 520 : 360)
  const ToggleIcon = isOpen ? ChevronUp : ChevronDown

  return (
    <section className={`space-y-2 rounded-xl border border-border/80 bg-gradient-to-br ${theme.background} p-3 ${theme.glow}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 rounded-lg text-left transition hover:bg-background/30"
      >
        <div>
          <div className="flex items-center gap-2">
            <BranchIcon className={`size-3.5 ${theme.badge}`} />
            <p className={`text-[10px] uppercase tracking-[0.22em] ${theme.badge}`}>{RESEARCH_BRANCH_LABELS[branchId]}</p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{RESEARCH_BRANCH_DESCRIPTIONS[branchId]}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {isOpen ? 'Collapse' : 'Expand'}
          <ToggleIcon className="size-3.5" />
        </div>
      </button>

      {isOpen ? (
        <div className="rounded-xl border border-border/80 bg-card/70" style={{ height: graphHeight }}>
          <ReactFlow
            fitView
            fitViewOptions={{
              padding: expanded ? 0.08 : 0.06,
              minZoom: expanded ? 0.78 : 0.88,
              maxZoom: 1.15,
            }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            onNodeClick={(_, node) => onSelectTech(node.id as ResearchTechId)}
            zoomOnDoubleClick={false}
            selectNodesOnDrag={false}
            minZoom={0.5}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="rgba(90,90,90,0.2)" gap={22} size={1} />
          </ReactFlow>
        </div>
      ) : null}
    </section>
  )
}

export function ResearchTreeContent({ expanded = false }: { expanded?: boolean }) {
  const [selectedTechId, setSelectedTechId] = useState<ResearchTechId | null>(null)
  const researchPoints = useGameStore(selectors.researchPoints)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const internScientists = useGameStore((state) => state.internResearchScientistCount)
  const juniorScientists = useGameStore((state) => state.juniorResearchScientistCount)
  const seniorScientists = useGameStore((state) => state.seniorResearchScientistCount)
  const purchasedTechCount = useGameStore((state) => RESEARCH_TECH.filter((tech) => state.purchasedResearchTech[tech.id]).length)
  const researchBranchExpanded = useGameStore((state) => state.ui.researchBranchExpanded)
  const setResearchBranchExpanded = useGameStore((state) => state.setResearchBranchExpanded)

  return (
    <>
      <div className={`flex h-full min-h-0 flex-col gap-2 ${expanded ? 'min-w-[1180px]' : ''}`}>
      <div className="grid gap-2 md:grid-cols-4">
        <SummaryTile label="Research Points" value={formatNumber(researchPoints, { decimalsBelowThreshold: researchPoints < 100 ? 1 : 0 })} icon={BrainCircuit} />
        <SummaryTile label="Research / Sec" value={formatPlainRate(researchPointsPerSecond)} icon={TrendingUp} />
        <SummaryTile label="Scientists" value={`${internScientists} / ${juniorScientists} / ${seniorScientists}`} icon={Users} />
        <SummaryTile label="Tech Unlocked" value={`${purchasedTechCount}/${RESEARCH_TECH.length}`} icon={GitBranch} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="space-y-3 pb-2">
          {RESEARCH_BRANCH_ORDER.map((branchId) => (
            <ResearchBranchSection
              key={branchId}
              branchId={branchId}
              expanded={expanded}
              isOpen={researchBranchExpanded[branchId] === true}
              onToggle={() => setResearchBranchExpanded(branchId, researchBranchExpanded[branchId] !== true)}
              onSelectTech={setSelectedTechId}
            />
          ))}
        </div>
      </div>
      </div>
      <ResearchPurchaseDialog techId={selectedTechId} onClose={() => setSelectedTechId(null)} />
    </>
  )
}

export function ResearchTab() {
  const openModal = useGameStore((state) => state.openModal)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base uppercase tracking-[0.16em]">Research</CardTitle>
          <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Grouped research graphs for sectors, staffing, automation, power, and institutions</CardDescription>
        </div>
        <Button size="icon" variant="outline" className="size-8 rounded-md border-border/80 bg-background/60 text-muted-foreground" title="Open larger research view" onClick={() => openModal('researchMap')}>
          <Expand className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
        <ResearchTreeContent />
      </CardContent>
    </Card>
  )
}
