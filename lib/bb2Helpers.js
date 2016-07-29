/* global module */

'use strict';

// include npm packages
var xml2js = require('xml2js'),
    StreamZip = require('node-stream-zip'),
    Promise = require('promise'),
    async = require('async'),
    _ = require('lodash');

// get package.json information
var pjson = require('../package');

/**
 * Convert replay xml data to json
 * @param {string} text - the xml replay file structure
 * @param {requestCallback} next - callback function
 * @return {requestCallack} next
 */
function textToJson(text, next) {
  xml2js.parseString(text,
      {
        normalizeTags: true,
        explicitArray: false,
        trim: true,
        valueProcessors: [xml2js.processors.parseNumbers]
      }, function (err, result) {
    if (err)
      return next(err);
    next(null, result);
  });
}

/**
 * read zip file
 * @param {string} file - the path to the file to be read
 */
function readZipXml(file) {
  var zip,
      newError = new Error();

  return new Promise(function (resolve, reject) {
    zip = new StreamZip({
      file: file,
      storeEntries: true
    });

    zip.on('error', function (err) {
      reject(err);
    });

    zip.on('ready', function () {
      if (zip.entriesCount !== 1) {
        newError = {
          name: 'FileIncorrect',
          message: 'The provided zipe file isn\'t a valid BBII file replay \n\
- The zip file doesn\'t less or more than 1 file.'
        };
        reject(newError);
      }

      var data = zip.entryDataSync(Object.keys(zip.entries())[0]);

      textToJson(data, function (err, result) {
        if (err) {
          newError = {
            name: 'replayFileIncorrect',
            message: 'The provided zipe file isn\'t a valid BBII file replay \n\
- Can\'t convert replay xml file to json'
          };
        }
        resolve(result);
      });
    });
  });
}

/**
 * Return match analysis data of a BB2 replay file
 * @param {string} file - the path to the file to be read
 * @param {requestCallback} next - callback function
 * @return {requestCallback} next
 */
var matchData = function (file, next) {
  readZipXml(file)
      .then(function (data) {
        var gameDetails = extractGameDetails(data);

        var playerDetails = {};
        var actionsList = [];
        extractPlayerDetails(data, 0, playerDetails);
        extractPlayerDetails(data, 1, playerDetails);

        for (var stepIndex = 0; stepIndex < data.replay.replaystep.length;
            stepIndex++) {
          var replayStep = data.replay.replaystep[stepIndex];
          //extractPlayerDetails(replayStep, playerDetails);
          extractActionsFromStep(replayStep, actionsList);
        }

        return  next(null, {
          gameDetails: gameDetails,
          playerDetails: playerDetails,
          actions: actionsList,
          bbReplayVersion: pjson.version
        });

      })
      .catch(function (err) {
        return next(err);
      });
};

module.exports = matchData;

// https://developer.mozilla.org/en-US/docs/JXON#Algorithm_.233.3A_a_synthetic_technique
function parseText(sValue) {
  if (/^\s*$/.test(sValue)) {
    return null;
  }
  if (/^(?:true|false)$/i.test(sValue)) {
    return sValue.toLowerCase() === "true";
  }
  if (isFinite(sValue)) {
    return parseFloat(sValue);
  }
  //this will convert text that contains a dot to bogus dates if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
  return sValue;
}

function getJXONTree(oXMLParent) {
  var vResult = /* put here the default value for empty nodes! */ true, nLength = 0, sCollectedTxt = "";
  /*
   if (oParentNode.hasAttributes && oXMLParent.hasAttributes()) {
   vResult = {};
   for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
   oAttrib = oXMLParent.attributes.item(nLength);
   vResult["@" + oAttrib.name.toLowerCase()] = parseText(oAttrib.value.trim());
   }
   }
   */
  if (oXMLParent.hasChildNodes()) {
    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
      oNode = oXMLParent.childNodes.item(nItem);
      if (oNode.nodeType === 4) {
        sCollectedTxt += oNode.nodeValue;
      } /* nodeType is "CDATASection" (4) */
      else if (oNode.nodeType === 3) {
        sCollectedTxt += oNode.nodeValue.trim();
      } /* nodeType is "Text" (3) */
      else if (oNode.nodeType === 1 && !oNode.prefix) { /* nodeType is "Element" (1) */
        if (nLength === 0) {
          vResult = {};
        }
        sProp = oNode.nodeName.toLowerCase();
        vContent = getJXONTree(oNode);
        if (vResult.hasOwnProperty(sProp)) {
          if (vResult[sProp].constructor !== Array) {
            vResult[sProp] = [vResult[sProp]];
          }
          vResult[sProp].push(vContent);
        } else {
          vResult[sProp] = vContent;
          nLength++;
        }
      }
    }
  }
  if (sCollectedTxt) {
    nLength > 0 ? vResult.keyValue = parseText(sCollectedTxt) : vResult = parseText(sCollectedTxt);
  }
  /* if (nLength > 0) { Object.freeze(vResult); } */
  return vResult;
}

function extractGameDetails(jsonObject) {
  var firstStep = jsonObject.replay.replaystep[0],
      lastStep = jsonObject.replay.replaystep[jsonObject.replay.replaystep.length - 1],
      lastStepRes = lastStep.ruleseventgamefinished.matchresult;

  return {
    leagueName: firstStep.gameinfos.rowleague.name,
    competitionName: firstStep.gameinfos.rowcompetition.name,
    stadiumName: firstStep.gameinfos.namestadium,
    finished: lastStepRes.row.finished,
    homeTeam: {
      data: {
        coachName: firstStep.gameinfos.coachesinfos.coachinfos[0].userid,
        coachid: lastStepRes.coachresults.coachresult[0].coachid,
        teamName: firstStep.boardstate.listteams.teamstate[0].data.name,
        raceId: firstStep.boardstate.listteams.teamstate[0].data.idrace,
        value: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.value || 0,
        popularity: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.popularity || 0,
        treasury: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.treasury || 0,
        apothecary: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.apothecary || 0,
        reroll: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.reroll || 0,
        logo: lastStepRes.coachresults.coachresult[0].teamresult.teamdata.logo,
        idteam: lastStepRes.coachresults.coachresult[0].teamresult.idteam
      },
      result: {
        score: lastStepRes.row.homescore || 0,
        nbsupporters: lastStepRes.coachresults.coachresult[0].teamresult.nbsupporters || 0,
        fame: lastStepRes.coachresults.coachresult[0].teamresult.fame || 0,
        winningsdice: lastStepRes.coachresults.coachresult[0].teamresult.winningsdice || 0,
        cashearned: lastStepRes.coachresults.coachresult[0].teamresult.cashearned || 0,
        popularitygain: lastStepRes.coachresults.coachresult[0].teamresult.popularitygain || 0
      },
      stats: {
        imvp: lastStepRes.row.homemvp || 0,
        inflictedpasses: lastStepRes.row.homeinflictedpasses || 0,
        inflictedcatches: lastStepRes.row.homeinflictedcatches || 0,
        inflictedinterceptions: lastStepRes.row.homeinflictedinterceptions || 0,
        inflictedcasualties: lastStepRes.row.homeinflictedcasualties || 0,
        inflictedtackles: lastStepRes.row.homeinflictedtackles || 0,
        inflictedpushouts: lastStepRes.row.homeinflictedpushouts || 0,
        inflictedstuns: lastStepRes.row.homeinflictedstuns || 0,
        inflictedko: lastStepRes.row.homeinflictedko || 0,
        inflictedinjuries: lastStepRes.row.homeinflictedinjuries || 0,
        inflicteddead: lastStepRes.row.homeinflicteddead || 0,
        inflictedmetersrunning: lastStepRes.row.homeinflictedmetersrunning || 0,
        inflictedmeterspassing: lastStepRes.row.homeinflictedmeterspassing || 0,
        inflictedpossessionball: lastStepRes.row.homepossessionball || 0,
        sustainedinterceptions: lastStepRes.row.homesustainedinterceptions || 0,
        sustainedcasualties: lastStepRes.row.homesustainedcasualties || 0,
        sustainedtackles: lastStepRes.row.homesustainedtackles || 0,
        sustainedstuns: lastStepRes.row.homesustainedstuns || 0,
        sustainedko: lastStepRes.row.homesustainedko || 0,
        sustainedinjuries: lastStepRes.row.homesustainedinjuries || 0,
        sustaineddead: lastStepRes.row.homesustaineddead || 0,
        occupationtheir: lastStepRes.row.homeoccupationtheir || 0,
        occupationown: lastStepRes.row.homeoccupationown || 0
      }
    },
    awayTeam: {
      data: {
        coachName: firstStep.gameinfos.coachesinfos.coachinfos[1].userid,
        coachid: lastStepRes.coachresults.coachresult[1].coachid,
        teamName: firstStep.boardstate.listteams.teamstate[1].data.name,
        raceId: firstStep.boardstate.listteams.teamstate[1].data.idrace,
        value: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.value || 0,
        popularity: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.popularity || 0,
        treasury: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.treasury || 0,
        apothecary: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.apothecary || 0,
        reroll: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.reroll || 0,
        logo: lastStepRes.coachresults.coachresult[1].teamresult.teamdata.logo,
        idteam: lastStepRes.coachresults.coachresult[1].teamresult.idteam
      },
      result: {
        score: lastStepRes.row.awayscore || 0,
        nbsupporters: lastStepRes.coachresults.coachresult[1].teamresult.nbsupporters || 0,
        fame: lastStepRes.coachresults.coachresult[1].teamresult.fame || 0,
        winningsdice: lastStepRes.coachresults.coachresult[1].teamresult.winningsdice || 0,
        cashearned: lastStepRes.coachresults.coachresult[1].teamresult.cashearned || 0,
        popularitygain: lastStepRes.coachresults.coachresult[1].teamresult.popularitygain || 0
      },
      stats: {
        imvp: lastStepRes.row.awaymvp || 0,
        inflictedpasses: lastStepRes.row.awayinflictedpasses || 0,
        inflictedcatches: lastStepRes.row.awayinflictedcatches || 0,
        inflictedinterceptions: lastStepRes.row.awayinflictedinterceptions || 0,
        inflictedcasualties: lastStepRes.row.awayinflictedcasualties || 0,
        inflictedtackles: lastStepRes.row.awayinflictedtackles || 0,
        inflictedpushouts: lastStepRes.row.awayinflictedpushouts || 0,
        inflictedstuns: lastStepRes.row.awayinflictedstuns || 0,
        inflictedko: lastStepRes.row.awayinflictedko || 0,
        inflictedinjuries: lastStepRes.row.awayinflictedinjuries || 0,
        inflicteddead: lastStepRes.row.awayinflicteddead || 0,
        inflictedmetersrunning: lastStepRes.row.awayinflictedmetersrunning || 0,
        inflictedmeterspassing: lastStepRes.row.awayinflictedmeterspassing || 0,
        inflictedpossessionball: lastStepRes.row.awaypossessionball || 0,
        sustainedinterceptions: lastStepRes.row.awaysustainedinterceptions || 0,
        sustainedcasualties: lastStepRes.row.awaysustainedcasualties || 0,
        sustainedtackles: lastStepRes.row.awaysustainedtackles || 0,
        sustainedstuns: lastStepRes.row.awaysustainedstuns || 0,
        sustainedko: lastStepRes.row.awaysustainedko || 0,
        sustainedinjuries: lastStepRes.row.awaysustainedinjuries || 0,
        sustaineddead: lastStepRes.row.awaysustaineddead || 0,
        occupationtheir: lastStepRes.row.awayoccupationtheir || 0,
        occupationown: lastStepRes.row.awayoccupationown || 0
      }
    }
  };
}

function translateStringNumberList(str) {
  if (!str)
    return [];

  var stripped = str.substring(1, str.length - 1);
  var textList = stripped.split(",");

  var numberList = [];
  for (var i = 0; i < textList.length; i++) {
    numberList.push(parseInt(textList[i]));
  }
  return numberList;
}

function extractPlayerDetails(data, teamIndex, playerDetails) {
  _.map(data.replay.replaystep[data.replay.replaystep.length - 1].
      ruleseventgamefinished.matchresult.coachresults.coachresult[teamIndex].
      teamresult.playerresults.playerresult,
      function (p) {
        var player;
        player = {
          name: p.playerdata.name,
          id: p.playerdata.id,
          number: p.playerdata.number,
          ma: p.playerdata.ma,
          st: p.playerdata.st,
          ag: p.playerdata.ag,
          av: p.playerdata.av,
          type: p.playerdata.idplayertypes,
          xp: p.playerdata.experience || 0,
          stats: {}
        };
        if (typeof p.playerdata.listskills !== 'undefined')
          player.skills = JSON.parse("[" + p.playerdata.listskills.
              replace('(', '').replace(')', '') + "]");
        else
          player.skills = [];
        if (typeof p.playerdata.listcasualties !== 'undefined')
          player.casualty = JSON.parse("[" + p.playerdata.listcasualties.
              replace('(', '').replace(')', '') + "]");
        else
          player.casualty = [];
        if (typeof p.xp !== 'undefined')
          player.stats.acquiredxp = p.xp;
        else
          player.stats.acquiredxp = 0;
        if (typeof p.casualty1 !== 'undefined')
          player.stats.casualty = p.casualty1;
        else
          player.stats.casualty = null;
        _.map(p.statistics, function (s, key) {
          player.stats[key] = s;
        });
        playerDetails[player.id] = player;
      });
}

/*
 function extractPlayerDetails(replayStep, playerDetails) {
 var teamStates = (((replayStep || {}).boardstate || {}).listteams || {}).teamstate;
 if (!teamStates || teamStates.length < 2)
 return;
 
 extractPlayerDetailsFromTeamState(teamStates[0], playerDetails);
 extractPlayerDetailsFromTeamState(teamStates[1], playerDetails);
 }
 
 function extractPlayerDetailsFromTeamState(teamState, playerDetails) {
 var players = ((teamState || {}).listpitchplayers || {}).playerstate;
 if (!players)
 return;
 
 for (var i = 0; i < players.length; i++) {
 var player = players[i];
 if (!(player.id in playerDetails)) {
 playerDetails[player.id] = {
 id: player.id,
 teamId: player.data.teamid || 0,
 type: player.data.idplayertypes,
 name: player.data.name
 // player.data.name is sometimes useful but not populated for hired players
 };
 }
 }
 }
 */

function extractActionsFromStep(replayStep, actionsList) {
  var kickoffDetails = extractKickoffDetails(replayStep);
  if (kickoffDetails) {
    actionsList.push(kickoffDetails);
  }

  var actions = replayStep.ruleseventboardaction;
  if (actions && actions.length) {
    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
      var action = actions[actionIndex];
      processAction(replayStep, action, actionsList);
    }
  }
  else if (actions) {
    processAction(replayStep, actions, actionsList);
  }
}

function processAction(replayStep, action, actionsList) {
  if (!action)
    return;

  var results = action.results.boardactionresult;
  if (results && results.length) {
    for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
      var result = results[resultIndex];
      processResult(replayStep, action, result, actionsList);
    }
  } else {
    processResult(replayStep, action, results, actionsList);
  }
}

function processResult(replayStep, action, result, actionsList) {
  if (!result)
    return;

  if (result.coachchoices && result.coachchoices.listdices) {
    var actionDetails = extractActionDetails(replayStep, action, result);

    if (actionDetails) {
      actionsList.push(actionDetails);
    }
  }
}

function extractActionDetails(replayStep, action, result) {
  if (ignoreResult(result)) {
    return null;
  }

  var dice = translateDice(result.coachchoices.listdices, result.rolltype);

  // Translate kickoff scatters to their own type
  if (result.rolltype === 10 && dice.length > 1) {
    result.rolltype = -2;
  }

  return {
    team: replayStep.boardstate.activeteam || 0,
    turn: replayStep.boardstate.listteams.teamstate[replayStep.boardstate.activeteam || 0].gameturn || 0,
    player: action.playerid,
    rollType: result.rolltype,
    dice: dice
  };
}

function ignoreResult(result) {
  // As far as I can tell, this comes up when a reroll was possible but not used
  if (result.rollstatus === 2) {
    return true;
  }

  // This is the foul penalty - the roll is already covered by an armour roll
  if (result.rolltype === 15) {
    return true;
  }

  // This is some sort of wrestle roll which doesn't do anything
  if (result.rolltype === 61) {
    return true;
  }

  // Some sort of piling-on roll that isn't the armor or the injury roll
  if (result.rolltype === 63) {
    return true;
  }

  // Block dice have dice repeated for the coaches selection, resulttype is missing for the second one
  if (result.rolltype === 5 && result.resulttype !== 2) {
    return true;
  }

  // Just guessing at this
  if (result.rolltype === 8 && result.resulttype !== 2 && result.subresulttype !== 1) {
    // Replay Coach-551-9619f4910217db1915282ea2242c819f_2016-04-07_00_05_06, Furry Bears turn 8 crowdsurf injury, shouldn't be ignored
    if (result.subresulttype !== 12) {
      return true;
    }
  }

  return false;
}

function translateDice(dice, rollType) {
  var diceList = translateStringNumberList(dice);

  // For some reason block dice have an extra set of dice at the end
  if (rollType === 5) {
    diceList = diceList.slice(0, diceList.length / 2);
  }
  // Casualty dice are also doubled up, and also both rolls appear when an apoc is used (so the last one is the valid one)
  else if (rollType === 8) {
    diceList = diceList.slice(0, diceList.length / 2);
    diceList = [diceList[diceList.length - 1]];
  }

  return diceList;
}

function extractKickoffDetails(replayStep) {
  if (!replayStep.ruleseventkickofftable)
    return null;

  return {
    team: replayStep.boardstate.activeteam || 0,
    turn: replayStep.boardstate.listteams.teamstate[replayStep.boardstate.activeteam || 0].gameturn || 0,
    player: null,
    rollType: -1,
    dice: translateDice(replayStep.ruleseventkickofftable.listdice, -1)
  };
}