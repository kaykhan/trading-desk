This version is cleaner than the last one, but it’s still built around a separation that the game may not actually need. The UI is still pretending there are multiple equal “workspaces,” when the real core experience is much more linear:

trade → unlock juniors → buy juniors → unlock seniors → buy seniors → unlock bots → buy bots

That progression wants to be seen in one place, not split across panels.

What’s wrong with this version
1. The center panel is still wasting a huge amount of space

You already spotted the main issue:

the middle section is basically a container for tab switching

the actual actionable content is on the right

so the UI is making the player look in two places for one system

That’s unnecessary friction.

If tabs exist, the selected tab should control the content directly beneath it in the same panel.
Right now it feels like:

center = fake workspace

right = real workspace

That split weakens the whole screen.

2. The top-left block is still mostly decorative

You’re also right about that.

That top-left area:

repeats information the user already knows

takes up a lot of valuable space

doesn’t help with the main loop enough to justify its size

“Open your first staffed desk” and the run path are not useless, but they do not deserve that much prime real estate.

This area should either:

be removed

or be collapsed into a much smaller progress banner / next objective strip

Right now it feels like an onboarding hero section inside a game screen, which is too much.

3. Trading and Operations are still artificially separated

This is the biggest structural issue.

You’re designing a game where the player’s main mental model is:

click trade

get cash

buy next unit

scale income

unlock next unit tier

That’s one continuous flow.

So having:

Trading on the left

Operations on the right

a middle tab area that suggests another content system

is overcomplicating the core interaction.

For this game, especially early and mid-game, Trading and Operations are basically one gameplay lane.

4. The UI currently hides progression instead of showing it

Right now the player has to piece together the progression from separate regions:

trade button left

next target left and top

bulk buy right

units right

fake nav middle

But what you actually want is a vertical, readable ladder:

Make Trade

Buy Junior Traders

Buy Senior Traders

Buy Trading Bots

That sequence should be visually obvious.

At the moment, it isn’t.

5. The middle tabs have no payoff

The middle nav says:

Operations

Research

Prestige

Stats

Settings

But there’s no satisfying content payoff attached to selecting them in the visible layout. That makes them feel like placeholders rather than meaningful navigation.

So the player ends up asking:
“Why is this area here at all?”

Which is exactly the problem.

6. There is still too much “framing UI” around too little actual play UI

The screen has:

labels

subtitles

chips

headings

status phrases

target phrases

section wrappers

but the actual actions are comparatively few.

That makes the interface feel more “designed around a concept” than “designed around use.”

You want the screen to feel like it’s helping the player do the loop, not narrating the loop from six directions.

7. Research is still conceptually useful, but maybe not as a main tab

This is the important nuance.

I still think Research is a good game system.
But I no longer think it needs to be a top-level visual destination on the main play surface.

Because if the player’s main loop is linear, then Research might work better as:

unlock cards embedded inline between unit tiers

or a collapsible subsection in the main progression lane

or a smaller side panel / modal / expandable section

Instead of:

a big tab that competes with the main progression screen

I think your new direction is stronger

What you described is much cleaner:

Main screen should show, in order:

Trade

Buy Junior Traders — x1 / x5 / x10 / Max

Buy Senior Traders — x1 / x5 / x10 / Max

Buy Trading Bots — x1 / x5 / x10 / Max

That works because it mirrors how players think.

It also solves a bunch of current problems:

no fake center workspace

no artificial Trade/Operations split

no unclear tab-content relationship

clearer progression visibility

better use of vertical space

The stronger model
Use one main progression column

The main play surface should be a single scrollable or vertically stacked “desk progression” interface.

Section 1 — Trading

Cash

Cash/sec

Cash/click

Make Trade button

click upgrades

Section 2 — Junior Desk

unlock requirement or unlock state

buy mode selector

Junior Trader card

Junior-specific upgrades

Section 3 — Senior Desk

locked until unlocked

buy mode selector or shared global buy mode

Senior Trader card

Senior-specific upgrades

Section 4 — Bot Desk

locked until unlocked

buy mode selector or shared global buy mode

Trading Bot card

bot-specific upgrades

Now the player can literally read the game top-to-bottom.

That is much better for an incremental game.

Do you still need separate Trading and Operations tabs?

Honestly: probably no.

At least not as separate main tabs.

Because in your current design, Operations is not a different activity. It’s just the next part of the same main loop.

So I’d merge them into a single main screen.

Better top-level structure

You probably only need:

Desk or Main or Terminal as the primary screen

Research

Prestige

maybe Stats

maybe Settings

That’s it.

And even then, Research may not need to be a full tab if you integrate it inline.

Best recommendation now
Option A: One main “Desk” screen + side tabs

Main screen includes:

Trading

Juniors

Seniors

Bots

Then separate tabs only for:

Research

Prestige

Stats

Settings

This is probably the best compromise.

Option B: Everything inline on one main screen

Even Research unlocks appear inline as milestone cards between unit tiers.

That’s the most streamlined version, but can get long if the game grows a lot.

For MVP, it might actually be perfect.

What I would remove immediately

If you keep iterating this design, I would remove:

the giant top-left hero/onboarding block

the huge empty center management surface

the separate Operations area on the right as a competing workspace

Trading/Operations as separate top-level conceptual panels

These are all adding complexity without adding clarity.

What I would replace it with

A single main screen layout like:

Top strip

Cash

Per Click

Per Sec

Reputation

Reset Yield

Main column
Trading

Make Trade

manual upgrades

Junior Traders

unlock status

buy mode

unit card

relevant upgrades

Senior Traders

unlock status

buy mode

unit card

relevant upgrades

Trading Bots

unlock status

buy mode

unit card

relevant upgrades

Secondary nav somewhere lighter

Research

Prestige

Stats

Settings

This makes progression obvious and removes the current awkwardness.

One important design insight

You said:

then there becomes no reason for separation of trading and operations tab?

I think that’s basically correct.

For your game, Trading and Operations are not two separate destinations.
They are two parts of the same single progression lane.

So separating them in the main UI is probably a mistake.

That doesn’t mean the concepts are useless internally. It just means they don’t need to be split visually as primary screens.

My conclusion

You should move to a single unified main play screen where the player sees:

the action button

the unit ladder

the unlock path

the scaling controls

all in one place.

That will be much easier to understand, much more satisfying to use, and much more aligned with the actual structure of your game.

The next useful thing is for me to sketch the exact new section-by-section layout for that unified screen.
