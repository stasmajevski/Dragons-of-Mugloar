const fetch = require("node-fetch");
const xml2jsonParser = require('xml2json-light');
const logger = require('./log4js');

const battleAttempts = 100;
let countVictory = 0;
let countBattleAttempts = 0;
let weatherToJson;

for (let i = 0; i < battleAttempts; i++) {
  let game;
  let knight;
  let dragon = {
    "dragon": {
      "scaleThickness": 10,
      "clawSharpness": 5,
      "wingStrength": 4,
      "fireBreath": 1
    }
  }

  fetch('http://www.dragonsofmugloar.com/api/game')
    .then(res => res.json())
    .then(data => getGameId(data))

  function getGameId(data) {
    game = data.gameId;
    knight = data.knight;

    dragon.dragon.scaleThickness = knight.attack;
    dragon.dragon.clawSharpness = knight.armor;
    dragon.dragon.wingStrength = knight.agility;
    dragon.dragon.fireBreath = knight.endurance;

    var maxKnightStat = 0;

    if (knight.attack >= knight.armor && knight.attack >= knight.agility && knight.attack >= knight.endurance) {
      dragon.dragon.scaleThickness += 2;
      dragon.dragon.wingStrength -= 1;
      dragon.dragon.fireBreath -= 1;

      if (dragon.dragon.wingStrength == -1) {
        dragon.dragon.wingStrength = 0;
        dragon.dragon.clawSharpness -= 1;
      }
      if (dragon.dragon.fireBreath == -1) {
        dragon.dragon.fireBreath = 0;
        dragon.dragon.clawSharpness -= 1;
      }
      maxKnightStat = knight.attack;
    }

    if (knight.endurance >= knight.attack && knight.endurance >= knight.armor && knight.endurance >= knight.agility && knight.endurance != maxKnightStat) {
      dragon.dragon.fireBreath += 2;
      dragon.dragon.wingStrength -= 1;
      dragon.dragon.clawSharpness -= 1;

      if (dragon.dragon.wingStrength == -1) {
        dragon.dragon.wingStrength = 0;
        dragon.dragon.scaleThickness -= 1;
      }
      if (dragon.dragon.clawSharpness == -1) {
        dragon.dragon.clawSharpness = 0;
        dragon.dragon.scaleThickness -= 1;
      }
      maxKnightStat = knight.endurance;
    }
    if (knight.armor >= knight.attack && knight.armor >= knight.agility && knight.armor >= knight.endurance && knight.armor != maxKnightStat) {
      dragon.dragon.clawSharpness += 2;
      dragon.dragon.scaleThickness -= 1;
      dragon.dragon.fireBreath -= 1;

      if (dragon.dragon.scaleThickness == -1) {
        dragon.dragon.scaleThickness = 0;
        dragon.dragon.wingStrength -= 1;
      }
      if (dragon.dragon.fireBreath == -1) {
        dragon.dragon.fireBreath = 0;
        dragon.dragon.wingStrength -= 1;
      }

      maxKnightStat = knight.armor;
    }
    if (knight.agility >= knight.attack && knight.agility >= knight.armor && knight.agility >= knight.endurance && knight.agility != maxKnightStat) {
      dragon.dragon.wingStrength += 2;
      dragon.dragon.clawSharpness -= 1;
      dragon.dragon.scaleThickness -= 1;

      if (dragon.dragon.scaleThickness == -1) {
        dragon.dragon.scaleThickness = 0;
        dragon.dragon.fireBreath -= 1;
      }
      if (dragon.dragon.clawSharpness == -1) {
        dragon.dragon.clawSharpness = 0;
        dragon.dragon.fireBreath -= 1;
      }
      max = knight.agility;
    }

    // GET Weather

    fetch(`http://www.dragonsofmugloar.com/weather/api/report/${game}`)
      .then(response => response.text())
      .then(data => getWeather(data))

    function getWeather(xml) {
      weatherToJson = xml2jsonParser.xml2json(xml);

      if (weatherToJson.report.message.includes("The Long Dry")) { // ZEN
        dragon.dragon.scaleThickness = 5;
        dragon.dragon.clawSharpness = 5;
        dragon.dragon.wingStrength = 5;
        dragon.dragon.fireBreath = 5;
      } else if (weatherToJson.report.message.includes("Olympic Games")) { // UMBRELLA
        dragon.dragon.scaleThickness = 5;
        dragon.dragon.wingStrength = 5;
        dragon.dragon.clawSharpness = 10;
        dragon.dragon.fireBreath = 0;
      }

      // PUT dragon

      fetch(`http://www.dragonsofmugloar.com/api/game/${game}/solution`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dragon)
        })
        .then(res => res.json())
        .then(data => getBattleStatus(data))
    }
  }

  function getBattleStatus(battle) {
    
    countBattleAttempts++;

    if (battle.status == "Victory") {
      countVictory++;
    }

    logger.LOG(battle.status + ': ' + battle.message + ": " + JSON.stringify(dragon.dragon) + JSON.stringify(knight));

    if (countBattleAttempts == battleAttempts) {
      logger.LOG("Successful battles " + countVictory + '/' + battleAttempts);
      logger.LOG("*********************************************************************************");
    }
  }
}