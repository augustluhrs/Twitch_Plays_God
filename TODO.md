## Current Project TODO

### Short Term Goals

**Feb 2021 Update** -- Cont. into March
Hitting a fake roadblock with the critter creation for the first playtest. Need to excrete this so I can move on. Main issue was difference in absolute positioning for DOM elements in instance sketch -- need to reference page not canvas.

- [X] Critter Creation
    - [X] Instance Mode with Page DOM Positioning
    - [X] A) Name, God, Starting Life
    - [X] B) Critter Preview, Color Picker
    - [X] C) Speed/Size, Excretion Rate
    - [X] D) Conduit Targets
    - [X] E) Donations and Sex Sliders
    - [X] F) Cost Tallies and Create Button
    - [X] Go back to eco sketch and click to drop
    - [X] get user info from server (funds)
    - [X] send critter update to server
    - [X] send new conduit targets to server
    - [X] update funds object in server with new targets
    - [X] life in world update on critter life
    - [X] critter donation update
- [X] Critter Creation pt. 2
    - [X] point buy system
- [ ] Critter misc unessential
    - [X] name crossover and min/max
    - [ ] name abuse prevention
    - [ ] name mutation
    - [ ] face?
    - [ ] hunger / food coma?
    - [ ] prevent food from having out of bounds coords
    - [X] ~~mutation rate option in creation~~
    - [ ] donation animation
    - [ ] mate animation
    - [ ] eating animation
    - [ ] emoji animation class
    - [X] update mate ring size
    - [X] fix color lerp in offspring
    - [X] change colormode to HSL
    - [X] add a fix to the HSL lerp that blends naturally
    - [X] test no mutation -- something weird happening in crossover
    - [X] fix crossover
    - [ ] update critter overlay
    - [ ] navigable family tree
    - [ ] change foodScale to poopSize and have body size be correlated
    - [X] ~~aggression? family? too much for this version...~~
    - [X] have minLife/cooldown/percentage correlate in some way? need to prevent viruses?
    - [X] population max limiter
    - [ ] total time alive and TOD stats
    - [X] minLife negative bug -- needs constrain, did hacky min for now
    - [X] saturation threshold so hue doesn't lerp if black/white
- [ ] UI misc unessential
    - [X] Scrollable Donation List
    - [ ] Collapsable Donation List
    - [X] hide scrollbar
    - [X] hide donations list on menu click and if fundsUpdate
    - [ ] no overlap between critter overlay and funds monitor... keep left or hide?
    - [ ] max height of donation dropdown select
    - [ ] filter donation select by category...
    - [ ] Donation Div Class
    - [ ] Font
    - [ ] Conduit Background Swatch
    - [X] Button Class
    - [ ] button class update
    - [X] icon credit div at bottom
    - [ ] color scheme 
    - [ ] title banner update
    - [X] updating life slider with personal funds max
    - [ ] clickable link to charity in select
    - [ ] tooltip details if hover over
        - [ ] donation
        - [ ] mating
        - [ ] excretion
        - [ ] taxes
        - [ ] everything else
    - [X] creation menu defaults to last critter created
    - [ ] misc layout adjustments
    - [X] ~~confirmation pop up~~
    - [X] change mode button "back to ecosystem"
    - [ ] disclaimer and legal info
    - [ ] foundations with links are verified, eventually send non-verified names to checker
    - [ ] look into "em" instead of px
- [ ] basics page / tutorial / help
- [ ] community effects
    - [ ] brainstorm playtestable community effect prototypes
    - [ ] food sprinkle
    - [ ] community critter generation
    - [ ] fertilization battle royale minigame
    - [ ] ranked choice voting system
- [ ] backend updates
    - [X] change dbs -- one for static critter info (could have more stats too like time of death and total lifespan, ancestry details, etc.)
    - [X] one for dynamic eco data
    - [X] user gods db for stats
    - [X] funds db
    - [X] fix db update pausing whole thing -- why if async? test seaparating critter info / culling huge object
    - [ ] separate server for db? -- just sends info over when updating and requests info on start
    - [ ] ask matt stuff
    - [ ] reformat backup function ping pong (parameter instead)
    - [X] test speed if just inserting instead of updating whole thing
    - [X] fix callbacks to allow for existing donations log
    - [X] if still slow after inserting, just not going to update all the time...
    - [ ] should solo insert donations too...
- [ ] god stuff
    - [ ] user login on server
    - [ ] user login client-side
    - [ ] user donation leaderboard
    - [ ] user community interaction leaderboard
    - [ ] leaderboard filter by org
    - [ ] user donation as percentage of each critter donation
- [ ] Playtest (start day and week later followup)
    - [ ] host on glitch
    - [X] get group
    - [ ] intitial feedback survey
    - [ ] week later feedback survey
    - [ ] user log in
    - [ ] initial playtest
    - [ ] ethics playtest/check-in
    - [ ] reduce timers
- [ ] Documentation
    - [ ] get media
    - [ ] update github with current project status and media
    - [ ] add to website
    - [ ] create separate todo/changelog and update readme
    - [ ] design document with standards
    - [ ] prettier / ESLint?
    - [ ] versions and log
    - [ ] readme update and todo separation
- [ ] "use strict" for debugging? https://eloquentjavascript.net/08_error.html
- [ ] standard toFixed/parseFloat across board https://modernweb.com/what-every-javascript-developer-should-know-about-floating-points/
- [ ] needs some sort of new theming...
- [ ] whats with the weird hyper speed (lerp to catch up?)


Before Playtest:
- [ ] change default funds to 0
- [ ] add users
- [ ] add starting funds
- [ ] start OBS and mic recording

During Playtest:

After Playtest:

Feedback questions:
    - Giving
        - Do you give to charity? Why/why not, if so, how much, to whom, why?
        - How have your giving habits changed over time?

DB breakdown:
- Ecosystem Essentials:
    - Supply (Food):
        - amount
        - pos
    - Corpses
        - pos
        - r
    - Critters (critter db has all static props like DNA, but eco has the mutable variables)
        - pos
        - id
        - life
        - timers
- Critters
    - everything static, and mutables get updated on backup (donations, timers, life)
    - what happens if there's a crash and back-ups conflict? reset to last non-conflict?
- Funds
    - orgs, donations
- Users
    - name, id, 

**Jan 2021 Update**
- [X] ~~finish this list~~
- [ ] clean up backend code (logs + module reorganization)
- [ ] clean up frontend code (modules)
- [ ] new UI
- [ ] critter creation (sliders)
- [ ] critter creation (gene packs)
- [X] ~~fix food bugs~~ (i hope)
- [ ] critter action animations
- [X] ~~click to show critter info (stats, donations, family tree)~~
- [ ] environment effects
- [ ] bigger world
- [X] ~~ecosystem database~~
- [ ] test out NNs
- [ ] test out 3D creatures
- [ ] procedural creatures and animations
- [ ] look into Twitch overlays
- [ ] glitch redo
- [ ] twitch overlay


**Server Database Stuff**
- ~~set up ecosystem on server with exports~~
- ~~socket display clientside, everything else on server~~
- set up critter db
- set up world db
- set up backup db
- set up conduit db
- research backup best practices
- manager so if crash, restarts
- memory leaks?
    - global this?
    - use strict?
    - copy instead of reference?

**Client Side Stuff**
- world stats overlay
- family trees
- critter generation
    - fast
    - advanced with sliders
    - full with puzzle gene packs and best critters (leftovers go to community pool?)
- click to show critter info
- funds raised monitor
- sprinkle food down
- learn React lol?

**Ecosystem Stuff**
- ~~quadtree!~~
- ~~flocking!~~
- try out NNs (DIY or ml5)
- ~~remove pacman border, make solid~~
- names and other characterizations
- features beyond circles? (relevant for world changes)
- mating pause + hearts
- eggs
- ~~seek food~~
- food coma + animation
- poop blooms into food
- donation animation/indicator
- environment adaptations
    - weather preferences
    - biome traits
    - diet

**World Stuff**
- make bigger!!!
- add terrain
- add hazards
- add climate

**Documentation Stuff**
- behavior gifs
    - flies around decomposing food
    - sexual tension of two ready mates in group with high separation bias

**Community Stuff**
- consult Mimi Yin
- Crispr Operation to change individuals DNA
- hivemind predator
- terraforming
- changing global effects
    - donation minimums
    - reproduction minimums
    - excretion minimums (no death?)

**Three JS Stuff**
- test 3D ecosystem

**Unity Stuff**
- test 3D ecosystem
- ML-Agents test

**Twitch Stuff**
- test stream
- research overlays
- research TPP
- research bits

**Money Stuff**
- research ads
- research alternative payment sources
- set up transparent ledger

**Maybe Stuff**
- agression?
- family/tribe recognition?
- attraction?


### Long Term Goals

- 3D? Either Unity or three.js
- Arcade Cabinet
- more meme evolution?
- prisoner's dilemma





![the first stable ecosystem, a 13 hour running world of around 60 critters](assets/firstStableEcosystem.png)

## OLD TODO (Oct 2020)

### Project Overall
- Update README with project overview
- explanation of system doc
- food for thought doc

### New Platforms
- Twitch
    - try chat commands
- Discord
    - try bot commands
- YORB
    - try in three.js
- Arcade Cabinet
    - quarter for food & world effect
    - $1.00 new critter

### Back-End
- Move the Ecosystem data to server.js
- Look into database storage // back-ups

### Front-End
- Revolving Chart of Data Over Map
    - current state of ecosystem
        - num Critters
        - total food in world
    - log of donations
- Family Trees
- Total Donation Log
- World Update Ticker
    - deaths, births, global events, etc.
- How to know critter info?
    - if not on twitch, can click for individual info pop up
    - "PokeDex" of all living critters
        - sortable
- name/num on critter? or too cluttered? maybe under?

### Ecosystem
- World
    - new map texture
    - terrain / hazards
    - climate
    - food changes
        - appearance
        - plant/meat?
- community interaction
    - terraforming
    - climate change
    - group-controlled predator
- donation log
    - ~~basic object in code and fund checker function ~~
    - some sort of rounding down thing + leftovers go to X

### Critters
- Implement New Traits
    - ~~names~~
    - ~~ancestry~~
    - mating pause
    - ~~food outline~~
    - ~~excretion rate as effort~~
    - food coma
    - ~~mutations~~
    - ~~altruism alleles~~
        - ~~primary / secondary donations~~
        - ~~crossover~~
        - ~~rate of donation / conditions~~
    - donation animation/indicator
    - environment adaptations
        - weather preferences
        - biome traits
        - diet
    - better timing of expressions? second() vs frame?
- Update Critter Appearance
    - reflecting environment adaptations
    - corpse appearance 
- Neural Network movement to replace Perlin Noise?
- Create New Critter Interface

### Optimizations
- better way of checking surroundings without iterating through whole array?
- change all classes to factory functions?