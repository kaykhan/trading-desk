# Stock Incremental Game — Full Milestone Specification Sheet

## Purpose
This document expands the milestone system into a full progression-spec sheet.

The milestone system should not just reward play. It should also:
- teach the player what to do next
- reinforce the intended order of progression
- make major systems feel introduced in the right sequence
- later map cleanly to platform achievements such as Steam achievements

This document therefore prioritizes **progression clarity** over keeping the list artificially small.

---

# Core Milestone Design Rules

## 1. Milestones are progression guides
Milestones should be curated in a deliberate order so the player naturally sees:
- what they just accomplished
- what the next meaningful goal is
- what system they should be moving toward next

## 2. Milestones are collectible objects
Each milestone should exist as a card/object with:
- id
- category
- display order
- name
- description
- completion condition
- unlocked state
- reward
- optional achievement key for future platform sync

## 3. Most future milestones should be visible
Because milestones teach progression, most future milestones should be visible in the Milestones modal.

## 4. Rewards should nudge, not replace progression
Milestone rewards should help the player move to the next step without bypassing the core economy.

## 5. Milestones should cover the full game arc
The final list should cover:
- onboarding
- humans
- research
- sectors
- specializations
- institutions
- automation
- infrastructure
- compliance
- lobbying
- boosts
- prestige
- optimisations

---

# Data Model

```ts
export type MilestoneCategoryId =
  | 'gettingStarted'
  | 'tradingDesk'
  | 'research'
  | 'marketsSectors'
  | 'specialization'
  | 'institutions'
  | 'automation'
  | 'infrastructure'
  | 'complianceLobbying'
  | 'boosts'
  | 'prestige'
  | 'optimisations';

type MilestoneReward = {
  cash?: number;
  researchPoints?: number;
  influence?: number;
  reputation?: number;
  note?: string;
};

type MilestoneDefinition = {
  id: string;
  category: MilestoneCategoryId;
  displayOrder: number;
  name: string;
  description: string;
  visibleByDefault: boolean;
  reward: MilestoneReward;
  achievementKey?: string;
};
```

---

# Milestone Categories and Ordering

Recommended category order:
1. Getting Started
2. Trading Desk
3. Research
4. Markets & Sectors
5. Specialization
6. Institutions
7. Automation
8. Infrastructure
9. Compliance & Lobbying
10. Boosts
11. Prestige
12. Optimisations

Within each category, milestones should be ordered in the intended progression path.

---

# Full Milestone Specification

## A. Getting Started
These milestones teach the earliest loop: click, hire, scale, notice progression.

### 1. firstTrade
- **Name:** First Trade
- **Description:** Make your first manual trade.
- **Condition:** totalManualTrades >= 1
- **Visible:** Yes
- **Reward:** $10

### 2. activeDesk
- **Name:** Active Desk
- **Description:** Make 25 manual trades.
- **Condition:** totalManualTrades >= 25
- **Visible:** Yes
- **Reward:** $25

### 3. firstIntern
- **Name:** First Intern
- **Description:** Hire your first Intern.
- **Condition:** internCount >= 1
- **Visible:** Yes
- **Reward:** $30

### 4. smallTeam
- **Name:** Small Team
- **Description:** Hire 5 Interns.
- **Condition:** internCount >= 5
- **Visible:** Yes
- **Reward:** $75

### 5. firstJuniorTrader
- **Name:** First Junior Trader
- **Description:** Hire your first Junior Trader.
- **Condition:** juniorTraderCount >= 1
- **Visible:** Yes
- **Reward:** $150

### 6. juniorDesk
- **Name:** Junior Desk
- **Description:** Hire 5 Junior Traders.
- **Condition:** juniorTraderCount >= 5
- **Visible:** Yes
- **Reward:** $400

### 7. firstSeniorTrader
- **Name:** First Senior Trader
- **Description:** Hire your first Senior Trader.
- **Condition:** seniorTraderCount >= 1
- **Visible:** Yes
- **Reward:** $750

### 8. builtTheDesk
- **Name:** Built the Desk
- **Description:** Own Interns, Junior Traders, and a Senior Trader at the same time.
- **Condition:** internCount >= 3 AND juniorTraderCount >= 3 AND seniorTraderCount >= 1
- **Visible:** Yes
- **Reward:** $1,000

### 9. firstUpgrade
- **Name:** First Upgrade
- **Description:** Purchase your first one-time upgrade.
- **Condition:** totalPurchasedUpgrades >= 1
- **Visible:** Yes
- **Reward:** $200

### 10. deskMomentum
- **Name:** Desk Momentum
- **Description:** Reach $100/sec total income.
- **Condition:** totalCashPerSecond >= 100
- **Visible:** Yes
- **Reward:** $500

---

## B. Trading Desk
These milestones deepen the human desk and point the player toward people scaling.

### 11. tenInterns
- **Name:** Intern Bench
- **Description:** Hire 10 Interns.
- **Condition:** internCount >= 10
- **Visible:** Yes
- **Reward:** $1,000

### 12. tenJuniors
- **Name:** Junior Floor
- **Description:** Hire 10 Junior Traders.
- **Condition:** juniorTraderCount >= 10
- **Visible:** Yes
- **Reward:** $2,500

### 13. threeSeniors
- **Name:** Senior Coverage
- **Description:** Hire 3 Senior Traders.
- **Condition:** seniorTraderCount >= 3
- **Visible:** Yes
- **Reward:** $4,000

### 14. firstDeskOptimization
- **Name:** Refined Execution
- **Description:** Buy your first Desk Optimisation rank.
- **Condition:** totalDeskOptimisationRanks >= 1
- **Visible:** Yes
- **Reward:** $5,000
- **Note:** Visible after Optimisations unlock later.

### 15. humanDeskScaled
- **Name:** Scaled Human Desk
- **Description:** Reach 25 total human staff.
- **Condition:** (internCount + juniorTraderCount + seniorTraderCount) >= 25
- **Visible:** Yes
- **Reward:** $7,500

---

## C. Research
These milestones teach the player that research is the next major pillar after the first human desk.

### 16. unlockResearch
- **Name:** Scientific Method
- **Description:** Unlock Research.
- **Condition:** researchUnlocked == true
- **Visible:** Yes
- **Reward:** 25 RP

### 17. firstJuniorScientist
- **Name:** First Junior Scientist
- **Description:** Hire your first Junior Scientist.
- **Condition:** juniorScientistCount >= 1
- **Visible:** Yes
- **Reward:** 40 RP

### 18. firstSeniorScientist
- **Name:** First Senior Scientist
- **Description:** Hire your first Senior Scientist.
- **Condition:** seniorScientistCount >= 1
- **Visible:** Yes
- **Reward:** 75 RP

### 19. firstResearchNode
- **Name:** First Breakthrough
- **Description:** Purchase your first research node.
- **Condition:** totalPurchasedResearchNodes >= 1
- **Visible:** Yes
- **Reward:** $1,500

### 20. hundredRP
- **Name:** Research Momentum
- **Description:** Generate 100 total Research Points.
- **Condition:** lifetimeResearchPoints >= 100
- **Visible:** Yes
- **Reward:** 75 RP

### 21. fiveResearchNodes
- **Name:** Research Portfolio
- **Description:** Purchase 5 research nodes.
- **Condition:** totalPurchasedResearchNodes >= 5
- **Visible:** Yes
- **Reward:** 125 RP

### 22. firstResearchUpgrade
- **Name:** Lab Refinement
- **Description:** Purchase your first Research upgrade.
- **Condition:** totalPurchasedResearchUpgrades >= 1
- **Visible:** Yes
- **Reward:** $8,000

### 23. firstResearchOptimization
- **Name:** Throughput Discipline
- **Description:** Buy your first Research Optimisation rank.
- **Condition:** totalResearchOptimisationRanks >= 1
- **Visible:** Yes
- **Reward:** 100 RP
- **Note:** Visible after Optimisations unlock later.

---

## D. Markets & Sectors
These milestones teach the player that sectors are the next major strategic layer.

### 24. firstExtraSector
- **Name:** New Market
- **Description:** Unlock your first sector beyond Finance.
- **Condition:** unlockedSectorCount >= 2
- **Visible:** Yes
- **Reward:** 50 RP

### 25. unlockTechnologySector
- **Name:** Technology Exposure
- **Description:** Unlock the Technology sector.
- **Condition:** technologySectorUnlocked == true
- **Visible:** Yes
- **Reward:** $2,500

### 26. unlockEnergySector
- **Name:** Energy Exposure
- **Description:** Unlock the Energy sector.
- **Condition:** energySectorUnlocked == true
- **Visible:** Yes
- **Reward:** $2,500

### 27. firstSectorAssignment
- **Name:** First Assignment
- **Description:** Assign your first staff unit to a sector.
- **Condition:** totalAssignedUnitsToSectors >= 1
- **Visible:** Yes
- **Reward:** $2,000

### 28. multiSectorPresence
- **Name:** Active Rotation
- **Description:** Assign staff into 2 different sectors.
- **Condition:** activeAssignedSectorCount >= 2
- **Visible:** Yes
- **Reward:** $3,500

### 29. sectorFloorBuilt
- **Name:** Fully Deployed
- **Description:** Assign at least 10 total staff to sectors.
- **Condition:** totalAssignedUnitsToSectors >= 10
- **Visible:** Yes
- **Reward:** $6,000

### 30. financeFocus
- **Name:** Finance Focus
- **Description:** Reach $250/sec from Finance.
- **Condition:** financeSectorOutput >= 250
- **Visible:** Yes
- **Reward:** $4,000

### 31. technologyFocus
- **Name:** Technology Focus
- **Description:** Reach $250/sec from Technology.
- **Condition:** technologySectorOutput >= 250
- **Visible:** Yes
- **Reward:** $4,000

### 32. energyFocus
- **Name:** Energy Focus
- **Description:** Reach $250/sec from Energy.
- **Condition:** energySectorOutput >= 250
- **Visible:** Yes
- **Reward:** $4,000

---

## E. Specialization
These milestones teach the player how to deepen human and institutional strategy.

### 33. firstSpecialistTrainingResearch
- **Name:** Training Curriculum
- **Description:** Unlock your first specialist training research node.
- **Condition:** totalSpecialistTrainingResearchUnlocked >= 1
- **Visible:** Yes
- **Reward:** 80 RP

### 34. firstSpecialist
- **Name:** First Specialist
- **Description:** Train your first specialist.
- **Condition:** totalSpecialists >= 1
- **Visible:** Yes
- **Reward:** 80 RP

### 35. correctPlacement
- **Name:** Proper Placement
- **Description:** Assign a specialist to their matching sector.
- **Condition:** totalCorrectSpecialistAssignments >= 1
- **Visible:** Yes
- **Reward:** $5,000

### 36. specialistDesk
- **Name:** Specialist Desk
- **Description:** Own 5 total specialists.
- **Condition:** totalSpecialists >= 5
- **Visible:** Yes
- **Reward:** 120 RP

### 37. firstMandateResearch
- **Name:** Institutional Doctrine
- **Description:** Unlock your first institutional mandate framework.
- **Condition:** totalMandateFrameworkResearchUnlocked >= 1
- **Visible:** Yes
- **Reward:** 2 Influence

### 38. firstMandate
- **Name:** First Mandate
- **Description:** Apply your first institutional mandate.
- **Condition:** totalMandatedInstitutions >= 1
- **Visible:** Yes
- **Reward:** 2 Influence

### 39. alignedInstitution
- **Name:** Strategic Alignment
- **Description:** Assign a mandated institution to its matching sector.
- **Condition:** totalCorrectMandateAssignments >= 1
- **Visible:** Yes
- **Reward:** $25,000

---

## F. Institutions
These milestones teach the player the institution progression line.

### 40. firstPropDesk
- **Name:** First Prop Desk
- **Description:** Build your first Prop Desk.
- **Condition:** propDeskCount >= 1
- **Visible:** Yes
- **Reward:** $20,000

### 41. firstInstitutionalDesk
- **Name:** Institutional Entry
- **Description:** Build your first Institutional Desk.
- **Condition:** institutionalDeskCount >= 1
- **Visible:** Yes
- **Reward:** $60,000

### 42. firstHedgeFund
- **Name:** Fund Launch
- **Description:** Build your first Hedge Fund.
- **Condition:** hedgeFundCount >= 1
- **Visible:** Yes
- **Reward:** $250,000

### 43. firstInvestmentFirm
- **Name:** Global Platform
- **Description:** Build your first Investment Firm.
- **Condition:** investmentFirmCount >= 1
- **Visible:** Yes
- **Reward:** $1,000,000

### 44. institutionPortfolio
- **Name:** Multi-Institution Structure
- **Description:** Own 3 total institution-tier units.
- **Condition:** totalInstitutionUnits >= 3
- **Visible:** Yes
- **Reward:** 4 Influence

### 45. institutionUpgrade
- **Name:** Institutional Standards
- **Description:** Purchase your first Institution upgrade.
- **Condition:** totalPurchasedInstitutionUpgrades >= 1
- **Visible:** Yes
- **Reward:** $50,000

---

## G. Automation
These milestones teach the player the machine-side progression path in the intended order.

### 46. unlockAutomation
- **Name:** Systematic Trading
- **Description:** Unlock automation.
- **Condition:** automationUnlocked == true
- **Visible:** Yes
- **Reward:** 100 RP

### 47. firstQuantTrader
- **Name:** First Quant Trader
- **Description:** Buy 1 Quant Trader.
- **Condition:** quantTraderCount >= 1
- **Visible:** Yes
- **Reward:** $15,000

### 48. unlockRuleBot
- **Name:** Rule Systems Online
- **Description:** Unlock Rule-Based Bot.
- **Condition:** ruleBasedBotUnlocked == true
- **Visible:** Yes
- **Reward:** 120 RP

### 49. firstRuleBot
- **Name:** First Rule Bot
- **Description:** Buy 1 Rule-Based Bot.
- **Condition:** ruleBasedBotCount >= 1
- **Visible:** Yes
- **Reward:** $30,000

### 50. firstStrategyUnlocked
- **Name:** Strategy Catalog
- **Description:** Unlock your first automation strategy.
- **Condition:** totalUnlockedAutomationStrategies >= 1
- **Visible:** Yes
- **Reward:** 100 RP

### 51. firstAutomationConfigured
- **Name:** Automation Online
- **Description:** Set a market target and strategy on an automation unit.
- **Condition:** totalConfiguredAutomationClasses >= 1
- **Visible:** Yes
- **Reward:** $25,000

### 52. machineDesk
- **Name:** Machine Desk
- **Description:** Own 5 total automation units.
- **Condition:** totalAutomationUnits >= 5
- **Visible:** Yes
- **Reward:** $60,000

### 53. firstMLBot
- **Name:** ML Systems
- **Description:** Buy your first ML Bot.
- **Condition:** mlBotCount >= 1
- **Visible:** Yes
- **Reward:** 200 RP

### 54. firstAIBot
- **Name:** AI Systems
- **Description:** Buy your first AI Bot.
- **Condition:** aiBotCount >= 1
- **Visible:** Yes
- **Reward:** 400 RP

### 55. firstAutomationUpgrade
- **Name:** Machine Tuning
- **Description:** Purchase your first Automation upgrade.
- **Condition:** totalPurchasedAutomationUpgrades >= 1
- **Visible:** Yes
- **Reward:** $75,000

### 56. firstAutomationOptimization
- **Name:** Execution Refinement
- **Description:** Buy your first Automation Optimisation rank.
- **Condition:** totalAutomationOptimisationRanks >= 1
- **Visible:** Yes
- **Reward:** 150 RP
- **Note:** Visible after Optimisations unlock later.

---

## H. Infrastructure
These milestones teach the player that machine growth needs infrastructure.

### 57. unlockPowerSystems
- **Name:** Powered Up
- **Description:** Unlock machine power infrastructure.
- **Condition:** powerSystemsUnlocked == true
- **Visible:** Yes
- **Reward:** $50,000

### 58. firstServerRack
- **Name:** First Rack
- **Description:** Buy your first Server Rack.
- **Condition:** serverRackCount >= 1
- **Visible:** Yes
- **Reward:** $20,000

### 59. firstServerRoom
- **Name:** Server Room Online
- **Description:** Buy your first Server Room.
- **Condition:** serverRoomCount >= 1
- **Visible:** Yes
- **Reward:** $80,000

### 60. firstDataCentre
- **Name:** Data Centre Online
- **Description:** Buy your first Data Centre.
- **Condition:** dataCentreCount >= 1
- **Visible:** Yes
- **Reward:** $500,000

### 61. firstCloudCompute
- **Name:** Cloud Expansion
- **Description:** Buy your first Cloud Infrastructure unit.
- **Condition:** cloudInfrastructureCount >= 1
- **Visible:** Yes
- **Reward:** $1,500,000

### 62. firstInfrastructureUpgrade
- **Name:** Facility Standards
- **Description:** Purchase your first Infrastructure upgrade.
- **Condition:** totalPurchasedInfrastructureUpgrades >= 1
- **Visible:** Yes
- **Reward:** $60,000

---

## I. Compliance & Lobbying
These milestones teach the player how the external-pressure loop works.

### 63. firstComplianceReview
- **Name:** Under Review
- **Description:** Trigger your first Compliance Review.
- **Condition:** totalComplianceReviews >= 1
- **Visible:** Yes
- **Reward:** 2 Influence

### 64. firstCompliancePayment
- **Name:** In Good Standing
- **Description:** Pay your first Compliance bill.
- **Condition:** totalCompliancePayments >= 1
- **Visible:** Yes
- **Reward:** $15,000

### 65. firstComplianceTabVisit
- **Name:** Compliance Awareness
- **Description:** Open the Compliance tab.
- **Condition:** complianceTabOpened == true
- **Visible:** Yes
- **Reward:** 1 Influence

### 66. unlockLobbying
- **Name:** Regulatory Affairs
- **Description:** Unlock Lobbying.
- **Condition:** lobbyingUnlocked == true
- **Visible:** Yes
- **Reward:** 3 Influence

### 67. firstLobbyingPolicy
- **Name:** First Policy Win
- **Description:** Purchase your first lobbying policy.
- **Condition:** totalPurchasedLobbyingPolicies >= 1
- **Visible:** Yes
- **Reward:** 2 Influence

### 68. threePolicies
- **Name:** Political Footing
- **Description:** Purchase 3 lobbying policies.
- **Condition:** totalPurchasedLobbyingPolicies >= 3
- **Visible:** Yes
- **Reward:** 4 Influence

### 69. firstGovernanceUpgrade
- **Name:** Administrative Support
- **Description:** Purchase your first Compliance & Lobbying upgrade.
- **Condition:** totalPurchasedGovernanceUpgrades >= 1
- **Visible:** Yes
- **Reward:** $100,000

### 70. firstGovernanceOptimization
- **Name:** Governance Refinement
- **Description:** Buy your first Governance Optimisation rank.
- **Condition:** totalGovernanceOptimisationRanks >= 1
- **Visible:** Yes
- **Reward:** 3 Influence
- **Note:** Visible after Optimisations unlock later.

---

## J. Boosts
These milestones teach the player the tactical layer.

### 71. unlockBoosts
- **Name:** Tactical Tools
- **Description:** Unlock the Boosts system.
- **Condition:** boostsUnlocked == true
- **Visible:** Yes
- **Reward:** $75,000

### 72. firstTimedBoost
- **Name:** Tactical Advantage
- **Description:** Activate your first timed boost.
- **Condition:** totalTimedBoostActivations >= 1
- **Visible:** Yes
- **Reward:** $75,000

### 73. firstGlobalBoost
- **Name:** Permanent Edge
- **Description:** Own your first Global Boost.
- **Condition:** totalOwnedGlobalBoosts >= 1
- **Visible:** Yes
- **Reward:** 2 Influence

### 74. boostAutomationUnlocked
- **Name:** Automated Timing
- **Description:** Unlock auto-activation for timed boosts.
- **Condition:** boostAutomationUnlocked == true
- **Visible:** Yes
- **Reward:** 150 RP

---

## K. Prestige
These milestones teach the player that resets are progression, not failure.

### 75. firstPrestige
- **Name:** First Reset
- **Description:** Complete Prestige 1.
- **Condition:** prestigeCount >= 1
- **Visible:** Yes
- **Reward:** 1 Reputation

### 76. firstReputationSpend
- **Name:** Reputation Investor
- **Description:** Spend your first Reputation point.
- **Condition:** spentReputation >= 1
- **Visible:** Yes
- **Reward:** $100,000

### 77. bronzePrestige
- **Name:** Bronze Legacy
- **Description:** Reach Prestige 2 (Bronze).
- **Condition:** prestigeCount >= 2
- **Visible:** Yes
- **Reward:** 2 Reputation

### 78. silverPrestige
- **Name:** Silver Legacy
- **Description:** Reach Prestige 3 (Silver).
- **Condition:** prestigeCount >= 3
- **Visible:** Yes
- **Reward:** 2 Reputation

### 79. goldPrestige
- **Name:** Gold Legacy
- **Description:** Reach Prestige 4 (Gold).
- **Condition:** prestigeCount >= 4
- **Visible:** Yes
- **Reward:** 3 Reputation

### 80. firstPrestigeGoalRank
- **Name:** Legacy Investment
- **Description:** Rank up your first prestige goal.
- **Condition:** totalPrestigeGoalRanksPurchased >= 1
- **Visible:** Yes
- **Reward:** $250,000

### 81. tenPrestigeRanks
- **Name:** Developing Legacy
- **Description:** Purchase 10 total prestige goal ranks.
- **Condition:** totalPrestigeGoalRanksPurchased >= 10
- **Visible:** Yes
- **Reward:** 2 Reputation

### 82. onyxLegacy
- **Name:** Onyx Legacy
- **Description:** Reach Prestige 10 (Onyx).
- **Condition:** prestigeCount >= 10
- **Visible:** Yes
- **Reward:** 5 Reputation
- **Note:** This is a top-end capstone milestone.

---

## L. Optimisations
These milestones teach the player that optimisations are the late-game long-tail sink.

### 83. unlockOptimisations
- **Name:** Refinement Systems
- **Description:** Unlock Optimisations after your first Prestige.
- **Condition:** optimisationsUnlocked == true
- **Visible:** Yes
- **Reward:** $50,000

### 84. firstOptimisation
- **Name:** First Refinement
- **Description:** Buy your first Optimisation rank.
- **Condition:** totalOptimisationRanks >= 1
- **Visible:** Yes
- **Reward:** $50,000

### 85. tenOptimisationRanks
- **Name:** Fine Tuning
- **Description:** Buy 10 total Optimisation ranks.
- **Condition:** totalOptimisationRanks >= 10
- **Visible:** Yes
- **Reward:** 150 RP

### 86. fiftyOptimisationRanks
- **Name:** Operational Excellence
- **Description:** Buy 50 total Optimisation ranks.
- **Condition:** totalOptimisationRanks >= 50
- **Visible:** Yes
- **Reward:** 5 Influence

### 87. hundredOptimisationRanks
- **Name:** Systems Mastery
- **Description:** Buy 100 total Optimisation ranks.
- **Condition:** totalOptimisationRanks >= 100
- **Visible:** Yes
- **Reward:** 1 Reputation

---

# Notes on Why This List Is Larger Than 50
This spec intentionally goes above 50 because the milestone system is doing more than giving achievements.

It is also teaching the player:
- what to buy first
- what systems matter next
- how the game’s progression branches relate to each other
- when the player is entering a new phase of the game

That means a fuller milestone list is better than an artificially small one.

---

# Recommended UI Behavior

## Main Milestones Card
Should show:
- unlocked milestone count / total count
- next recommended milestone
- click to open modal

### Example
- **Milestones: 18 / 87**
- **Next: Buy your first Quant Trader**

## Milestones Modal
- 4x4 grid of milestone cards
- unlocked milestones highlighted
- future milestones visible but muted
- ordered by intended progression path, not alphabetically

---

# Recommended Future Steam Achievement Mapping
Not every milestone must become a Steam achievement, but the system is structured to allow that.

Best candidates for future achievements are:
- First Trade
- First Junior Trader
- Unlock Research
- First Specialist
- First Prop Desk
- First Rule Bot
- First ML Bot
- First Compliance Review
- First Lobbying Policy
- First Prestige
- Bronze Legacy
- Onyx Legacy
- Systems Mastery

---

# Final Rule
**Milestones should function as both collectible progression objects and a designed teaching path through the game, showing players what they should do next and in what order.**