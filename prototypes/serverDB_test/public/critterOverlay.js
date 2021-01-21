function displayInfoOverlay(critter){
    infoGraphics.clear();
    infoGraphics.textAlign(CENTER);
    infoGraphics.noStroke();
    infoGraphics.imageMode(CENTER);
    let critterColor = color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255);
    let fadedColor = color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
    let backgroundColor = color((1 - critter.color[0]) * 255, (1 - critter.color[1])  * 255, (1 - critter.color[2])  * 255, 100);
    // infoGraphics.background(backgroundColor);
    infoGraphics.background(255, 100);

    
    //name at top
    // infoGraphics.fill(critterColor);
    infoGraphics.fill(0);
    infoGraphics.textSize(overlay.textSize + 10);
    infoGraphics.text(critter.name, overlay.w / 2, overlay.h / 12);

    //critter display -- doubled radius of all for visibility
    //for lifeForce aura
    infoGraphics.fill(fadedColor);
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2 + map(critter.life, 0, 100, 0, critter.r));
    //show ring if ready to mate
    infoGraphics.noFill();
    if(critter.mateTimer <= 0 && critter.life >= critter.minLifeToReproduce){ //isReadyToMate
        infoGraphics.stroke(255);
    }
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2 + map(critter.life, 0, 200, 0, critter.r));
    //base critter
    infoGraphics.fill(critterColor);
    infoGraphics.noStroke();
    infoGraphics.ellipse(overlay.w / 2, overlay.h / 5, critter.r * 2); 

    //critter stats
    // infoGraphics.fill(critterColor);
    infoGraphics.fill(0);
    infoGraphics.textAlign(LEFT, CENTER);
    infoGraphics.textSize(overlay.textSize);
    //life stats
    infoGraphics.text("LIFE: " + critter.life.toFixed(2), overlay.w / 24, overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Poop Rate: " + critter.excretionRate.toFixed(2), overlay.w / 24, 2 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Poop Timer: " + critter.excretionTimer, overlay.w / 24, 3 * overlay.h / 24 + overlay.h / 4);
    //space then donation stats
    infoGraphics.text("1: " + critter.donations[0].target + " -- donated: " + critter.donations[0].total.toFixed(2), overlay.w / 24, 4 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("2: " + critter.donations[1].target + " -- donated: " + critter.donations[1].total.toFixed(2), overlay.w / 24, 5 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Min Life b4 Donation: " + critter.minLifeToDonate.toFixed(2), overlay.w / 24, 6 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Donation Timer: " + (floor(critter.donationRate) - critter.donationTimer), overlay.w / 24, 8 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Donation Percentage: " + critter.donationPercentage.toFixed(2) * 100 + "%", overlay.w / 24, 7 * overlay.h / 24 + overlay.h / 4);
    //space then mate stats
    infoGraphics.text("Min Life b4 Mate: " + critter.minLifeToReproduce.toFixed(2), overlay.w / 24, 9 * overlay.h / 24 + overlay.h / 4);
    // infoGraphics.text("Mate Timer: " + critter.mateTimer.toFixed(2), overlay.w / 24, 12 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Inheritance Percentage: " + critter.parentalSacrifice.toFixed(2) * 100 + "%", overlay.w / 24, 10 * overlay.h / 24 + overlay.h / 4);
    infoGraphics.text("Num Offspring: " + critter.offspring.length, overlay.w / 24, 11 * overlay.h / 24 + overlay.h / 4);
    
    //space then parents -- ooh draw!
    // infoGraphics.fill(critterColor); //parentcolor?
    //first gen vs children
    infoGraphics.textAlign(CENTER);
    infoGraphics.text("PARENTS:", overlay.w / 2, 19 * overlay.h / 24)
    if (critter.ancestry.parents.length == 1) {
        infoGraphics.text(critter.ancestry.parents[0].name, overlay.w / 2, 10 * overlay.h / 12);
        infoGraphics.image(godIcon, overlay.w / 2, 11 * overlay.h / 12, 80, 80);
    } else {
        infoGraphics.text(critter.ancestry.parents[0].name, overlay.w / 4, 10 * overlay.h / 12);
        infoGraphics.fill(critter.ancestry.parents[0].color[0] * 255, critter.ancestry.parents[0].color[1] * 255, critter.ancestry.parents[0].color[2] * 255);
        infoGraphics.ellipse(overlay.w / 4, 11 * overlay.h / 12, critter.ancestry.parents[0].r);
        // infoGraphics.fill(critterColor);
        infoGraphics.fill(0);
        infoGraphics.text(critter.ancestry.parents[1].name, 3 * overlay.w / 4, 10 * overlay.h / 12);
        infoGraphics.fill(critter.ancestry.parents[1].color[0] * 255, critter.ancestry.parents[1].color[1] * 255, critter.ancestry.parents[1].color[2] * 255);
        infoGraphics.ellipse(3 * overlay.w / 4, 11 * overlay.h / 12, critter.ancestry.parents[1].r);

    }

    //make sure overlay is not off screen
    if(overlay.position.x <= overlay.w / 2) {overlay.position.x = overlay.w / 2 + 20};
    if(overlay.position.x >= width - overlay.w / 2) {overlay.position.x = width - overlay.w / 2 - 20};
    if(overlay.position.y <= overlay.h / 2) {overlay.position.y = overlay.h / 2 + 20};
    if(overlay.position.y >= height - overlay.h / 2) {overlay.position.y = height - overlay.h / 2 - 20};

    //draw overlay to canvas
    image(infoGraphics, overlay.position.x, overlay.position.y);
}