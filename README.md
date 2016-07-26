BBReplay
========
A nodejs module that reads Blood Bowl replay files

## Installation
Simplest way to install `bbreplay` is to use [npm](http://npmjs.org), just `npm
install bbreplay` which will download bbreplay and all dependencies.

## Usage
```javascript
var bbreplay = require('bbreplay');
var params = {
        replay: 'path to your BB2 replay file'
    }

bbreplay(params, function (err, result) {
    console.log(result);
});

```  

## Documentation
### bbreplay(params, callback)

__Arguments__
+ `params` - An object with the parameters to be used by the function
  + `replay` - path to the BB2 replay file.
+ `callback(err, res)` - A callback which is called when the function
 has finished, or an error occurs.
  + `err` - null if no error occurs during match replay processing, information 
about the error otherwise.
  + `res` - object with match data.

#### Returned object
    {
        gameDetails: {
            stadiumName: 'name of the stadium',
            homeTeam: {
                coachName: 'name of the home team coach',
                teamName: 'name of the home team',
                raceId: home team race id,
                score: home team TD
            }
            awayTeam: {
                coachName: 'name of the away team coach',
                teamName: 'name of the away team',
                raceId: away team race id,
                score: away team TD
            }
        },
        playerDetails: { //one line per player
            '1': { // id used in actions
                id: 1, // id used in actions
                teamId: 0(home)-1(away),
                type: 20, //player type
                name: 'player name' 
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
        bbReplayVersion: version of bbrepplay that genrates the result
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
var params = {
    replay: 'file.bbrz'
};

bbreplay(params, function (err, result) {
    // results is an object with match data
    console.log(result);
});
```
## Acknowledgments
Part of the code, especially replay file decoding, is inspired by [bonnici]
(https://www.reddit.com/user/bonnici) and its [onesandskulls] 
(http://onesandskulls.com/) web site.

## Versions
version 0.2.0 : Code refactoring  
version 0.1.0 : First implementation of the library with one function 
'getMatchResults' that returns BB2 match result as json object

## Getting support
Please, if you have a problem with the library, first make sure you read this
README. If you read this far, thanks, then please make sure your
problem really is with `bbreplay`. It is? Okay, then open an issue.
