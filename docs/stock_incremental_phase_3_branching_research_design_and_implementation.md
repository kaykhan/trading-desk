# Stock Incremental Game — Phase 3 Design Document and Implementation Details

## Scope
This document covers **Phase 3 — Branching Research Tree Expansion**.

It combines:
1. **Design document**
2. **Implementation/specification sheet**
3. **Code-ready structural examples**

Phase 3 introduces a lightweight but expandable research tree that acts as the capability backbone for later systems.

This phase is not intended to deliver the final giant research tree. Instead, it should deliver the minimum branching structure required to support:
- sector unlocks
- training course unlocks
- advanced system unlocks
- later bot strategy prerequisites
- later GPU infrastructure prerequisites
- lobbying unlocks

This phase should be treated as infrastructure, not late-game polish.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 3 Goal
The goal of Phase 3 is to turn Research from a simple list of purchases into a **structured unlock system** with branches and prerequisites.

Research is now one of the game’s main progression engines.

It is responsible for unlocking capabilities such as:
- market sectors
- advanced automation
- power-related systems
- institutional / regulatory systems
- training systems used in later phases

### Core design philosophy
Build the smallest research tree that can support the rest of the game cleanly.

This means:
- a few branches
- a few key tech nodes
- clear prerequisite logic
- obvious branch identities

Not:
- dozens of nodes
- giant sprawling trees
- heavy visual complexity in the first pass

---

## 2. Why Research Must Exist Now
Research can no longer be treated as a late polish system because multiple approved features now depend on it.

Research is now responsible for unlocking:
- Technology and Energy sectors
- Algorithmic Trading
- Power Systems Engineering
- Regulatory Affairs / Lobbying
- future trader training
- future bot strategy training
- future GPU training infrastructure

Without a structured research system, all of those unlocks become temporary special cases.

That would create unnecessary rework later.

---

## 3. Research Tree Design Principles
The first implementation should follow these rules:

### Rule 1 — Small number of branches
Use only a few clear branches.

### Rule 2 — Clear purpose per branch
Each branch should have an obvious identity.

### Rule 3 — Unlocks before optimisations
The first version should focus on unlocks and enabling later systems, not endless optimization nodes.

### Rule 4 — Readable progression
The player should understand:
- what is available now
- what is locked
- what unlocks what

### Rule 5 — Expandable later
The data structure should support a much larger tree later without needing redesign.

---

## 4. Recommended Initial Research Branches
The first version should use four branches.

### Markets / Sectors
Purpose:
- unlocks standard market sectors

### Human Capital
Purpose:
- unlocks trader training programs and human development systems later

### Automation
Purpose:
- unlocks bot systems and machine-side progression

### Regulation / Institutions
Purpose:
- unlocks policy capability and later institutional systems

This is enough structure to support future depth without making the tree overwhelming.

---

## 5. Branch Identities
### Markets / Sectors
This branch expands where the firm can trade.

Examples:
- Technology Markets
- Energy Markets
- Healthcare Markets later

### Human Capital
This branch expands what people in the firm can become.

Examples:
- Options Training
- Value Investing Program
- Sector Analyst Certification later

### Automation
This branch expands what machines and advanced systems can do.

Examples:
- Algorithmic Trading
- Power Systems Engineering
- bot strategy unlocks later
- GPU training later

### Regulation / Institutions
This branch expands how the firm interacts with institutions and the wider system.

Examples:
- Regulatory Affairs
- future compliance tools
- future institutional access techs

---

## 6. Recommended Initial Research Nodes
The first implementation should include only a small essential node set.

### Markets / Sectors
- **Technology Markets**
- **Energy Markets**

### Human Capital
- **Foundations of Finance Training**
  - first structural placeholder for future specialization systems

### Automation
- **Algorithmic Trading**
- **Power Systems Engineering**

### Regulation / Institutions
- **Regulatory Affairs**

This is enough to support the next phases without overbuilding.

---

## 7. Unlock Responsibilities in Phase 3
### Technology Markets
Unlocks the Technology sector.

### Energy Markets
Unlocks the Energy sector.

### Algorithmic Trading
Unlocks the bot-side machine progression path.

### Power Systems Engineering
Unlocks Power Infrastructure.

### Regulatory Affairs
Unlocks Lobbying.

### Foundations of Finance Training
Does not need to immediately create full specialization behavior, but should establish the Human Capital branch and can act as a future prerequisite.

This gives the tree immediate utility while also preparing later systems.

---

## 8. Research Points Role in Phase 3
Research Points remain the spend currency for tech nodes.

### Rule
Research Points should now be spent on:
- branch unlock nodes
- major system unlocks
- early structural training techs

Phase 3 is still not the time to flood the system with many tiny Research Point sinks.

---

## 9. Research UI Philosophy
The Research tab should now visually communicate:
- branches
- unlocked vs locked nodes
- prerequisites
- Research Point costs
- current Research Points balance

### Important constraint
The first version should prioritize clarity over visual flourish.

Simple grouped cards are better than a complicated node graph if the graph is not yet necessary.

---

## 10. Recommended Research UI Structure
For Phase 3, the Research tab should have two major sections:

### Research Production
- Research Points total
- Research Points/sec
- Research Computer Scientist purchases
- research production support upgrades if already implemented

### Research Tree
Grouped by branch:
- Markets / Sectors
- Human Capital
- Automation
- Regulation / Institutions

Each branch should list its nodes with clear purchase state and prerequisites.

This is the cleanest first version.

---

## 11. Why Grouped Branch Cards Beat a Graph First
A graph-style tree can look impressive, but it adds implementation cost and UI complexity.

For the first version, grouped branch sections are better because they:
- are easier to read
- are easier to build
- are easier to expand later
- still support prerequisites cleanly

A graph can always be added later once the tree is larger.

---

# PART II — IMPLEMENTATION / SPECIFICATION SHEET

## 12. Research Tech Data Model
Add a structured tech definition model.

Suggested types:

```ts
export type ResearchBranchId =
  | 'markets'
  | 'humanCapital'
  | 'automation'
  | 'regulation';

export type ResearchTechId =
  | 'technologyMarkets'
  | 'energyMarkets'
  | 'foundationsOfFinanceTraining'
  | 'algorithmicTrading'
  | 'serverRackSystems'
  | 'regulatoryAffairs';

type ResearchTechDefinition = {
  id: ResearchTechId;
  name: string;
  branch: ResearchBranchId;
  researchCost: number;
  description: string;
  prerequisites?: ResearchTechId[];
};
```

This model supports future expansion without redesign.

---

## 13. Initial Tech Definitions
Suggested initial data:

```ts
export const RESEARCH_TECHS: Record<ResearchTechId, ResearchTechDefinition> = {
  technologyMarkets: {
    id: 'technologyMarkets',
    name: 'Technology Markets',
    branch: 'markets',
    researchCost: 50,
    description: 'Unlock the Technology sector.',
  },
  energyMarkets: {
    id: 'energyMarkets',
    name: 'Energy Markets',
    branch: 'markets',
    researchCost: 75,
    description: 'Unlock the Energy sector.',
  },
  foundationsOfFinanceTraining: {
    id: 'foundationsOfFinanceTraining',
    name: 'Foundations of Finance Training',
    branch: 'humanCapital',
    researchCost: 60,
    description: 'Establish the Human Capital branch and unlock future training prerequisites.',
  },
  algorithmicTrading: {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    branch: 'automation',
    researchCost: 100,
    description: 'Unlock bot-side automation systems.',
  },
  serverRackSystems: {
    id: 'serverRackSystems',
    name: 'Power Systems Engineering',
    branch: 'automation',
    researchCost: 150,
    description: 'Unlock Power Infrastructure.',
    prerequisites: ['algorithmicTrading'],
  },
  regulatoryAffairs: {
    id: 'regulatoryAffairs',
    name: 'Regulatory Affairs',
    branch: 'regulation',
    researchCost: 250,
    description: 'Unlock the Lobbying tab and institutional policy systems.',
  },
};
```

These are starting costs and should be tuned later.

---

## 14. GameState Additions
Suggested state additions:

```ts
purchasedResearchTech: Record<ResearchTechId, boolean>;
```

If the current build already has a generic research purchase map, Phase 3 should migrate to or formalize it with typed tech IDs.

---

## 15. Derived Unlock Rules
The following unlocks should now be derived from purchased tech.

### Sector unlocks
```ts
technology sector unlocked if purchasedResearchTech['technologyMarkets']
energy sector unlocked if purchasedResearchTech['energyMarkets']
```

### Automation unlocks
```ts
bots unlocked if purchasedResearchTech['algorithmicTrading']
power infrastructure unlocked if purchasedResearchTech['serverRackSystems']
```

### Lobbying unlock
```ts
lobbying unlocked if purchasedResearchTech['regulatoryAffairs']
```

This is now the preferred system-unlock model.

---

## 16. Helper Functions
Add helper functions such as:

```ts
isResearchTechPurchased(state, techId)
areResearchTechPrerequisitesMet(state, techId)
canBuyResearchTech(state, techId)
getAvailableResearchTechsByBranch(state, branchId)
```

Suggested logic:

```ts
function areResearchTechPrerequisitesMet(state, techId) {
  const tech = RESEARCH_TECHS[techId];
  const prereqs = tech.prerequisites ?? [];
  return prereqs.every((prereq) => state.purchasedResearchTech[prereq] === true);
}
```

---

## 17. Purchase Action
Add or patch a Research purchase action:

```ts
buyResearchTech(techId)
```

Behavior:
- ensure tech is not already purchased
- ensure Research Points are sufficient
- ensure prerequisites are met
- subtract Research Points
- mark tech as purchased

This is the core purchase action for the tree.

---

## 18. Suggested Store Action Example
```ts
export function buyResearchTech(state: GameState, techId: ResearchTechId): GameState {
  const tech = RESEARCH_TECHS[techId];
  if (!tech) return state;
  if (state.purchasedResearchTech[techId]) return state;
  if (state.researchPoints < tech.researchCost) return state;

  const prereqs = tech.prerequisites ?? [];
  const missingPrereq = prereqs.some((prereq) => !state.purchasedResearchTech[prereq]);
  if (missingPrereq) return state;

  return {
    ...state,
    researchPoints: state.researchPoints - tech.researchCost,
    purchasedResearchTech: {
      ...state.purchasedResearchTech,
      [techId]: true,
    },
  };
}
```

---

## 19. Save / Load Requirements
The save model must include:

```ts
purchasedResearchTech
```

### Migration default for older saves
If missing:

```ts
purchasedResearchTech = {}
```

This ensures clean compatibility.

---

## 20. UI Requirements
The Research tab should now show:

### Top production strip
- Research Points
- Research Points/sec
- Research staff summary

### Branch groups
Each branch should be a visible grouped section containing its tech cards.

Each tech card should show:
- tech name
- cost
- description
- locked / available / purchased state
- unmet prerequisite text if relevant
- purchase button

This is the minimum UI needed to support Phase 3 cleanly.

---

## 21. Recommended Branch Display Order
Recommended order in UI:
1. Markets / Sectors
2. Human Capital
3. Automation
4. Regulation / Institutions

This order matches the player’s likely progression.

---

## 22. Card State Rules
Each research node should visually indicate one of four states:

### Purchased
Already bought.

### Available
Prerequisites met and enough RP can be earned/spent.

### Locked by prerequisite
Prerequisites not yet met.

### Unaffordable
Available in principle, but not enough Research Points currently.

These states should be clearly distinguishable.

---

# PART III — CODE-READY EXAMPLES

## 23. Type Definitions
```ts
// types/research.ts

export type ResearchBranchId =
  | 'markets'
  | 'humanCapital'
  | 'automation'
  | 'regulation';

export type ResearchTechId =
  | 'technologyMarkets'
  | 'energyMarkets'
  | 'foundationsOfFinanceTraining'
  | 'algorithmicTrading'
  | 'serverRackSystems'
  | 'regulatoryAffairs';

export type ResearchTechDefinition = {
  id: ResearchTechId;
  name: string;
  branch: ResearchBranchId;
  researchCost: number;
  description: string;
  prerequisites?: ResearchTechId[];
};
```

---

## 24. Research Data File
```ts
// data/researchTech.ts

import type { ResearchTechDefinition, ResearchTechId } from '../types/research';

export const RESEARCH_TECHS: Record<ResearchTechId, ResearchTechDefinition> = {
  technologyMarkets: {
    id: 'technologyMarkets',
    name: 'Technology Markets',
    branch: 'markets',
    researchCost: 50,
    description: 'Unlock the Technology sector.',
  },
  energyMarkets: {
    id: 'energyMarkets',
    name: 'Energy Markets',
    branch: 'markets',
    researchCost: 75,
    description: 'Unlock the Energy sector.',
  },
  foundationsOfFinanceTraining: {
    id: 'foundationsOfFinanceTraining',
    name: 'Foundations of Finance Training',
    branch: 'humanCapital',
    researchCost: 60,
    description: 'Establish future human training and specialization prerequisites.',
  },
  algorithmicTrading: {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    branch: 'automation',
    researchCost: 100,
    description: 'Unlock bot-side automation systems.',
  },
  serverRackSystems: {
    id: 'serverRackSystems',
    name: 'Power Systems Engineering',
    branch: 'automation',
    researchCost: 150,
    description: 'Unlock Power Infrastructure.',
    prerequisites: ['algorithmicTrading'],
  },
  regulatoryAffairs: {
    id: 'regulatoryAffairs',
    name: 'Regulatory Affairs',
    branch: 'regulation',
    researchCost: 250,
    description: 'Unlock the Lobbying tab.',
  },
};
```

---

## 25. GameState Patch
```ts
// types/game.ts

import type { ResearchTechId } from './research';

export type GameState = {
  researchPoints: number;
  researchComputerScientistCount: number;
  purchasedResearchTech: Record<ResearchTechId, boolean>;

  // existing fields...
};
```

---

## 26. Selectors
```ts
// utils/research.ts

import type { GameState } from '../types/game';
import type { ResearchBranchId, ResearchTechId } from '../types/research';
import { RESEARCH_TECHS } from '../data/researchTech';

export function isResearchTechPurchased(state: GameState, techId: ResearchTechId): boolean {
  return state.purchasedResearchTech[techId] === true;
}

export function areResearchTechPrerequisitesMet(
  state: GameState,
  techId: ResearchTechId
): boolean {
  const tech = RESEARCH_TECHS[techId];
  const prereqs = tech.prerequisites ?? [];
  return prereqs.every((prereq) => state.purchasedResearchTech[prereq] === true);
}

export function canBuyResearchTech(state: GameState, techId: ResearchTechId): boolean {
  const tech = RESEARCH_TECHS[techId];
  if (!tech) return false;
  if (state.purchasedResearchTech[techId]) return false;
  if (state.researchPoints < tech.researchCost) return false;
  return areResearchTechPrerequisitesMet(state, techId);
}

export function getResearchTechsByBranch(branch: ResearchBranchId) {
  return Object.values(RESEARCH_TECHS).filter((tech) => tech.branch === branch);
}
```

---

## 27. Unlock Selectors
```ts
// selectors/systemUnlocks.ts

import type { GameState } from '../types/game';

export function isTechnologySectorUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech['technologyMarkets'] === true;
}

export function isEnergySectorUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech['energyMarkets'] === true;
}

export function isAutomationUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech['algorithmicTrading'] === true;
}

export function isPowerInfrastructureUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech['serverRackSystems'] === true;
}

export function isLobbyingUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech['regulatoryAffairs'] === true;
}
```

---

## 28. UI Example Component
```tsx
// components/ResearchBranchSection.tsx

import type { ResearchTechDefinition, ResearchTechId } from '../types/research';

type ResearchBranchSectionProps = {
  title: string;
  techs: ResearchTechDefinition[];
  purchased: Record<string, boolean>;
  canBuy: (techId: ResearchTechId) => boolean;
  onBuy: (techId: ResearchTechId) => void;
};

export function ResearchBranchSection({
  title,
  techs,
  purchased,
  canBuy,
  onBuy,
}: ResearchBranchSectionProps) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="space-y-3">
        {techs.map((tech) => {
          const isPurchased = purchased[tech.id] === true;
          const isAvailable = canBuy(tech.id);

          return (
            <div key={tech.id} className="rounded border border-slate-800 bg-slate-950 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-slate-100">{tech.name}</span>
                <span className="text-xs text-slate-400">{tech.researchCost} RP</span>
              </div>
              <p className="mb-2 text-xs text-slate-400">{tech.description}</p>
              <button
                disabled={!isAvailable || isPurchased}
                onClick={() => onBuy(tech.id)}
                className="rounded bg-cyan-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {isPurchased ? 'Purchased' : isAvailable ? 'Research' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 29. Recommended Implementation Order
### Step 1
Add branch and tech type definitions.

### Step 2
Add `purchasedResearchTech` to state and initial state.

### Step 3
Create the research tech definitions file.

### Step 4
Add helper functions for prerequisite checking and purchase validation.

### Step 5
Implement `buyResearchTech(techId)`.

### Step 6
Patch sector/bot/power/lobbying unlock logic to use research tech selectors.

### Step 7
Build grouped branch UI in the Research tab.

### Step 8
Test progression and readability.

---

## 30. Testing Checklist
Phase 3 should be considered successful if:
- the player can understand branch identities
- techs correctly lock and unlock by prerequisite
- Research Points are spent correctly
- sector unlocks now flow through research
- bot/power/lobbying unlocks now flow through research
- the Research tab feels more structured without becoming overwhelming

---

## 31. Final Summary
Phase 3 adds the first real branching structure to Research.

### Final approved Phase 3 rule
**Research becomes the structured unlock backbone for sectors, automation, power, institutions, and later training systems.**

This phase should remain intentionally lightweight, but it must be solid enough that future systems can depend on it cleanly.

This document should be treated as the design and implementation source of truth for Phase 3: Branching Research Tree Expansion.

