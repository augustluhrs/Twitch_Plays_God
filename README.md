# Survival_Machines
### Twitch Plays God

![the first stable ecosystem, a 13 hour running world of around 60 critters](assets/firstStableEcosystem.png)

## TODO 

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

### Critters
- Implement New Traits
    - ~~names~~
    - ~~ancestry~~
    - mating pause
    - ~~food outline~~
    - ~~excretion rate as effort~~
    - food coma
    - ~~mutations~~
    - altruism alleles 
        - primary / secondary donations
        - crossover
        - rate of donation / conditions
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
