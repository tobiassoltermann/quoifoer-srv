const Mode = require('./Mode');

class Mode3x3 extends Mode {
    constructor(multiplier) {
        super("3x3", multiplier, 'trump3');
    }
}


module.exports = {
    Mode3x3
};