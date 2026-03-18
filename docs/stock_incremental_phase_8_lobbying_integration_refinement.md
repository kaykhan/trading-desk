# Stock Incremental Game — Phase 8 Design Document and Implementation Planning

## Scope
This document covers **Phase 8 — Lobbying Integration Refinement**.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **System integration notes**

Phase 8 refines Lobbying so it becomes the player’s main strategic response to the external friction introduced in Phase 7.

This phase defines:
- how Lobbying mitigates compliance burden
- how Lobbying reduces recurring compliance cost categories
- how Lobbying affects sector-specific regulation pressure
- how Lobbying interacts with automation, institutions, and energy systems
- how the Lobbying tab should display active relief
- how the player sees before/after mitigation effects

This phase should turn Lobbying from a future-facing bonus layer into an active and necessary strategic system.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 8 Goal
The goal of Phase 8 is to make Lobbying feel like the player’s answer to scale-related friction.

Before this phase, the game includes:
- compliance burden
- recurring compliance costs
- sector-specific pressure
- energy/automation/institutional overhead

After this phase, Lobbying should allow the player to:
- reduce compliance burden growth
- soften efficiency loss from compliance
- reduce specific compliance/tax cost categories
- reduce sector-specific regulatory friction
- make automation and institutional builds more sustainable

### Core design philosophy
Lobbying should not just give free upside.
It should primarily act as **mitigation and structural relief**.

---

## 2. Why Phase 8 Matters
Without this phase, Lobbying risks feeling disconnected from the real pressures of the game.

Phase 7 created the problem.
Phase 8 creates the player’s strategic tools to respond to that problem.

This is what gives Lobbying a clear role:
- Compliance tab = diagnostic/problem view
- Lobbying tab = mitigation/solution view

That relationship should now be formalized.

---

## 3. Core Lobbying Role
Lobbying should now do four main jobs.

### 1. Reduce compliance burden
Reduce the derived burden that creates ongoing efficiency loss.

### 2. Reduce compliance efficiency penalties
Even if burden exists, certain policies can weaken how strongly it hurts output.

### 3. Reduce recurring compliance cost categories
Policies can reduce:
- Staff Compliance
- Energy Compliance
- Automation Compliance
- Institutional Compliance

### 4. Reduce regulatory friction in specific sectors or systems
Policies can make some sectors or system types easier to operate in.

This is the intended multi-role structure.

---

## 4. Why This Feels Good
This structure makes Lobbying meaningful because the player can directly see it:
- lowering their burden
- increasing effective efficiency
- reducing their next bill
- improving viability of certain strategies

This is much stronger than generic “+10% output” style policies alone.

---

## 5. Approved Lobbying Philosophy Going Forward
Lobbying should now be thought of as:
- legal influence
- regulatory shaping
- tax relief
- industrial support
- institutional access management

That means many future policies should have practical real-economy style effects rather than abstract generic buffs.

---

## 6. Compliance and Lobbying Relationship
The player should be able to clearly understand this relationship:

### Compliance
Shows:
- burden
- penalties
- category costs
- what is causing pain

### Lobbying
Shows:
- what policies are reducing the pain
- how much relief is active
- what additional relief can still be bought

This is the most important UX relationship in this phase.

---

## 7. Policy Track Roles (Refined)
The existing broad lobbying tracks should now gain stronger mitigation identities.

### Labor Policy
Reduces staff-related regulatory and labor costs.

### Energy Policy
Reduces energy/infrastructure-related compliance costs and machine-side friction.

### Market Policy
Reduces market access restrictions, sector burdens, and broad institutional pressure.

### Technology Policy
Reduces automation oversight burden and machine-side regulatory costs.

This preserves the earlier track structure while making it more concrete.

---

## 8. Refined Policy Examples
### Labor Policy examples
- **Payroll Reporting Reform** — reduces Staff Compliance cost
- **Workforce Filing Simplification** — reduces staff-related burden contribution
- **Training Accreditation Relief** — reduces human-side training overhead later

### Energy Policy examples
- **Industrial Energy Relief** — reduces Energy Compliance cost
- **Grid Stabilization Subsidies** — softens energy/infrastructure burden
- **Data Center Utility Credits** — reduces power-related operational drag later

### Market Policy examples
- **Institutional Reporting Relief** — reduces Institutional Compliance cost
- **Market Access Streamlining** — reduces sector regulatory burden
- **Capital Requirements Easing** — reduces institution burden contribution

### Technology Policy examples
- **Algorithmic Exemptions** — reduces Automation Compliance cost
- **AI Oversight Streamlining** — reduces ML/AI burden contribution
- **Model Registration Reform** — reduces machine-side compliance drag

These are very strong policy directions because they solve identifiable problems.

---

## 9. Sector-Specific Lobbying Relief
Lobbying should later be able to reduce pressure in specific sectors.

### Example direction
- Finance relief policies reduce the extra regulatory burden from Finance exposure
- sector access policies can make certain sectors less expensive to operate in

The first implementation can keep this broad, but the design should leave room for sector-specific relief.

---

## 10. Automation-Specific Lobbying Relief
Automation-heavy builds need specific help.

### Lobbying should eventually help with
- rule-based automation oversight cost
- ML oversight cost
- AI oversight cost
- automation burden contribution

This is important because automation already has:
- Power pressure
- event sensitivity
- compliance cost

Lobbying can become the policy-side answer to that pressure.

---

## 11. Institutional-Specific Lobbying Relief
Institution-heavy builds should also get their own relief paths.

### Example areas
- reduced reporting obligations
- reduced institutional burden contribution
- reduced institutional compliance bill
- sector access benefits for large institutions

This ensures large organization builds remain strategically distinct.

---

## 12. What the Player Should See in the Lobbying Tab
The Lobbying tab should now show active mitigation, not just policy names.

### Required player-visible effects
- current burden reduction
- current cost reduction by category
- effective efficiency improvement from lobbying
- policies causing those effects

This is a required evolution of the Lobbying UI.

---

## 13. Before / After Comparison
One of the most important pieces of this phase is comparison.

The player should be able to understand things like:
- Compliance Burden without Lobbying
- Compliance Burden with Lobbying
- Projected Bill without Lobbying
- Projected Bill with Lobbying
- Effective Efficiency without Lobbying
- Effective Efficiency with Lobbying

This makes lobbying feel valuable immediately.

---

## 14. Future Timed / Visible Mechanics Hook
You wanted some timed/visible mechanics parked for now but mentioned in future phases.

Lobbying is a natural place to later add things like:
- timed advocacy campaigns
- policy push timers
- influence spend windows
- active political opportunities

These should be parked for now, but this phase should leave room for them later.

---

## 15. Final Design Summary for Phase 8
### Final approved Phase 8 rule
**Lobbying becomes the player’s primary mitigation system for compliance burden, recurring compliance costs, sector regulatory pressure, and machine/institutional oversight friction.**

This is the intended role of the phase.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 16. Keep Existing Lobbying State
The existing core lobbying state can remain:

```ts
lobbyingUnlocked: boolean;
influence: number;
purchasedPolicies: Record<string, boolean>;
```

Phase 8 mostly expands how purchased policies affect calculations and how the UI displays their effects.

---

## 17. New Derived Lobbying Relief Values
The implementation now needs derived mitigation values.

Suggested derived selectors:

```ts
getComplianceBurdenRelief(state)
getCompliancePenaltyRelief(state)
getStaffComplianceCostRelief(state)
getEnergyComplianceCostRelief(state)
getAutomationComplianceCostRelief(state)
getInstitutionalComplianceCostRelief(state)
```

These values should be computed from purchased policies.

---

## 18. Revised Compliance Formula Integration
The compliance system should now distinguish between:
- base burden / base costs
- lobbying relief
- effective burden / effective costs

### Recommended burden flow
```ts
baseComplianceBurden = raw derived burden from state
burdenRelief = lobbying burden reduction

effectiveComplianceBurden = Math.max(0, baseComplianceBurden - burdenRelief)
```

### Recommended efficiency flow
```ts
baseComplianceEfficiencyMultiplier = formula from effective burden
penaltyRelief = lobbying efficiency relief

finalComplianceEfficiencyMultiplier = Math.min(1, baseComplianceEfficiencyMultiplier + penaltyRelief)
```

This gives two levers:
- reduce burden itself
- reduce the penalty strength

---

## 19. Revised Compliance Cost Formula Integration
Each cost category should also now follow a before/after mitigation flow.

### Example pattern
```ts
baseStaffComplianceCost = raw category cost
staffCostRelief = lobbying reduction amount or percent

effectiveStaffComplianceCost = adjusted value after lobbying
```

Do the same for:
- Energy Compliance
- Automation Compliance
- Institutional Compliance

The exact reduction method can be either:
- flat subtraction
- percentage reduction

### Recommendation
Use **percentage reduction** for first implementation because it scales better.

---

## 20. Suggested First-Pass Relief Selectors
Suggested selectors:

```ts
getBaseComplianceBurden(state)
getEffectiveComplianceBurden(state)
getBaseComplianceEfficiencyMultiplier(state)
getFinalComplianceEfficiencyMultiplier(state)

getBaseStaffComplianceCost(state)
getEffectiveStaffComplianceCost(state)
getBaseEnergyComplianceCost(state)
getEffectiveEnergyComplianceCost(state)
getBaseAutomationComplianceCost(state)
getEffectiveAutomationComplianceCost(state)
getBaseInstitutionalComplianceCost(state)
getEffectiveInstitutionalComplianceCost(state)

getTotalBaseComplianceCost(state)
getTotalEffectiveComplianceCost(state)
```

This makes the before/after model explicit.

---

## 21. Suggested Policy Effect Types
To make the system scalable, define policy effects in categories.

Suggested categories:

```ts
type LobbyingEffectType =
  | 'complianceBurdenReduction'
  | 'compliancePenaltyReduction'
  | 'staffComplianceCostReduction'
  | 'energyComplianceCostReduction'
  | 'automationComplianceCostReduction'
  | 'institutionalComplianceCostReduction'
  | 'sectorComplianceRelief'
  | 'automationOversightRelief'
  | 'institutionalReportingRelief';
```

This can be expanded later.

---

## 22. Recommended First-Pass Policy Additions / Clarifications
You may keep earlier policies, but Phase 8 should clarify or refine them into mitigation roles.

### Labor track
- `payrollReportingReform`
- `workforceFilingSimplification`

### Energy track
- `industrialEnergyRelief`
- `gridStabilizationSubsidies`

### Market track
- `institutionalReportingRelief`
- `marketAccessStreamlining`

### Technology track
- `algorithmicExemptions`
- `aiOversightStreamlining`

These can map directly to compliance relief selectors.

---

## 23. Lobbying UI Requirements
The Lobbying tab now needs a stronger top summary.

### Required top summary values
- current Influence
- base Compliance Burden
- effective Compliance Burden
- burden reduction from lobbying
- base projected compliance bill
- effective projected compliance bill
- total savings from lobbying

This makes the tab immediately relevant.

---

## 24. Policy Card Requirements
Each policy card should now show not just its name and cost, but also its practical mitigation effect.

### Example card details
- policy name
- track
- Influence cost
- effect summary
- current status (active / not purchased)
- how much it is currently helping if applicable

### Example
**Industrial Energy Relief**
- Reduces Energy Compliance costs by 15%
- Active Savings: `$18 / review`

This is a strong player-facing way to show impact.

---

## 25. Compliance Tab UI Update Requirement
The Compliance tab should now show both:
- base burden / costs
- effective burden / costs after lobbying

It should clearly present the mitigation relationship.

### Example display
- Base Burden: 22
- Lobbying Relief: -4
- Effective Burden: 18

- Base Review Cost: $320
- Lobbying Savings: -$48
- Effective Review Cost: $272

This is a critical UI requirement.

---

## 26. Save / Load Requirements
If policy state already exists, no major new persistent state is required.

The main additions are derived calculations and richer UI.

Optional later additions for historical reporting can be deferred.

---

# PART III — SYSTEM INTEGRATION NOTES

## 27. Interaction With Compliance Tab
This phase formalizes the intended split:

### Compliance tab
Shows the problem and the before/after result.

### Lobbying tab
Shows the mitigation tools and their active relief.

Both tabs should support the player’s understanding of the same system from different sides.

---

## 28. Interaction With Sectors
Sector-heavy builds should become more strategically manageable through lobbying.

Lobbying should make it more viable to remain heavily exposed to sectors that otherwise generate more regulatory burden.

This is especially important for Finance later.

---

## 29. Interaction With Human Specialization
Lobbying should not directly replace specialization, but by reducing pressure in a sector, it can make specialist-heavy builds in that sector more attractive.

This is an indirect but important interaction.

---

## 30. Interaction With Institutional Mandates
Institution-heavy builds are one of the biggest intended beneficiaries of lobbying relief.

This is where lobbying can shine as a sustainability layer.

For example:
- Hedge Fund and Investment Firm builds should feel more viable with institutional reporting relief policies.

---

## 31. Interaction With Automation
Automation-heavy builds should become more manageable through technology lobbying relief.

This is especially important for:
- Rule-Based Bots
- ML Bots
- AI Bots

Without policy-side relief, automation builds should remain powerful but burden-heavy.

This is the intended tension.

---

## 32. Interaction With Events
Events remain separate from Lobbying, but in future iterations some events may interact with policy systems.

Examples later:
- higher value from certain relief policies during compliance-related market events
- event-sensitive lobbying opportunity windows

These are future hooks only.

---

## 33. Future Expansion Hooks
The following are good future directions but should be deferred:
- timed advocacy campaigns
- temporary emergency relief policies
- limited-duration lobbying pushes
- political windows / elections / reform cycles
- policy prerequisites and chaining deeper than first-pass rules

These can be mentioned later, but should not be part of the first implementation.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 34. Recommended Implementation Order
### Step 1
Add base/effective compliance selectors and relief selectors.

### Step 2
Map purchased lobbying policies to compliance burden and cost reduction outputs.

### Step 3
Patch compliance formulas to use lobbying relief.

### Step 4
Patch Lobbying tab UI to show mitigation summaries and policy impacts.

### Step 5
Patch Compliance tab UI to show before/after mitigation values.

### Step 6
Balance test relief strengths so lobbying feels valuable but not mandatory too early.

---

## 35. Testing Checklist
Phase 8 should be considered successful if:
- lobbying relief values are clearly visible and understandable
- compliance burden and projected bill show meaningful reduction when policies are purchased
- labor, energy, automation, and institutional policies feel distinct
- the relationship between Compliance and Lobbying tabs is obvious
- lobbying feels like mitigation of real problems rather than disconnected bonuses

---

## 36. Final Summary
Phase 8 refines Lobbying into the main mitigation layer for the external friction introduced by compliance and regulation.

### Final approved Phase 8 rule
**Lobbying becomes the player’s primary system for reducing compliance burden, weakening compliance penalties, lowering recurring compliance costs, and making regulated sectors, institutions, and automation more sustainable.**

This document should be treated as the design and implementation planning source of truth for Phase 8.

