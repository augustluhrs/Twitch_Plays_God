//worried about hacking, but fine because eventually will be checked against server info

//open and connect the input socket
let socket = io('/');

//listen for the confirmation of connection 
socket.on('connect', function(){
    console.log('connected to server');
});

socket.on('update', (updates) => {
    ecosystemSketch.ecosystem = updates; 
});

socket.on('fundsUpdate', (conduit) => {
    console.log("fundsUpdate")
    ecosystemSketch.donations.sorted = conduit.donations;
    ecosystemSketch.donations.total = conduit.totalRaised;
    ecosystemSketch.monitorFunds();
});

// socket.on('userFundsUpdate', (data) => { //need to rename stuff
//     console.log("updating user funds")
//     userData.funds = data.funds;
// });

socket.on('statsUpdate', (update) => {
    ecosystemSketch.stats.critterCount = update.critterCount;
    ecosystemSketch.stats.worldLife = update.worldLife;
    ecosystemSketch.stats.communityFunds = update.communityFunds;
});

socket.on('clickInfo', (data) => {
    console.log(data.critter)
    if (data.client == socket.id && data.critter != undefined) {
        // console.log('info received');
        ecosystemSketch.overlay.position = data.position;
        ecosystemSketch.overlay.critter = data.critter;
        ecosystemSketch.isDisplayingInfo = true;
    }
});

socket.on('timer', (data) => {
    // console.log(data)
    ecosystemSketch.timeLeft = data.timeLeft;
});

socket.on('currentAct', (data) => { //this is real messy but gotta run with it for now
    console.log("current act: " + data.actState);
    ecosystemSketch.actState = data.actState;
    if(ecosystemSketch.hasSetup){ //to prevent undefined errors
        if (data.actState != "voting"){
            ecosystemSketch.participationCheckbox.hide();
            for (let rank of ecosystemSketch.ranks) {
                rank.hide();
            }
            ecosystemSketch.helpIcon.hide();
        } else {
            //when start of new voting round, turn off participation by default
            // if (ecosystemSketch.participationCheckbox != undefined) { //event happens before setup
                // ecosystemSketch.participationCheckbox.show();
            ecosystemSketch.participationCheckbox.checked(false);
            // }
        }
        if (data.actState == "feast") {
            ecosystemSketch.isFeast = true;
        } else {
            ecosystemSketch.isFeast = false;
        }
        if (data.actState == "creation") {
            ecosystemSketch.hasCreatedSeed = false;
            ecosystemSketch.communityCreationButton.show();
        } else {
            // ecosystemSketch.isFeast = false;
            ecosystemSketch.communityCreationButton.hide();
        }
    }
});

socket.on('getVotes', (data) => {
    // if (ecosystemSketch.participationCheckbox.checked()){
    //only send votes if participating -- nvm, need to reset user array in server
    let [isParticipating, votes] = ecosystemSketch.sendVotes();
    socket.emit("voting", {isParticipating: isParticipating, rankings: votes});
    // }
});

socket.on("feastMovement", (data) => {
    ecosystemSketch.allIcons.feastIcons = data;
});

socket.on("getSeedCritters", (data) => {
    console.log("checking for seed");
    if (ecosystemSketch.hasCreatedSeed) {
        console.log(`sending seed critter: ${communityCritter}`);
        socket.emit("plantSeedCritter", {critter: communityCritter});
    }
});

// socket.on('refresh', () => {
//     location.reload();
// });