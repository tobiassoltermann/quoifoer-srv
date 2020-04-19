class SchieberScores {
    constructor(modes) {
        this.modes = modes;
        this.scores = {
            scoreItems: [],
            totalTeam1: 0,
            totalTeam2: 0,
            team1Name: 'Team 1',
            team2Name: 'Team 2',
            mode: "Schieber",
        }
    }
    addScore(scoreObject) {
        this.scores.scoreItems.push(scoreObject);
    }

    updateTotals() {
        this.scores.totalTeam1 = 
            this.scores.scoreItems.reduce( (acc, currentValue) => {
                return acc + (currentValue.scoreTeam1 * currentValue.multiplier);
            }, 0);
        this.scores.totalTeam2 = 
            this.scores.scoreItems.reduce( (acc, currentValue) => {

                return acc + (currentValue.scoreTeam2 * currentValue.multiplier);
            }, 0);
    }

    updateTeamname(oneOrTwo, teamname) {
        this.scores["team" + oneOrTwo + "Name"] = teamname;
    }

    render() {
        this.updateTotals();
        return Object.assign({}, this.scores);
    }
}

module.exports = SchieberScores;