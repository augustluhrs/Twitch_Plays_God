// now just going to have a central switchboard sketch that can slot in the appropriate p5 instance
// starts with ecosystem, then can switch to critter creation, goes back to create
// will be what is hosted on glitch, as anyone watching there will be able to interact
// later will need to figure out what the twitch version looks like
// not sure if it matters, going to have all in instance mode for now
// Feb 16 '21

let page = { //later should just find screen size and make relative for DOM
    width: 1920,
    height: 1080
}
let creationSketch;

let userData = {
    funds: 10.00
}

let newCritter = {
    // this.id = critter.id;
    // this.DNA = critter.DNA;
    // this.offspring = critter.offspring;
    name: "Critter Name",
    donations: [{target: "NAACP", total: 0},{target: "Critical Role Foundation", total: 0}],
    positionArray: [0,0],
    // this.position = new Victor(critter.position.x, critter.position.y);
    life: .8,
    ancestry: {child: this.name, parents: [{name: "Your Name"}]},
    // color: [45, 225, 194],
    // color: p5.color(45, 225, 194),
    color: "#2DE1C2",
    r: 0.5,
    maxSpeed: 0.5,
    donationRate: 300000,
    donationPercentage: .5,
    minLifeToDonate: .5,
    refractoryPeriod: 300000,
    parentalSacrifice: .5,
    minLifeToReproduce: .5,
    // this.excretionRate = critter.excretionRate;
    // this.mutationRate = critter.mutationRate;
    // this.mateTimer = critter.mateTimer;
    // this.excretionTimer = critter.excretionTimer;
    // this.donationTimer = critter.donationTimer;
    // this.foodScale = critter.foodScale;
    // this.boid = new Boid(this);
}

let mainInstance = (m) => {
    let title = "TWITCH PLAYS GOD";
    let modeSpan;
    m.modeButton = null;
    let isCreating = false;
    // let credits;

    m.preload = () => {

    }

    m.setup = () => {
        m.createCanvas(page.width, page.height / 8); //1920x1080 (1/8th grid)
        m.background(102, 113, 18);
        m.textSize(m.height/2);
        m.textAlign(m.CENTER, m.BOTTOM);
        m.fill(248, 139, 199);
        m.text(title, m.width/2, 2 * m.height/3);

        modeSpan = m.createSpan()
            .id("modeSpan")
            .position(0, 5 * m.height / 8)
            .size(page.width, m.height / 3);
        m.modeButton = m.createButton("Create New Critter")
            // .position(m.width/2, 3 *  m.height / 4) //fine to make canvas relative since at top for now
            .parent('modeSpan')
            .class("button")
            .id("modeButton")
            .center()
            .mousePressed(() => {
                // isCreating = !isCreating;
                ecosystemSketch.isCreating = !ecosystemSketch.isCreating;
                if(ecosystemSketch.isCreating){
                    creationSketch = new p5(creationInstance, 'creationCanvas');
                    m.modeButton.html("Back To The World")
                    document.getElementById("orgList").style.display = "none";

                    // creationSketch.elt.position(0, page.height / 8);
                    // document.getElementById("creationCanvas").style(position(0, page.height / 8);
                } else {
                    m.modeButton.html("Create New Critter")
                    document.getElementById("defaultCanvas2").remove();
                    document.getElementById("creationSpan").remove();
                    ecosystemSketch.isReadyToSpawn = false;

                    //ugh wrong place for these
                    // document.getElementById("orgList").style.display = "block";
                    // document.getElementById("orgList").hidden = false; // not sure why this doesn't work
                    // document.getElementById("orgList").removeAttribute("hidden");
                    // document.getElementById("orgList").removeAttribute("display");
                    // console.log('asdfads');


                    // document.getElementById("confirmationSpan").remove();


                    // for (let child of document.getElementById('creationCanvas').children) {
                    //     child.remove();
                    // }
                }
            })
    }

    // m.draw = () => {

    // }
}

//kind of a weird layout, but this is where the magic happens:
let mainSketch = new p5(mainInstance, 'banner');
let ecosystemSketch = new p5(ecosystemInstance, 'ecosystemCanvas');
