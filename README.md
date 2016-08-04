BBReplay
========
A nodejs module that reads Blood Bowl replay files

## Installation
Simplest way to install `bbreplay` is to use [npm](http://npmjs.org), just `npm
install bbreplay` which will download bbreplay and all dependencies.

## Usage
```javascript
var bbreplay = require('bbreplay');
var file = 'path to your BB2 replay file';

bbreplay.getBB2replay(file)
    .then(function (result) {
        console.log(result);
    })
    .catch(function (err) {
        console.log(err);
    });
```  

## Documentation
### bbreplay.getBB2replay(file)

__Arguments__
+ `file` - path to the BB2 replay file.

#### Returned object
    {
        gameDetails: {
            fileName: replay file name,
            leagueName: league name,
            competitionName:  competition name,
            stadiumName: stadium name,
            finished: game end date and hour,
            homeTeam: {
                coachName: home team coach name,
                coachid: home team coach id,
                teamName: home team name,
                raceId: home team race id,
                value: home team TV,
                popularity: home team popularity,
                treasury: home team treasury,
                apothecary: home team apothecary,
                reroll: home team reroll,
                logo: home team logo,
                idteam: home team id
            }
            awayTeam: {
                coachName: away team coach name,
                coachid: away team coach id,
                teamName: away team name,
                raceId: away team race id,
                value: away team TV,
                popularity: away team popularity,
                treasury: away team treasury,
                apothecary: away team apothecary,
                reroll: away team reroll,
                logo: away team logo,
                idteam: away team id
            }
        },
        playerDetails: { //one line per player
            '1': { // id used in actions
                team: team index, // 0: home, 1:away
                name: player name,
                id: player id used in actions,
                number: player number,
                ma: player MA,
                st: player ST,
                ag: player AG,
                av: player AV,
                type: player type id,
                level: player level,
                xp: player XP,
                skills: array of skill id,
                casualty: array of casualty id ,
                stats: { // game player statistics
                    acquiredxp: acquired experience during the game,
                    casualty: game casualty,
                    inflictedtackles: 1, // stats keys depends of player performances
                    sustainedtackles: 3,
                    sustainedinjuries: 1,
                    matchplayed: 1,
                    idplayerlisting: player id
                }
            }
        },
        actions: [ // array of actions
            { team: 0(home)-1(away), 
                turn: 0, // match turn
                player: 43, // player id
                rollType: -2, // roll Type see below
                dice: [array of dice roll] },
        ],
        results: {
            match row information
        },
        bbReplayVersion: version of bbrepplay that generates the data
    }  

#### Roll Type
+ -2 - Kickoff Scatter if 2 dices (D6 + D6)
+ -2 - Pass Scatter if 3 dices (D8 + D6 + D6)
+ -1 - Kickoff (D6 + D6)
+ 1 - GFI (D6)
+ 2 - Dodge (D6)
+ 3 - Armour (D6)
+ 4 - Injury (D6)
+ 5 - Block (Block Dice)
+ 6 - Stand up (D6)
+ 7 - Pickup (D6)
+ 8 - Casualty (D6)
+ 9 - Catch (D6)
+ 10 - Scatter (D8)
+ 11 - Throw in (D6)
+ 12 - Pass (D6)
+ 16 - Intercept (D6)
+ 17 - Wake-Up After KO (D6)
+ 20 - Bone-Head (D6
+ 21 - Really Stupid (D6)
+ 22 - Wild Animal (D6)
+ 23 - Loner (D6)
+ 24 - Landing (D6)
+ 26 - Inaccurate Pass Scatter (D8)
+ 27 - Always Hungry (D6)
+ 29 - Dauntless (D6)
+ 31 - Jump Up (D6)
+ 34 - Stab (D6)
+ 36 - Leap (D6)
+ 37 - Foul Appearance (D6)
+ 40 - Take Root (D6)
+ 42 - Hail Mary Pass (D6)
+ 46 - Hypnotic Gaze (D6)
+ 54 - Fireball (D6)
+ 55 - Lightning Bolt (D6)
+ 56 - Throw Team-Mate (D6)
+ 58 - Kickoff Gust (D6)
+ 59 - Armour (D6) // pre-piling on roll
+ 60 - Injury (D6) // pre-piling on roll


__Examples__
```js
var file = 'file.bbrz';

bbreplay.getBB2replay(file)
    .then(function (result) {
        // results is an object with match data
        console.log(result);
    })
    .catch(function(err) {
        console.log(err);
    });
});
```
## Acknowledgments
Part of the code, especially replay file decoding, is inspired by [bonnici]
(https://www.reddit.com/user/bonnici) and its [onesandskulls] 
(http://onesandskulls.com/) web site.

## Versions
version 0.4.3 : Add file name    
version 0.4.2 : Add level into player object  
version 0.4.1 : Add team info into player object  
version 0.4.0 : Include team and player statistics in the returned object  
version 0.3.0 : Use promise instead of asynchrone function with callback  
version 0.2.0 : Code refactoring  
version 0.1.0 : First implementation of the library with one function 
'getMatchResults' that returns BB2 match result as json object

## Getting support
Please, if you have a problem with the library, first make sure you read this
README. If you read this far, thanks, then please make sure your
problem really is with `bbreplay`. It is? Okay, then open an issue.
