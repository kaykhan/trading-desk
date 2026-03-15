import { memo, useMemo, useState } from 'react'
import { BrainCircuit, Cpu, Expand, TrendingUp } from 'lucide-react'
import { Background, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { RESEARCH_TECH } from '@/data/researchTech'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { ResearchTechId, UpgradeId } from '@/types/game'
import { formatCurrency, formatPlainRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SummaryTile } from './DashboardPrimitives'

type ResearchNodeId = UpgradeId | ResearchTechId

type ResearchNodeDefinition = {
  id: ResearchNodeId
  kind: 'upgrade' | 'tech'
  x: number
  y: number
  title: string
  description: string
  costLabel: string
}

type ResearchGraphData = {
  id: ResearchNodeId
  title: string
  kind: 'upgrade' | 'tech'
  costLabel: string
  status: string
  isPurchased: boolean
  isLocked: boolean
  isReady: boolean
  isSelected: boolean
  onPurchase: () => void
}

const RESEARCH_TREE: ResearchNodeDefinition[] = [
  { id: 'juniorHiringProgram', kind: 'upgrade', x: 20, y: 150, title: 'Junior Hiring Program', description: 'Open the first staffing lane for traders and scientists.', costLabel: '$50' },
  { id: 'tradeMultiplier', kind: 'upgrade', x: 20, y: 340, title: 'Trade Multiplier', description: 'Lift firm-wide profit output by 25 percent.', costLabel: '$1,000' },
  { id: 'seniorScientists', kind: 'tech', x: 255, y: 45, title: 'Senior Scientists', description: 'Unlock the second research staffing tier.', costLabel: '160 RP' },
  { id: 'seniorRecruitment', kind: 'upgrade', x: 255, y: 150, title: 'Senior Recruitment', description: 'Open the senior trader lane for the desk.', costLabel: '$10,000' },
  { id: 'bullMarket', kind: 'upgrade', x: 255, y: 340, title: 'Bull Market', description: 'Push firm-wide profits higher with a larger market bonus.', costLabel: '$8,000' },
  { id: 'algorithmicTrading', kind: 'tech', x: 500, y: 150, title: 'Algorithmic Trading', description: 'Unlock Trading Bots and the automation era.', costLabel: '100 RP' },
  { id: 'powerSystemsEngineering', kind: 'tech', x: 745, y: 150, title: 'Power Systems Engineering', description: 'Open infrastructure support for machine systems.', costLabel: '150 RP' },
  { id: 'tradingServers', kind: 'tech', x: 990, y: 45, title: 'Trading Servers', description: 'Unlock the heavy machine tier after Data Centre research.', costLabel: '450 RP' },
  { id: 'dataCenterSystems', kind: 'tech', x: 990, y: 150, title: 'Data Centre Systems', description: 'Unlock Data Centres for dense infrastructure scaling.', costLabel: '325 RP' },
  { id: 'regulatoryAffairs', kind: 'tech', x: 990, y: 255, title: 'Regulatory Affairs', description: 'Unlock lobbying and institutional policy strategy.', costLabel: '250 RP' },
]

const TREE_CONNECTIONS: Array<{ from: ResearchNodeId; to: ResearchNodeId }> = [
  { from: 'juniorHiringProgram', to: 'seniorScientists' },
  { from: 'juniorHiringProgram', to: 'seniorRecruitment' },
  { from: 'tradeMultiplier', to: 'bullMarket' },
  { from: 'seniorRecruitment', to: 'algorithmicTrading' },
  { from: 'algorithmicTrading', to: 'powerSystemsEngineering' },
  { from: 'powerSystemsEngineering', to: 'dataCenterSystems' },
  { from: 'dataCenterSystems', to: 'tradingServers' },
  { from: 'powerSystemsEngineering', to: 'regulatoryAffairs' },
]

function getUpgradeLockedReason(upgradeId: UpgradeId, state: ReturnType<typeof useGameStore.getState>) {
  if (upgradeId === 'seniorRecruitment') {
    return `Requires 5 Junior Traders (${state.juniorTraderCount}/5).`
  }

  if (upgradeId === 'bullMarket') {
    return 'Requires Trade Multiplier first.'
  }

  return 'Research this earlier node first.'
}

function getTechLockedReason(techId: ResearchTechId, state: ReturnType<typeof useGameStore.getState>) {
  if (techId === 'algorithmicTrading') {
    return `Requires 5 Senior Traders (${state.seniorTraderCount}/5).`
  }

  if (techId === 'seniorScientists') {
    return `Requires 5 Junior Scientists (${state.juniorResearchScientistCount}/5) or deeper research reserves.`
  }

  if (techId === 'powerSystemsEngineering') {
    return 'Requires Algorithmic Trading first.'
  }

  if (techId === 'dataCenterSystems') {
    return `Requires Power Systems Engineering and 5 Trading Bots (${state.tradingBotCount}/5).`
  }

  if (techId === 'tradingServers') {
    return `Requires Data Centre Systems and 5 Trading Bots (${state.tradingBotCount}/5).`
  }

  if (techId === 'regulatoryAffairs') {
    return 'Requires Power Systems Engineering first.'
  }

  return 'Research this earlier node first.'
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
    <div className={`w-[185px] cursor-pointer rounded-lg border px-2.5 py-2 shadow-sm transition ${tone} ${data.isSelected ? 'ring-1 ring-primary/80' : ''}`}>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-border/80" />
      <div>
        <p className="text-[8px] uppercase tracking-[0.16em] text-primary">{data.kind === 'tech' ? 'Research Tech' : 'Research Unlock'}</p>
        <h3 className="mt-1 text-[12px] font-semibold leading-4">{data.title}</h3>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary">{data.costLabel}</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.12em]">{data.status}</p>
        </div>
        <button
          type="button"
          className={data.isReady && !data.isPurchased ? 'rounded-md border border-primary/40 bg-primary/15 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-primary' : 'rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground'}
          disabled={!data.isReady || data.isPurchased}
          onClick={(event) => {
            event.stopPropagation()
            data.onPurchase()
          }}
        >
          {data.isPurchased ? 'Done' : data.isReady ? 'Research' : 'View'}
        </button>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-border/80" />
    </div>
  )
})

const nodeTypes = { researchNode: ResearchFlowNode }

export function ResearchTreeContent({ expanded = false }: { expanded?: boolean }) {
  const gameState = useGameStore((state) => state)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const buyResearchTech = useGameStore((state) => state.buyResearchTech)
  const researchPoints = useGameStore(selectors.researchPoints)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const [selectedNodeId, setSelectedNodeId] = useState<ResearchNodeId>('juniorHiringProgram')

  const purchasedTechCount = RESEARCH_TECH.filter((tech) => gameState.purchasedResearchTech[tech.id]).length
  const selectedNode = RESEARCH_TREE.find((node) => node.id === selectedNodeId) ?? RESEARCH_TREE[0]

  const nodeStates = useMemo(() => {
    return Object.fromEntries(
      RESEARCH_TREE.map((node) => {
        if (node.kind === 'upgrade') {
          const isPurchased = selectors.isUpgradePurchased(node.id as UpgradeId)(gameState)
          const visible = selectors.isUpgradeVisible(node.id as UpgradeId)(gameState)
          const shortfall = selectors.upgradeCashShortfall(node.id as UpgradeId)(gameState)
          return [node.id, {
            isPurchased,
            visible,
            isReady: visible && shortfall <= 0,
            canAfford: selectors.canAffordUpgrade(node.id as UpgradeId)(gameState),
            status: isPurchased ? 'Unlocked' : !visible ? 'Locked' : shortfall > 0 ? 'Need cash' : 'Ready',
            shortfallText: !isPurchased ? (!visible ? getUpgradeLockedReason(node.id as UpgradeId, gameState) : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined,
          }]
        }

        const isPurchased = selectors.isResearchTechPurchased(node.id as ResearchTechId)(gameState)
        const visible = selectors.isResearchTechVisible(node.id as ResearchTechId)(gameState)
        const shortfall = selectors.researchTechShortfall(node.id as ResearchTechId)(gameState)
        return [node.id, {
          isPurchased,
          visible,
          isReady: visible && shortfall <= 0,
          canAfford: selectors.canAffordResearchTech(node.id as ResearchTechId)(gameState),
          status: isPurchased ? 'Unlocked' : !visible ? 'Locked' : shortfall > 0 ? 'Need RP' : 'Ready',
          shortfallText: !isPurchased ? (!visible ? getTechLockedReason(node.id as ResearchTechId, gameState) : shortfall > 0 ? `Need ${Math.ceil(shortfall)} more RP.` : undefined) : undefined,
        }]
      }),
    ) as Record<ResearchNodeId, { isPurchased: boolean; visible: boolean; isReady: boolean; canAfford: boolean; status: string; shortfallText?: string }>
  }, [gameState])

  const flowNodes = useMemo<Node<ResearchGraphData>[]>(() => {
    return RESEARCH_TREE.map((node) => {
      const state = nodeStates[node.id]

      return {
        id: node.id,
        type: 'researchNode',
        position: { x: node.x, y: node.y },
        draggable: false,
        selectable: false,
        data: {
          id: node.id,
          title: node.title,
          kind: node.kind,
          costLabel: node.costLabel,
          status: state.status,
          isPurchased: state.isPurchased,
          isLocked: !state.visible,
          isReady: state.canAfford && !state.isPurchased,
          isSelected: selectedNodeId === node.id,
          onPurchase: () => {
            setSelectedNodeId(node.id)

            if (state.isPurchased || !state.canAfford) {
              return
            }

            if (node.kind === 'upgrade') {
              buyUpgrade(node.id as UpgradeId)
              return
            }

            buyResearchTech(node.id as ResearchTechId)
          },
        },
      }
    })
  }, [buyResearchTech, buyUpgrade, nodeStates, selectedNodeId])

  const flowEdges = useMemo<Edge[]>(() => {
    return TREE_CONNECTIONS.map((connection) => ({
      id: `${connection.from}-${connection.to}`,
      source: connection.from,
      target: connection.to,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: nodeStates[connection.from].isPurchased ? '#ffdd33' : '#666666' },
      style: {
        stroke: nodeStates[connection.from].isPurchased ? '#ffdd33' : '#666666',
        strokeWidth: 1.6,
      },
    }))
  }, [nodeStates])

  const selectedNodeState = nodeStates[selectedNode.id]

  return (
    <>
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Research Points" value={Math.floor(researchPoints).toLocaleString()} icon={BrainCircuit} />
          <SummaryTile label="Research / Sec" value={formatPlainRate(researchPointsPerSecond)} icon={TrendingUp} />
          <SummaryTile label="Tech Unlocked" value={`${purchasedTechCount}/${RESEARCH_TECH.length}`} icon={Cpu} />
        </div>

        <Card className="rounded-xl border-border/80 bg-background/50">
          <CardContent className="p-0">
            <div className={`${expanded ? 'h-[72vh]' : 'h-[440px]'} w-full overflow-hidden rounded-xl`}>
              <ReactFlow
                fitView
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                onNodeClick={(_, node) => setSelectedNodeId(node.id as ResearchNodeId)}
                zoomOnDoubleClick={false}
                selectNodesOnDrag={false}
                minZoom={expanded ? 0.4 : 0.6}
                maxZoom={1.2}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="rgba(90,90,90,0.25)" gap={22} size={1} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/80 bg-background/50">
          <CardContent className="grid gap-2 p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_auto] md:items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Selected node</p>
              <h3 className="mt-1 text-sm font-semibold text-foreground">{selectedNode.title}</h3>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{selectedNode.description}</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Cost</span>
                <span className="font-mono text-primary">{selectedNode.costLabel}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-mono text-primary">{selectedNodeState.status}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px] text-muted-foreground md:col-span-2">
              {selectedNodeState.shortfallText ?? 'Click a node or use its inline button to research it when ready.'}
            </div>

            <button
              type="button"
              className={selectedNodeState.canAfford && !selectedNodeState.isPurchased ? 'w-full rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-primary transition hover:bg-primary/20 md:w-auto' : 'w-full rounded-md border border-border/70 bg-background/50 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground md:w-auto'}
              disabled={!selectedNodeState.canAfford || selectedNodeState.isPurchased}
              onClick={() => {
                if (selectedNodeState.isPurchased || !selectedNodeState.canAfford) {
                  return
                }

                if (selectedNode.kind === 'upgrade') {
                  buyUpgrade(selectedNode.id as UpgradeId)
                  return
                }

                buyResearchTech(selectedNode.id as ResearchTechId)
              }}
            >
              {selectedNodeState.isPurchased ? 'Unlocked' : selectedNodeState.canAfford ? 'Research selected node' : 'Locked'}
            </button>
          </CardContent>
        </Card>
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
          <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Dependency tree for staffing, systems, infrastructure, and policy unlocks</CardDescription>
        </div>
        <Button size="icon" variant="outline" className="size-8 rounded-md border-border/80 bg-background/60 text-muted-foreground" title="Open larger research map" onClick={() => openModal('researchMap')}>
          <Expand className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <ResearchTreeContent />
      </CardContent>
    </Card>
  )
}
