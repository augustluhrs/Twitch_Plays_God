//no food, critter buttons now

let ecosystemInstance = function(e) {
    //have to add e. to variables we want to access globally
    e.ecosystem; //undefined at first so server set up works
    e.hasSetup = false;

    let monitor = {
        position: {x: 0, y: 0},
        size: {w: 0, h: 0},
        shape: null,
        overlay: 0
    };

    // e.funds = {
    //     sorted: []
    // };

    //bottom row stats
    e.stats = {
        critterCount: 0,
        worldLife: 0,
        communityFunds: 0
    }
    
    //buttons
    e.isCreating = false;
    e.isReadyToSpawn = false;
    let notFirstClick = 0;
    
    //click Info overlay
    let infoGraphics;
    e.overlay = {
        w: 400,
        h: 800,
        position: {x: 0,y: 0},
        critter: {},
        textSize: 25
    }
    e.isDisplayingInfo = false;

    //acts of god stuff
    e.actState = "";
    e.timeLeft = 60;
    e.eventButton;
    e.godPanelDiv;
    e.showGodPanel = false;
    e.godPanel = {
        x: -(2 * page.width / 16),
        y: (page.height / 2) - .25 * page.height / 9,
        width: 4 *  page.width / 16, 
        height: 6 * page.height / 9,
        rightEdge: 0, 
        edgeMax: (4 *  page.width / 16) + (.25 * page.width / 16),
        fadeSpeed: 40,
        dir: "out"
    }
    e.allIcons = {
        feastIcons: [],
    }
    //voting
    e.helpIcon;
    e.isShowingVotingHelp = false;
    e.ranks = [];
    e.participationCheckbox;
    e.acts = ["feast", "famine", "creation", "meltdown", "fire", "flood", "lightning"];
    //feast
    e.isFeast = false;
    e.feastIcons = ["🍉", "🍑", "🥥", "🥑", "🌽", "🥔", "🧀", "🍗", "🥩", "🍕", "🌭", "🍙", "🧁", "🍩", "🌶️", "🥦", "🍄"];
    e.feastIcon;
    //famine
    //creation
    // e.isCommunityCreation = false;
    e.communityCreationButton;
    e.hasCreatedSeed = false;

    //for the donations panel stuff
    e.donations = {
        sorted: [],
        total: 0
    };

    e.donationsPanel = { //just opposite of god panel
        x: page.width + (2 * page.width / 16),
        y: (page.height / 2) - .25 * page.height / 9,
        width: 4 *  page.width / 16, 
        height: 6 * page.height / 9,
        leftEdge: page.width, 
        edgeMax: page.width - ((4 *  page.width / 16) + (.25 * page.width / 16)),
        fadeSpeed: 40,
        dir: "out"
    }
    e.donationsPanelDiv;
    e.orgListDiv;
    // e.godsDonationListDiv;
    // e.godsInvolementListDiv;
    e.donationsPanelState = 'orgList';
    e.donationsPanelButton;
    e.donationsPanelModeButton;
    e.showDonationsPanel = false;
    

    

    //assets
    let godIcon;
    e.preload = () => {
        // monitor.shape = e.loadImage("assets/rounded_rectangle.png");
        godIcon = e.loadImage("assets/godIcon.jpg"); 
        // questionIcon = e.loadImage("assets/question.png");
    }

    e.setup = () => {
        e.createCanvas(page.width, page.height);
        e.ellipseMode(e.CENTER);
        e.rectMode(e.CENTER);
        e.imageMode(e.CENTER);
        e.textAlign(e.CENTER);
        e.noStroke();

        monitor.size.w = e.width/8;
        monitor.size.h = e.height/3;
        monitor.position.x = e.width - monitor.size.w
        monitor.position.y = e.height - monitor.size.h

        infoGraphics = e.createGraphics(e.overlay.w, e.overlay.h);

        //act of god event stuff
        e.godPanelDiv = e.createDiv()
            .id("godPanelDiv")
            .parent('ecosystemCanvas')
        e.eventButton = e.createButton('BE GOD')
            .parent("godPanelDiv")
            .class("button")
            .id("eventButton")
            .position(.75 * e.width / 16, 8.5 * e.height / 9)
            .mousePressed(() => {
                e.showGodPanel = !e.showGodPanel;
                if (e.showGodPanel) { //bring out panel
                    e.godPanel.dir = "in";
                    e.eventButton.html("HIDE PANEL");
                } else { //hide panel
                    e.eventButton.html("BE GOD");
                    e.godPanel.dir = "out";
                }
            });

        //voting event
        e.participationCheckbox = e.createCheckbox('Participating in Next Act of God', false)
            .id("participationCheckbox")
            .parent("godPanelDiv")
            .position(e.godPanel.x + 4 * e.godPanel.width / 4 , page.height / 8 + (e.godPanel.y - e.godPanel.height / 2) + 3 * e.godPanel.height / 30);
        e.participationCheckbox.hide();
        for(let i = 0; i < 7; i++){
            let newRankDropdown = e.createSelect();
            e.ranks.push(newRankDropdown);
        }
        for (let [i, dropdown] of e.ranks.entries()) {
            dropdown.id(`rank${i}`)
                .parent('godPanelDiv')
                .class('whitebox')
                .size(2 * e.godPanel.width / 4, e.godPanel.height / 21)
                //ugh forgot this is to page not canvas
                .position(e.godPanel.x + 3 * e.godPanel.width / 4 , (e.godPanel.y - e.godPanel.height / 2) + (11 + (3*i)) * e.godPanel.height / 30)
                .changed(e.rankingChange)
                .option("none");
                // .hide();
            for (let act of e.acts){
                dropdown.option(act);
            }
            dropdown.selected("none");
            dropdown.hide();
        }
        
        e.helpIcon = e.createImg("assets/question.png", "help icon")
            .parent("godPanelDiv")
            .position(e.godPanel.x + 4 * e.godPanel.width / 3, e.godPanel.y + 3.7 * e.godPanel.height / 7)
            .mouseOver(() => {
                e.isShowingVotingHelp = true;
                // console.log('on')
            })
            .mouseOut(() => {
                e.isShowingVotingHelp = false;
                // console.log('off')
            });
            e.helpIcon.hide();

        //feast
        e.feastIcon = e.feastIcons[Math.floor(Math.random() * e.feastIcons.length)];
        console.log(`my feast icon: ${e.feastIcon}`);

        //creation
        e.communityCreationButton = e.createButton("CREATE SEED CRITTER")
            .parent('godPanelDiv')
            .class("button")
            .id("communityCreationButton")
            .position(1.25 * e.width / 16, 4.25 * e.height / 9)
            .mousePressed(() => {
                if (communityCreationSketch == undefined) {
                    communityCreationSketch = new p5(communityCreationInstance, 'communityCreationCanvas');
                } else {
                    e.select(`#communityCreationCanvas`).show();
                }
                // m.modeButton.html("Back To The World") //gonna be fucky with this
                mainSketch.modeButton.hide(); //need to show this and orgList and godPanel (monitorFunds)
                // document.getElementById("orgList").style.display = "none";
                ecosystemSketch.godPanelDiv.hide();
                ecosystemSketch.donationsPanelDiv.hide();

            });
        if (e.actState != "creation") {
            e.communityCreationButton.hide();
        }

        //scrollable donations list
        // let listWidth = e.width / 6 + "px";
        // let listHeight = e.height / 3 + "px";

        //parent div for the panel, will move in and out on fade
        e.donationsPanelDiv = e.createDiv()
            .parent("ecosystemCanvas")
            .id("donationsPanelDiv");

        e.donationsPanelButton = e.createButton('DONATIONS')
            .parent("donationsPanelDiv")
            .class("button")
            .id("donationsPanelButton")
            .position(14.25 * e.width / 16, 8.5 * e.height / 9)
            .mousePressed(() => {
                e.showDonationsPanel = !e.showDonationsPanel;
                if (e.showDonationsPanel) { //bring out panel
                    e.donationsPanel.dir = "in";
                    e.donationsPanelButton.html("HIDE PANEL");

                } else { //hide panel
                    e.donationsPanelButton.html("DONATIONS");
                    e.donationsPanel.dir = "out";
                }
            });

        e.monitorFunds();

        //nvm don't need this because gets fundsUpdate on load?
        // e.select("#orgList")
        //     .position(5 * e.width / 6, 2 * e.height/3)
        //     .style("height", listHeight)
        //     .style("width", listWidth)
        //     .style("overflow", "scroll");
        // e.createDiv(`TOTAL RAISED: $${parseFloat(e.donations.total.toFixed(2))}`)
        //     .parent("orgList")
        //     .class("orgDivs")
        // for (let org of e.donations.sorted) {
        //    e.createDiv(`${org.target}: $${parseFloat(org.funds.toFixed(2))}`)
        //     .parent("orgList")
        //     .class("orgDivs")
        // }
        e.hasSetup = true;
    }

    e.draw = () => {
        e.background(200, 240, 255);
        if(e.ecosystem != undefined){
            // e.monitorFunds(); //now only doing this when getting a funds update
            e.drawEcosystem(); //switching order so panel doesn't cover up
            e.displayStats();
            e.displayTimerAndState();
            // if(e.showGodPanel){ //need this for fade to work right
            e.drawGodPanel();
            e.drawDonationsPanel();
            // e.drawGodEffects();
            // }
            if (e.isReadyToSpawn) {
                // only shows after create Critter button pressed
                notFirstClick++;
                e.push();
                e.fill(0);
                e.noStroke();
                e.textAlign(e.CENTER, e.CENTER);
                e.textSize(e.height / 10);
                e.text("Click to Drop Critter into Ecosystem", e.width / 2 , e.height / 4)
                e.colorMode(e.HSL);
                e.fill(newCritter.color);
                // e.noStroke();
                e.ellipse(e.mouseX, e.mouseY, e.map(newCritter.r, 0, 1, 5, 50));
                e.pop();
            } else {
                if(e.isDisplayingInfo) {
                    e.displayInfoOverlay(e.overlay.critter);
                }
                // if(e.showGodPanel) {
                //     e.drawGodPanel();
                // }
            }
        } else {
            e.textSize(100);
            e.text("waiting for server to set up", e.width/2, e.height/2);
        }
    }

    e.mousePressed = () => {
        if (e.isReadyToSpawn && notFirstClick > 1) {
            //drops critter into scene if in bounds
            if(e.mouseX >= 10 &&
                e.mouseX <= e.width - 10 &&
                e.mouseY >= 10 &&
                e.mouseY <= e.height - 10) {
                    //send server the critter info and funds updates, then update funds it sends back
                    newCritter.positionArray = [e.mouseX, e.mouseY];
                    socket.emit("newCritter", newCritter, updates, (response) => {
                        if (response.funds != undefined) { //just incase not logged in
                            userData.funds = parseFloat(response.funds.toFixed(2)); //not sure if still need these but don't want to risk it
                        }
                    }); 
                    
                    //update user data in server -- for now just mainSketch obj
                    // userData.funds -= parseFloat(newCritter.life.toFixed(2));
                    // userData.funds = parseFloat(userData.funds.toFixed(2)); // i fucking hate this issue

                    //reset
                    e.isReadyToSpawn = false;
                    e.isCreating = false;
                    // document.getElementById("defaultCanvas2").remove();
                    // document.getElementById("creationSpan").remove();
                    // e.select(`#creationCanvas`).hide();
                    e.godPanelDiv.show();
                    document.getElementById("orgList").style.display = "inherit"; //brings back org list, no idea what the style it's inheriting is
                    mainSketch.modeButton.html("Create New Critter");
                    notFirstClick = 0;
                }
        } else if (e.isFeast) {
            if(e.mouseX >= 10 &&
                e.mouseX <= e.width - 10 &&
                e.mouseY >= 10 &&
                e.mouseY <= e.height - 10) {
                    socket.emit("foodSprinkle", {source: "communityFunds", position: {x: e.mouseX, y: e.mouseY}});
                }
            
        } else { 
            //for checking critter info
            if (e.isDisplayingInfo) {
                e.isDisplayingInfo = false;
            } else if (!e.showGodPanel) {
                socket.emit("clickInfo", {position: {x: e.mouseX, y: e.mouseY}});
            }
        }
    }

    e.drawEcosystem = () => {
        //draw the corpses
        e.ecosystem.corpses.forEach( (corpse) => { //x,y,r,fade
            e.fill(255,255,255,corpse.fade);
            e.ellipse(corpse.position.x, corpse.position.y, corpse.r); 
        });    
    
        //draw the food
        e.ecosystem.supply.forEach( (food) => { //x,y,fade
            e.fill(0, food.fade);
            e.rect(food.position.x, food.position.y, 5);
        });
    
        //draw the critters
        e.ecosystem.critters.forEach( (critter) => { //position,r,color,life,isReadyToMate
            e.drawCritter(critter);
        });
    }

    e.drawCritter = (critter) => {
        //adding HSL color mode now
        e.push();
        e.colorMode(e.HSL, 360, 100, 100, 1);
        //for lifeForce aura
        // let fadedColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
        let fadedColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100, 0.4); //alpha scale to 1 //hmm maybe not color issue?
        // console.log(fadedColor);
        e.fill(fadedColor);
        e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 5, 0, critter.r)); //ugh this was still set to earlier life range
        
        //show ring if ready to mate -- white HSL is 0, 0, 100
        e.noFill();
        if(critter.isReadyToMate){
            // e.stroke(255);
            e.stroke(0, 0, 100);
        }
        // e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.life, 0, 10, 0, critter.r / 2));
        // e.ellipse(critter.position.x, critter.position.y, 3 * critter.r / 4);
        e.ellipse(critter.position.x, critter.position.y, critter.r + e.map(critter.minLifeToReproduce, 0, 5, 0, critter.r));

    
        //base critter
        // let critCol = e.color(critter.color[0] * 255, critter.color[1] * 255, critter.color[2] * 255);
        let critCol = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100);

        e.fill(critCol);
        e.noStroke();
        e.ellipse(critter.position.x, critter.position.y, critter.r); 
        e.pop();
    }

    e.monitorFunds = () => { 
        // console.log("monitor Funds")
        // for (let child of document.getElementById("orgList").children) {
        //     console.log(child);
        //     child.remove();
        // }
        //not sure why i can't just remove the children, weird dupe bugs, just removing whole thing and remaking
        if(!e.isCreating){ //had to put this here because fundsUpdate during creation would make it appear
            //remove the three lists so we can remake them?
            if (document.getElementById('orgList')){
                document.getElementById('orgList').remove();
                // document.getElementById('godsDonationList').remove();
                // document.getElementById('godsInvolvementList').remove();

                // e.select('#orgList').hide();
                // e.select('#godsDonationList').hide();
                // e.select('#godsInvolvementList').hide();
            }
            // let listWidth = e.width / 6 + "px";
            // let listHeight = e.height / 3 + "px";
            let listWidth = 5 * e.donationsPanel.width / 7 + "px";
            let listHeight = 8 * e.donationsPanel.height / 9 + "px";
            // //parent div for the panel, will move in and out on fade
            // e.donationsPanelDiv = e.createDiv()
            //     .parent("ecosystemCanvas")
            //     .id("donationsPanel")
                // .position(5 * e.width / 6, 2 * e.height/3)
            //div for the donation targets
            e.orgListDiv = e.createDiv()
                // .parent("ecosystemCanvas")
                .parent("donationsPanelDiv")
                .id("orgList")
                .class("scroll-hide")
                // .position(5 * e.width / 6, 2 * e.height/3)
                .position(e.donationsPanel.x - 3 * e.donationsPanel.width / 8, e.donationsPanel.y - e.donationsPanel.height / 4)
                .style("height", listHeight)
                .style("width", listWidth)
                .style("overflow", "scroll");
            e.createDiv(`TOTAL RAISED: $${parseFloat(e.donations.total.toFixed(2))}`)
                .parent("orgList")
                // .class("orgDivs")
                .class("scroll-text")

            e.createDiv(`&nbsp;`) //space after TOTAL -- should proabably use something else eventually (https://stackoverflow.com/questions/3416454/how-to-make-an-empty-div-take-space)
                .parent("orgList")
                // .class("orgDivs")
                .class("scroll-text")
            // for(let i = 0; i<10; i++) { //just for testing scroll -- eventually might need to show some other way that the list continues
            for (let org of e.donations.sorted) {
                e.createDiv(`${org.target}: $${parseFloat(org.funds.toFixed(2))}`)
                    .parent("orgList")
                    // .class("orgDivs")
                    .class("scroll-text")
            }
            // e.select('#orgList').hide();

            //gods by donation
            // e.godsDonationListDiv = e.createDiv()
            //     .parent("donationsPanel")
            //     .id("godsDonationList")
            //     .class("scroll-hide")
            //     // .position(5 * e.width / 6, 2 * e.height/3)
            //     .style("height", listHeight)
            //     .style("width", listWidth)
            //     .style("overflow", "scroll");
            // e.select('#godsDonationList').hide();
            

            // //gods by involvement
            // e.godsInvolementListDiv = e.createDiv()
            //     .parent("donationsPanel")
            //     .id("godsInvolvementList")
            //     .class("scroll-hide")
            //     // .position(5 * e.width / 6, 2 * e.height/3)
            //     .style("height", listHeight)
            //     .style("width", listWidth)
            //     .style("overflow", "scroll");
            // e.select('#godsInvolvementList').hide();
            
        }
    }

    e.displayStats = () => {
        e.fill(0);
        e.textSize(32);
        e.text(`Community Funds: $${parseFloat(e.stats.communityFunds).toFixed(2)}`, e.width/5, e.height - 50);
        e.text(`My Funds: $${parseFloat(userData.funds).toFixed(2)}`, 2 * e.width / 5, e.height - 50);
        e.text("Critter Count: " + e.stats.critterCount, 3 * e.width / 5, e.height - 50);
        e.text("Life in World: $" + parseFloat(e.stats.worldLife).toFixed(2), 4 * e.width / 5, e.height - 50); //need to make sure it's a float everytime I want to round?
    }

    //god panel -- turned into also being god effects draw
    e.drawGodPanel = () => {
        e.push();
        e.panelFade();
        e.fill(247, 193, 187, 200); //baby pink, slight transparency
        // e.rect(e.godPanel.x, e.godPanel.y, e.godPanel.width, e.godPanel.height);
        // depending on event, diff panel:
        switch(e.actState){
            case "voting":
                e.rect(e.godPanel.x, e.godPanel.y, e.godPanel.width, e.godPanel.height);

                //draw the rankings, participation checkbox, and help tooltip
                // e.image(helpIcon, e.godPanel.x, e.godPanel.y + 2 * e.godPanel.height / 6);
                for (let [i, rank] of e.ranks.entries()) {
                    // rank.show();
                    e.push();
                    e.fill(21, 96, 100);
                    e.textAlign(e.CENTER, e.CENTER);
                    e.text(i+1, e.godPanel.x - 3 * e.godPanel.width / 8 , (e.godPanel.y - e.godPanel.height / 2) + (6 + (3*i)) * e.godPanel.height / 30);
                    e.pop();
                }
                
                if(e.isShowingVotingHelp){
                    e.push();
                    e.fill(238, 232, 44); //yellow
                    e.rect(e.godPanel.rightEdge + e.godPanel.width / 9, e.godPanel.y, 3 * page.width / 16, 4 * page.height / 9);
                    e.pop();
                }
                break;
            case "feast":
                //send server mouse info and feast icon
                socket.emit("feastMovement", {mouseX: e.mouseX, mouseY: e.mouseY, icon: e.feastIcon});
                //draw smaller god panel with event message
                e.rect(e.godPanel.x, 2 * e.godPanel.y / 3, e.godPanel.width, e.godPanel.height / 3);
                e.push();
                e.fill(21, 96, 100);
                e.textAlign(e.CENTER, e.CENTER);
                e.text("click to sprinkle food", e.godPanel.x, 2 * e.godPanel.y / 3);
                e.pop();
                //draw all users' icons
                for (let icon of e.allIcons.feastIcons) {
                    e.text(icon.icon, icon.mouseX, icon.mouseY);
                }
                break;
            case "famine":
                //panel info
                e.rect(e.godPanel.x, 2 * e.godPanel.y / 3, e.godPanel.width, e.godPanel.height / 3);
                e.push();
                e.fill(21, 96, 100);
                e.textAlign(e.CENTER, e.CENTER);
                e.text("all poop goes straight to\ncommunity funds", e.godPanel.x, 2 * e.godPanel.y / 3);
                e.pop();
                //display visual -- based on https://editor.p5js.org/p5/sketches/3D:_sine_cosine_in_3D
                e.push();
                e.translate(e.width/2, e.height/2)
                e.rotate(e.frameCount * 0.01);
                for (let j = 0; j < 8; j++) {
                    e.push();
                    for (let i = 0; i < 50; i++) {
                        e.rotate(e.sin(e.frameCount * 0.001 + j) * 100);
                        e.translate(
                            // e.sin(e.frameCount * 0.001 + j) * 100,
                            e.cos(e.frameCount * 0.001 + j) * 100,
                            i * 0.1
                        );
                        e.text("💀", 0, 0);
                    }
                    e.pop();
                }
                break;
            case "creation":
                e.rect(e.godPanel.x, 2 * e.godPanel.y / 3, e.godPanel.width, e.godPanel.height / 3);
                e.push();
                e.fill(21, 96, 100);
                e.textAlign(e.CENTER, e.CENTER);
                if(e.hasCreatedSeed){
                    e.text('Seed Critter Ready', e.godPanel.x, 2 * e.godPanel.y / 3);
                } else {
                    e.text('Click to Create Possible Seed', e.godPanel.x, 2 * e.godPanel.y / 3);
                }
                e.pop();
                break;
            case "meltdown":
                break;
            case "fire":
                break;
            case "flood":
                //panel info
                e.rect(e.godPanel.x, 2 * e.godPanel.y / 3, e.godPanel.width, e.godPanel.height / 3);
                e.push();
                e.fill(21, 96, 100);
                e.textAlign(e.CENTER, e.CENTER);
                e.text("the world is washed clean", e.godPanel.x, 2 * e.godPanel.y / 3);
                e.pop();
                //act visuals -- based on https://editor.p5js.org/takawo/sketches/73OxurP9W
                e.push();
                const noiseScale = 800;
                let waveHeight = e.width / 8;
                e.colorMode(e.HSB, 360, 100, 100, 100);
                e.blendMode(e.DIFFERENCE);
                for (let h = e.height; h > 0; h -= e.height / 18) {
                    e.push();
                    e.translate(0, h);
                    e.fill(220, 80, 100, 10);
                    e.noStroke();
                    e.beginShape();
                    for (let x = 0; x < e.width; x += 5) {
                      let n = e.noise(x / noiseScale, h*10 / noiseScale, e.frameCount / noiseScale * 5);
                      let y = e.map(n, 0, 1, -waveHeight, waveHeight);
                      e.vertex(x, y);
                    }
                    e.vertex(e.width, e.height);
                    e.vertex(0, e.height);
                    e.endShape(e.CLOSE);
                    e.pop();
                }
                e.pop();
                break;
            case "lightning":
                break;
            default:
                console.log("something weird happening with panel state")
        }
        
        
        e.pop();
    }

    e.panelFade = () => {
        let dir = e.godPanel.dir;
        if (dir == "in") {
            if (e.godPanel.rightEdge < e.godPanel.edgeMax){
                e.godPanel.x += e.godPanel.fadeSpeed;
                e.godPanel.rightEdge += e.godPanel.fadeSpeed;
            } else {
                //at end of fade -- TODO relocate all the stupid show shit here
                if(e.actState == "voting"){
                    e.participationCheckbox.show();
                    for (let dropdown of e.ranks){
                        dropdown.show();
                    }
                    e.helpIcon.show();
                }
                if (e.actState == "creation") {
                    e.communityCreationButton.show();
                }
                return;
            }
        } else {
            //hide all?? gotta be a better way
            e.participationCheckbox.hide();
            for (let dropdown of e.ranks){
                dropdown.hide();
            }
            e.helpIcon.hide();
            e.communityCreationButton.hide();
            //continue fade out
            if (e.godPanel.rightEdge > 0){
                e.godPanel.x -= e.godPanel.fadeSpeed;
                e.godPanel.rightEdge -= e.godPanel.fadeSpeed;
            } else {
                return;
            }
        }
    }

    //donations panel on right
    e.drawDonationsPanel = () => {
        e.push();
        e.donationsPanelFade();
        e.fill(238, 232, 44, 200); //yellow
        e.rect(e.donationsPanel.x, e.donationsPanel.y, e.donationsPanel.width, e.donationsPanel.height);
        e.pop();
    }

    e.donationsPanelFade = () => {
        let dir = e.donationsPanel.dir;
        if (dir == "in") {
            if (e.donationsPanel.leftEdge > e.donationsPanel.edgeMax) {
                e.donationsPanel.x -= e.donationsPanel.fadeSpeed;
                e.donationsPanel.leftEdge -= e.donationsPanel.fadeSpeed;
            } else {
                // e.donationsPanelDiv.show();
                e.select(`#${e.donationsPanelState}`).show();
                // e.orgListDiv.position(e.donationsPanel.x - e.donationsPanel.width / 4, e.donationsPanel.y - e.donationsPanel.height / 4)
                e.orgListDiv.position(e.donationsPanel.x - 3 * e.donationsPanel.width / 8, e.donationsPanel.y - e.donationsPanel.height / 4)
               
                return;
            }
        } else {
            // paranoid about monitor funds getting rid of these
            if (document.getElementById('orgList')){
                e.select('#orgList').hide();
                // e.select('#godsDonationList').hide();
                // e.select('#godsInvolvementList').hide();
            }
            // e.donationsPanelDiv.hide();
            
            //continue fade out
            if (e.donationsPanel.leftEdge < page.width){
                e.donationsPanel.x += e.donationsPanel.fadeSpeed;
                e.donationsPanel.leftEdge += e.donationsPanel.fadeSpeed;
            } else {
                return;
            }
        }
    }

    e.displayTimerAndState = () => {
        e.push();
        e.textAlign(e.LEFT, e.CENTER);
        e.fill(0);
        e.text(`Act of God: ${e.actState}`, .25 * e.width / 16, e.height / 9);
        e.text(`Next Event: ${e.timeLeft}`, .25 * e.width / 16, 8 * e.height / 9);
        e.pop();
    }

    e.rankingChange = (elem) => { //nice! it contains a reference to the element that called it!!
        //if other dropdowns have the most recently selected option, reset them
        let updatedDropdown = e.select(`#${elem.srcElement.id}`);
        for (let dropdown of e.ranks){
            if (dropdown.elt.id != updatedDropdown.elt.id && 
                dropdown.value() == updatedDropdown.value()){
                    dropdown.selected("none");
                }
        }
        //make sure auto participates if changes
        e.participationCheckbox.checked(true);
        // console.log(e.participationCheckbox.checked());
    }

    e.sendVotes = () => {
        let votes = [];
        for (let dropdown of e.ranks) {
            votes.push(dropdown.selected());
        }
        console.log("sending votes: " + votes);
        return [e.participationCheckbox.checked(), votes]; //send votes even if not participating
    }

    //click info overlay

    e.displayInfoOverlay = (critter) => {
        infoGraphics.push();
        infoGraphics.clear();
        infoGraphics.textAlign(e.CENTER);
        infoGraphics.noStroke();
        infoGraphics.imageMode(e.CENTER);
        e.colorMode(e.HSL);
        infoGraphics.colorMode(infoGraphics.HSL); //diff?
        let critterColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100);
        let fadedColor = e.color(critter.color[0] * 360, critter.color[1]  * 100, critter.color[2]  * 100, .4);
        // console.log(fadedColor);
        // let critterColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255);
        // let fadedColor = e.color(critter.color[0] * 255, critter.color[1]  * 255, critter.color[2]  * 255, 100);
        // let backgroundColor = color((1 - critter.color[0]) * 255, (1 - critter.color[1])  * 255, (1 - critter.color[2])  * 255, 100);
        // infoGraphics.background(backgroundColor);
        // infoGraphics.colorMode(e.RGB); //critter colors retain HSL but fills are still RGB? no apparently not? or was it error with the colormode in the first place?

        infoGraphics.colorMode(e.RGB);
        infoGraphics.background(255, 100);
        infoGraphics.colorMode(e.HSL);
    
        
        //name at top
        // infoGraphics.fill(critterColor);
        infoGraphics.fill(0, 0, 0);
        infoGraphics.textSize(e.overlay.textSize + 10);
        infoGraphics.text(critter.name, e.overlay.w / 2, e.overlay.h / 12);
    
        //critter display -- doubled radius of all for visibility
        //for lifeForce aura
        infoGraphics.fill(fadedColor);
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, (critter.r + e.map(critter.life, 0, 5, 0, critter.r)) * 2);
        //show ring if ready to mate
        infoGraphics.noFill();
        if(critter.mateTimer >= critter.refractoryPeriod && critter.life >= critter.minLifeToReproduce){ //isReadyToMate
        //     infoGraphics.stroke(0, 0, 100);
        // }
        // if(critter.isReadyToMate){
            // e.stroke(255);
            infoGraphics.strokeWeight(4);
            infoGraphics.stroke(0, 0, 100);
        }
        // infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, critter.r * 2 + e.map(critter.life, 0, 10, 0, critter.r));
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, (critter.r + e.map(critter.minLifeToReproduce, 0, 5, 0, critter.r)) * 2);

        //base critter
        infoGraphics.fill(critterColor);
        infoGraphics.noStroke();
        infoGraphics.ellipse(e.overlay.w / 2, e.overlay.h / 5, critter.r * 2); 
    
        //critter stats
        infoGraphics.fill(0, 0, 0);
        infoGraphics.textAlign(e.LEFT, e.CENTER);
        infoGraphics.textSize(e.overlay.textSize);
        //life stats
        infoGraphics.text("LIFE: " + critter.life.toFixed(2), e.overlay.w / 24, e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Poop Rate: " + critter.excretionRate.toFixed(2), e.overlay.w / 24, 2 * e.overlay.h / 24 + e.overlay.h / 4);
        //space then donation stats
        infoGraphics.text("1: " + critter.donations[0].target + " -- donated: " + critter.donations[0].total.toFixed(2), e.overlay.w / 24, 4 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("2: " + critter.donations[1].target + " -- donated: " + critter.donations[1].total.toFixed(2), e.overlay.w / 24, 5 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Min Life b4 Donation: " + critter.minLifeToDonate.toFixed(2), e.overlay.w / 24, 6 * e.overlay.h / 24 + e.overlay.h / 4);
        // infoGraphics.text("Donation Timer: " + (floor(critter.donationRate) - critter.donationTimer), e.overlay.w / 24, 8 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Donation Percentage: " + critter.donationPercentage.toFixed(2) * 100 + "%", e.overlay.w / 24, 7 * e.overlay.h / 24 + e.overlay.h / 4);
        //space then mate stats
        infoGraphics.text("Min Life b4 Mate: " + critter.minLifeToReproduce.toFixed(2), e.overlay.w / 24, 9 * e.overlay.h / 24 + e.overlay.h / 4);
        // infoGraphics.text("Mate Timer: " + critter.mateTimer.toFixed(2), e.overlay.w / 24, 12 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Inheritance Percentage: " + critter.parentalSacrifice.toFixed(2) * 100 + "%", e.overlay.w / 24, 10 * e.overlay.h / 24 + e.overlay.h / 4);
        infoGraphics.text("Num Offspring: " + critter.offspring.length, e.overlay.w / 24, 11 * e.overlay.h / 24 + e.overlay.h / 4);
        
        //space then parents -- ooh draw!
        // infoGraphics.fill(critterColor); //parentcolor?
        //first gen vs children
        infoGraphics.textAlign(e.CENTER);
        infoGraphics.text("PARENTS:", e.overlay.w / 2, 19 * e.overlay.h / 24)
        if (critter.ancestry.parents.length == 1) {
            infoGraphics.text(critter.ancestry.parents[0].name, e.overlay.w / 2, 10 * e.overlay.h / 12);
            infoGraphics.image(godIcon, e.overlay.w / 2, 11 * e.overlay.h / 12, 80, 80);
        } else {
            infoGraphics.text(critter.ancestry.parents[0].name, e.overlay.w / 4, 10 * e.overlay.h / 12);
            // infoGraphics.colorMode(e.HSL);
            infoGraphics.fill(critter.ancestry.parents[0].color[0] * 360, critter.ancestry.parents[0].color[1] * 100, critter.ancestry.parents[0].color[2] * 100);
            infoGraphics.ellipse(e.overlay.w / 4, 11 * e.overlay.h / 12, critter.ancestry.parents[0].r);
            // infoGraphics.fill(critterColor);
            infoGraphics.fill(0, 0, 0); //this is HSL
            infoGraphics.text(critter.ancestry.parents[1].name, 3 * e.overlay.w / 4, 10 * e.overlay.h / 12);
            infoGraphics.fill(critter.ancestry.parents[1].color[0] * 360, critter.ancestry.parents[1].color[1] * 100, critter.ancestry.parents[1].color[2] * 100);
            infoGraphics.ellipse(3 * e.overlay.w / 4, 11 * e.overlay.h / 12, critter.ancestry.parents[1].r);
            // infoGraphics.colorMode(e.RGB);
        }
    
        //make sure e.overlay is not off screen
        if(e.overlay.position.x <= e.overlay.w / 2) {e.overlay.position.x = e.overlay.w / 2 + 20};
        if(e.overlay.position.x >= e.width - e.overlay.w / 2) {e.overlay.position.x = e.width - e.overlay.w / 2 - 20};
        if(e.overlay.position.y <= e.overlay.h / 2) {e.overlay.position.y = e.overlay.h / 2 + 20};
        if(e.overlay.position.y >= e.height - e.overlay.h / 2) {e.overlay.position.y = e.height - e.overlay.h / 2 - 20};
    
        //draw e.overlay to canvas
        e.image(infoGraphics, e.overlay.position.x, e.overlay.position.y);
        e.colorMode(e.RGB); //whyyyyy
        infoGraphics.pop();
    }

    
}