//gotta be a better way of doing this, but fine as a placeholder

function Defaults(){
    this.width = 1980;
    this.height = 1080;
}

Defaults.prototype.map = (n, start1, stop1, start2, stop2) => {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    return newval;
}

//gaussian random thanks to https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve/49434653#49434653
Defaults.prototype.rand_bm = (min, max, skew) => {
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

module.exports = Defaults;