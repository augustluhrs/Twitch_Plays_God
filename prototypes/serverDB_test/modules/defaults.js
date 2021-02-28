//placeholder for DIY functions from p5

const worldSize = {
    width: 1920,
    height: 1080
}

let foodScale = 0.1; //not const so community can adjust?

function map(n, start1, stop1, start2, stop2) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    return newval;
}

// function rand_bm(min, max, skew) { // (box-mueller)
//     let u = 0, v = 0;
//     while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
//     while(v === 0) v = Math.random();
//     let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
//     console.log(`1 num: ${num}`)

//     num = num / 10.0 + 0.5; // Translate to 0 -> 1
//     console.log(`2 num: ${num}`)

//     if (num > 1 || num < 0) {
//         num = randn_bm(min, max, skew);
//     } // resample between 0 and 1 if out of range
//     num = Math.pow(num, skew); // Skew
//     console.log(`3 num: ${num}`)

//     num *= max - min; // Stretch to fill range
//     num += min; // offset to min
//     console.log(`4 num: ${num}`)
//     return num;
// }

//changing to just min,max
function rand_bm(min, max) { // (box-mueller)
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // console.log(`1 num: ${num}`)
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    // console.log(`2 num: ${num}`)
    if (num > 1 || num < 0) {
        num = randn_bm(min, max);
    } // resample between 0 and 1 if out of range
    // console.log(`3 num: ${num}`)
    num *= max - min; // Stretch to fill range
    // console.log(`4 num: ${num}`)
    num += min; // offset to min
    console.log(`5 num: ${num}`)
    return num;
}

function generate_ID() { //grabbed from https://gist.github.com/gordonbrander/2230317 -- thanks!
    return '_' + Math.random().toString(36).substr(2, 9);
}

//thanks to Tim Down https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


// module.exports = Defaults;
module.exports.worldSize = worldSize;
module.exports.map = map;
module.exports.rand_bm = rand_bm;
module.exports.generate_ID = generate_ID;
module.exports.hexToRgb = hexToRgb;
module.exports.foodScale = foodScale;


/*
//gotta be a better way of doing this, but fine as a placeholder
class Defaults {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        // this.width = 3840;
        // this.height = 2160;
    }

    map(n, start1, stop1, start2, stop2) {
        const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        return newval;
    }

    //gaussian random thanks to https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/49434653#49434653
    rand_bm(min, max, skew) { // (box-mueller)
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }
}
*/