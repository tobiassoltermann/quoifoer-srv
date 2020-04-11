class ModeList {
    constructor() {
        this.modes = {}
    }

    addMode(mode) {
        this.modes[mode.name] = mode;
    }

    addModeAll(list) {
        list.forEach((mode) => {
            this.addMode(mode)
        });
    }
    isCardPlayable(){
        
    }

    getModeByMultiplier(multiplier) {
        var foundMode = Object.values(this.modes).find( (crtMode) => {
            return crtMode.getMultiplier() == multiplier;
        } )
        return foundMode
    }

    length() { 
        return Object.keys(this.modes).length;
    }

    allModes() {
        return Object.values(this.modes);
    }
}

module.exports = ModeList;