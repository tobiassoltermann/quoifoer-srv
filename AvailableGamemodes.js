const CoiffeurImplementation = require('./gamerules/CoiffeurImplementation');
const SchieberImplementation = require('./gamerules/SchieberImplementation');
AvailableGamemodes = {
    coiffeur: {
        label: 'Coiffeur',
        implementation: CoiffeurImplementation,
    },
    schieber: {
        label: 'Schieber',
        implementation: SchieberImplementation,
    }
};

module.exports = AvailableGamemodes;