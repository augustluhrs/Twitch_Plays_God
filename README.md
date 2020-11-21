# Twitch Plays God
***A virtual ecosystem guided by an online community where autonomous critters use real-world money to donate to non-profits and orgs.***

## Contributing

Want to help me make this thing? Feel free to add/suggest whatever! Currently looking for people who know about the following areas:
- reliable long-running programs
- safe un-hackable programs (esp. with money stuff)
- money stuff (getting and logging incoming funds and sending them out to the right places)
- data viz
- UI/UX
- twitch overlays

## Reading List
- *The Selfish Gene* by Richard Dawkins
- *Joyful Militancy* by carla bergman and Nick Montgomery

## Current Project TODO

### Short Term Goals

**Server Database Stuff**
- ~~set up ecosystem on server with exports~~
- ~~socket display clientside, everything else on server~~
- set up critter db
- set up world db
- set up backup db
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
