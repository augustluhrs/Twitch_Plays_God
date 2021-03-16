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

socket.on('currentAct', (data) => {
    console.log("current act: " + data.actState);
    ecosystemSketch.actState = data.actState;
});

// socket.on('refresh', () => {
//     location.reload();
// });