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

// let conduitData = [
//     {}
// ]
let conduitData = {};
conduitData["Critical Role Foundation"] = 0;
conduitData["Processing Foundation"] = 0;
conduitData["PETA"] = 0;
conduitData["NAACP"] = 0;
// console.log(conduitData)

let mainInstance = (m) => {
    let title = "TWITCH PLAYS GOD";
    let modeButton, modeSpan;
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
        modeButton = m.createButton("Create New Critter")
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
                    // creationSketch.elt.position(0, page.height / 8);
                    // document.getElementById("creationCanvas").style(position(0, page.height / 8);
                } else {
                    document.getElementById("defaultCanvas2").remove();
                    document.getElementById("creationSpan").remove();

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
