const Mode = require('./coiffeurmodes/Mode');
const ModeList = require('./coiffeurmodes/ModeList');

const {
    ModeHearts,
    ModeClubs,
    ModeSpades,
    ModeDiamonds,
    ModeUp,
    ModeDown,
} = require('./coiffeurmodes/AllModes');

class SuperSachSchieberModelist extends ModeList {
    constructor() {
        super();

        super.addModeAll([
            new ModeClubs(2),
            new ModeHearts(1),
            new ModeSpades(2),
            new ModeDiamonds(1),
            new ModeDown(3),
            new ModeUp(4),
        ])
    }
}


module.exports = SuperSachSchieberModelist;