# Stock Incremental Game — Phase 13 Design Document and Implementation Planning

## Scope
This document defines **Phase 13 — Milestones**.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **UI and progression notes**

Phase 13 formalizes Milestones as collectible progression objects that:
- guide the player through the intended order of play
- act as structured medium-term goals
- reward exploration of systems in the right sequence
- later map naturally to platform achievements such as Steam achievements

This phase is the final progression-structure layer for the current roadmap.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 13 Goal
The goal of Phase 13 is to make the player always feel like they know what to aim for next.

By this point the game has many systems:
- sectors
- research
- institutions
- automation
- compliance
- lobbying
- boosts
- prestige
- optimisations

Milestones should now provide:
- structure
- pacing guidance
- celebration
- system discovery
- achievement-style collection

### Core design philosophy
Milestones should not just be passive badges.
They should act as **the recommended path through the game**.

---

## 2. Milestones as Objects
Milestones should be treated as collectible progression objects, not just text entries in a checklist.

### Approved rule
Each milestone is a discrete object/card with:
- a name
- a description
- a completion condition
- a completion state
- optional reward metadata
- future platform achievement mapping potential

This gives milestones a much stronger identity.

---

## 3. Milestones as Guidance
Milestones should guide the player toward the intended optimal order of play.

That means milestones should help answer questions like:
- what should I buy next?
- what system should I unlock next?
- am I ready for research yet?
- should I be moving toward automation now?
- when should I think about prestige?

This is one of the most important roles of the milestone system.

---

## 4. Milestones as Achievement Foundations
You mentioned that milestones will later be used to unlock Steam achievements.

That is a very strong direction.

### Approved design rule
Milestones should be designed now in a way that later makes them easy to map to platform achievements.

This means:
- they should have stable IDs
- they should be discrete and trackable
- they should represent meaningful gameplay progression

The system should leave room for some milestones to become achievement-linked later.

---

## 5. Milestone UI Philosophy
Milestones should feel collectible and visible.

### Approved behavior
The Milestones card in the main UI should be clickable.

When clicked, it opens a modal similar in importance to Market News, but showing milestone content instead.

### The modal should show
- unlocked milestones
- future milestones
- a structured visual card layout

This is now the intended UX.

---

## 6. Milestone Modal Layout
### Approved layout
Open a modal that shows milestone cards in a **4x4 grid** per view/page/state.

This means the player sees milestones as a proper collection board rather than a plain vertical list.

### Why this is good
- feels collectible
- supports scanning
- works well for locked/unlocked contrast
- can scale over time with pages, categories, or scrolling

This is the preferred layout direction.

---

## 7. What the Milestone Modal Should Show
Each milestone card should show:
- milestone name
- short description
- unlocked / locked state
- progress if partial progress is relevant
- optional category or stage marker

### Locked milestone behavior
Locked/future milestones should still be visible unless intentionally hidden for surprise.

### Recommendation
Most future milestones should be visible, because they help guide the player.

This supports the system’s role as a progression roadmap.

---

## 8. Milestones Should Reflect the Intended Game Order
Milestones should not be random.

They should be curated to reflect how you want the player to progress.

### Example
If the intended order is:
- hire interns
- hire juniors
- unlock research
- build sectors
- unlock automation

Then the milestone list should reinforce that sequence.

This is the key principle that makes milestones educational rather than decorative.

---

## 9. Types of Milestones
The milestone system should mix:

### Simple count milestones
Examples:
- own 5 Junior Traders
- own 1 Senior Trader
- own 1 Rule-Based Bot

### System unlock milestones
Examples:
- unlock Research
- unlock Technology sector
- unlock Lobbying

### Progression milestones
Examples:
- complete first Prestige
- unlock first specialization
- complete first compliance review

### Build-shaping milestones
Examples:
- assign a specialist to the correct sector
- activate first automation strategy
- purchase first lobbying policy

This mix is ideal.

---

## 10. Milestones Should Be Fun, Not Just Functional
You mentioned examples like unlocking 5 Juniors.
That is exactly the right tone.

Milestones should feel:
- achievable
- satisfying
- thematic
- clarifying

They do not all need to be ultra-serious or ultra-hard.

---

## 11. Recommended Milestone Categories
The first implementation should use milestone categories internally, even if the first UI view is a flat grid.

Suggested categories:
- **Getting Started**
- **Trading Desk**
- **Research**
- **Markets & Sectors**
- **Institutions**
- **Automation**
- **Compliance & Lobbying**
- **Prestige**

This will help later filtering and platform mapping.

---

## 12. Visibility Philosophy
### Recommendation
Most milestones should be visible from the start once the milestone system is unlocked or available in UI.

### Why
Because the player should use the milestone board as a guide.

Some very late or surprise milestones can be hidden later if desired, but that should be the exception, not the rule.

---

## 13. Rewards Philosophy
Milestones can later grant rewards, but the first implementation does not need to overcomplicate this.

### Recommended first-pass reward model
Milestones primarily provide:
- guidance
- completion tracking
- celebration

Optional later reward types:
- small cash bonus
- RP bonus
- Influence bonus
- cosmetic unlock
- achievement sync

These can be layered in later.

---

## 14. First-Pass Milestone Set Direction
The first implementation should include enough milestones to guide the player through the major progression beats.

### Recommendation
Start with roughly **24–40 milestones** total.

That is enough to make the board meaningful without becoming unwieldy immediately.

Since the UI uses a 4x4 grid, a nice first-pass structure would be:
- 2 to 3 pages of 16 cards
or
- one scrollable board with category grouping later

---

## 15. Example Milestones
### Getting Started
- Make your first trade
- Hire your first Intern
- Hire 5 Interns
- Hire your first Junior Trader
- Hire 5 Junior Traders
- Hire your first Senior Trader

### Research
- Unlock Research
- Hire your first Junior Scientist
- Earn 100 RP
- Unlock your first research node

### Markets & Sectors
- Unlock your first sector beyond Finance
- Assign your first trader to a sector
- Fill your first sector allocation

### Institutions
- Build your first Prop Desk
- Apply your first institutional mandate

### Automation
- Unlock automation
- Buy your first Quant Trader
- Buy your first Rule-Based Bot
- Activate your first automation strategy

### Compliance & Lobbying
- Trigger your first compliance review
- Pay your first compliance bill
- Unlock Lobbying
- Purchase your first policy

### Prestige
- Complete your first Prestige
- Reach Bronze Prestige
- Spend your first Reputation point

These examples are very close to the intended style.

---

## 16. Milestones Card in Main UI
The main UI should have a Milestones card/object.

### Approved behavior
It shows at least:
- total unlocked milestone count
- maybe the next recommended milestone
- clickable interaction to open the Milestones modal

This makes the system easy to access and keeps it top-of-mind.

---

## 17. Final Design Summary for Phase 13
### Final approved Phase 13 rule
**Milestones are collectible progression objects shown through a clickable Milestones card and a 4x4 card-grid modal, designed to guide the player through the intended order of play and later support achievement systems.**

This is the intended role of the milestone system.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 18. Type Definitions
Suggested types:

```ts
export type MilestoneCategoryId =
  | 'gettingStarted'
  | 'tradingDesk'
  | 'research'
  | 'marketsSectors'
  | 'institutions'
  | 'automation'
  | 'complianceLobbying'
  | 'prestige';

export type MilestoneId = string;
```

Suggested milestone definition shape:

```ts
type MilestoneDefinition = {
  id: MilestoneId;
  category: MilestoneCategoryId;
  name: string;
  description: string;
  isHidden?: boolean;
  achievementKey?: string;
};
```

### Important note
`achievementKey` should be optional for future Steam/platform mapping.

---

## 19. GameState Additions
Suggested state additions:

```ts
unlockedMilestones: Record<MilestoneId, boolean>;
milestoneModalOpen: boolean;
```

Optional future enhancement:

```ts
milestoneProgress?: Record<MilestoneId, number>;
```

This is useful if some milestones track visible partial progress in the UI.

---

## 20. Milestone Definition Model
Milestones should be evaluated from the current game state.

Suggested helper structure:

```ts
type MilestoneRule = {
  id: MilestoneId;
  check: (state: GameState) => boolean;
};
```

### Recommended design
Store:
- human-readable milestone definitions
- milestone completion rules separately or together in one registry

This will keep the system maintainable.

---

## 21. Suggested First-Pass Milestone IDs
Examples:

```ts
firstTrade
firstIntern
fiveInterns
firstJuniorTrader
fiveJuniorTraders
firstSeniorTrader
unlockResearch
firstJuniorScientist
firstResearchNode
unlockTechnologySector
firstSectorAssignment
firstPropDesk
firstMandate
unlockAutomation
firstQuantTrader
firstRuleBasedBot
firstAutomationStrategy
firstComplianceReview
firstCompliancePayment
unlockLobbying
firstLobbyingPolicy
firstPrestige
firstReputationSpend
bronzePrestige
```

These are only examples, but they match the intended structure well.

---

## 22. Milestone Evaluation Flow
The game should regularly evaluate milestone conditions.

### Recommended rule
On each major state update or on a lightweight milestone-check pass:
- evaluate incomplete milestones
- unlock any newly satisfied milestones
- trigger celebration/notification if needed

This is the intended flow.

---

## 23. Main UI Card Requirements
The Milestones object/card in the main UI should show:
- unlocked milestone count
- total milestone count
- next milestone or next recommended milestone if available
- clickable interaction to open modal

### Example
- **Milestones: 7 / 32**
- **Next: Hire 5 Junior Traders**

This would be very useful.

---

## 24. Modal Requirements
The Milestones modal should show milestone cards in a **4x4 grid**.

### Each milestone card should show
- name
- description
- unlocked/locked state
- optional progress text

### Recommended visual states
- unlocked → fully visible / highlighted
- locked but visible → muted / outlined
- hidden → placeholder or omitted

This is the intended card behavior.

---

## 25. Recommended Sorting / Ordering
Milestones should be ordered in the intended progression path.

### Recommendation
Sort milestone cards primarily by:
- category order
- internal designed sequence

Do not simply sort alphabetically.

This is essential because the system is supposed to teach progression order.

---

## 26. Suggested Category Order
Recommended category order:
1. Getting Started
2. Trading Desk
3. Research
4. Markets & Sectors
5. Institutions
6. Automation
7. Compliance & Lobbying
8. Prestige

This follows the game’s progression arc well.

---

## 27. Notifications
A newly unlocked milestone should ideally trigger a small celebratory notification.

### First-pass recommendation
Use a lightweight toast/banner such as:
- **Milestone Unlocked: First Junior Trader**

This is not required to be complex, but it should exist.

---

## 28. Save / Load Requirements
The save model must include:

```ts
unlockedMilestones
```

Optional UI state like `milestoneModalOpen` does not necessarily need persistence.

### Migration defaults
```ts
unlockedMilestones = {}
```

This ensures compatibility.

---

# PART III — UI / PROGRESSION NOTES

## 29. Why This System Is Important Late
By the time the game reaches this phase, the player needs a stronger way to understand what matters next.

Milestones provide that structure without having to over-explain through tutorials.

They become a progression language embedded in the game.

---

## 30. Relationship to Research and Units
Milestones should be one of the main ways the player understands what to unlock next.

For example:
- if a milestone says **Buy your first Quant Trader**
- the player can infer that they should work toward the Research and economy requirements for automation

This is why milestones should be visible and ordered intentionally.

---

## 31. Relationship to Steam Achievements
The milestone system should be designed so that some milestones can later map cleanly to external achievements.

This is why stable milestone IDs and optional `achievementKey` metadata are worth including now.

---

## 32. Future Expansion Hooks
The following can be added later but are not required in the first implementation:
- milestone rewards
- category filters/tabs inside the modal
- hidden surprise milestones
- completion percentage by category
- Steam sync / external achievement integration
- milestone history / recently unlocked list

These are useful later, but the first version should stay focused.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 33. Recommended Implementation Order
### Step 1
Define milestone categories and first-pass milestone registry.

### Step 2
Add milestone unlocked-state tracking to save data.

### Step 3
Implement milestone evaluation checks.

### Step 4
Add main UI Milestones card with unlocked count and click interaction.

### Step 5
Build Milestones modal with 4x4 grid card layout.

### Step 6
Add milestone unlock notification/toast.

### Step 7
Balance the milestone ordering and wording so it properly teaches the game’s intended progression path.

---

## 34. Testing Checklist
Phase 13 should be considered successful if:
- milestone cards open in a 4x4 grid modal
- unlocked and future milestones are visible and understandable
- milestones guide the player through the intended game order
- milestone unlock conditions trigger correctly
- newly unlocked milestones feel rewarding and informative
- the system is ready to map cleanly to future achievements

---

## 35. Final Summary
Phase 13 introduces milestones as collectible progression objects and the final major progression-guidance layer.

### Final approved Phase 13 rule
**Milestones are collectible progression objects shown through a clickable Milestones card and a 4x4 card-grid modal, designed to guide the player through the intended order of play and later support achievement systems.**

This document should be treated as the design and implementation planning source of truth for Phase 13.