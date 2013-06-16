"use strict";
// Player variables
var playerHealth;
var playerMaxHealth;
var playerMana;
var playerMaxMana;
var playerDamage;
var playerMAttackCost;
var playerHealCost;
var playerName;
var displayTurn;

// Player display variables
var playerContainer;
var playerNameDisplay;
var playerHpDisplay;
var playerManaDisplay;

// Enemy Variables
var dragonHealth;
var dragonMaxHealth;
var dragonDamage;
var healthBar;

// Game variables
var curTurn; // The current turn
var actions; // List of actions
var actionLogDisplay; // Action log textarea on page
var starter; // The start of page
var btnRestart;
var gameContainer; // Game div
var dragonCanvas; // Dragon canvas ELEMENT
var dragonCanvasContext; // Dragon canvas DRAW CONTEXT
var playing; // See if game is playing

// Initilizes the variables and starts the game
function init(newGame){
  
  curTurn = Math.round(Math.random());
  displayTurn = true;
  playerHealth = playerMaxHealth = 550;
  playerMana = playerMaxMana = 60;
  dragonHealth = dragonMaxHealth = 1400;
  if(newGame){
    definePageElements();
    buttonEvents();
    playerDamage = 1;
    playerMAttackCost = 10;
    playerHealCost = 20;
    dragonDamage = 10;
    healthBar = {x: 20,y:10,width:300,height:40};
    playerName = "";
  }
  updateCanvas();
  updateDisplay();
}

function updateCanvas(){
  dragonCanvasContext.clearRect(0,0,dragonCanvas.width,dragonCanvas.height);
  if(dragonHealth <= 0) return;
  dragonCanvasContext.fillStyle = "rgb(200,0,0)";
  dragonCanvasContext.fillRect(healthBar.x,healthBar.y,
    dragonHealth / dragonMaxHealth * healthBar.width,healthBar.height);
}

// Defines all the page elements such as health span
function definePageElements(){
  playerContainer = document.getElementsByClassName("hero")[0];
  var temp = playerContainer.getElementsByTagName("span");
  for(var i = 0; i < temp.length; i++){
    switch(temp[i].className){
      case "health":
        playerHpDisplay = temp[i];
        break;
      case "mana":
        playerManaDisplay = temp[i];
        break;
      default:
        console.log("Unidentified player span " + temp[i].name);
    }
  }
  actions = [];
  actionLogDisplay = document.getElementById("action-log");
  starter = document.getElementsByClassName("starter")[0];
  temp = document.getElementById("fight-button");
  gameContainer = document.getElementById("game-container");
  addEvent(temp,'click',startGame,false);
  dragonCanvas = document.getElementById("dragon-info");
  dragonCanvasContext = dragonCanvas.getContext('2d');
  temp = null;
}

function startGame(){
  playerName = document.getElementById("enter-name").value;
  playerName = playerName == " " || playerName == "" ? "Hero" : playerName;
  starter.className += " hide";
  var temp = playerContainer.getElementsByTagName("h1");
  temp = temp[0];
  temp.innerHTML = playerName;
  updateDisplay();
  gameContainer.className = "container";
  healthBar.width = dragonCanvas.width;
  updateCanvas();
  playing = true;
  setTimeout(gameLoop,33);
}
function restart(){
  btnRestart.className = "hide";
  actionLogDisplay.innerHTML = "";
  init(false);
  playing = true;
  setTimeout(gameLoop,33);
}

// Attaches the listeners for the buttons.
function buttonEvents(){
  // Grabs the hero wrapper so I can limit my element search to it
  // !IMPORTANT! getElementsByClassName is not supported in IE<9
  //Will switch over to JQuery later
  // Write post on why period at end of buttons declaration
  // didn't throw an error.
  var buttons = playerContainer.getElementsByTagName("button");
  if(!buttons) console.log("Could not find buttons under hero class");
  for(var i = 0; i < buttons.length; i++){
    switch(buttons[i].name){
      case "attack":
        addEvent(buttons[i],'click',playerAttack,false);
        break;
      case "magic":
        addEvent(buttons[i],'click',playerMagicAttack,false);
        break;
      case "heal":
        addEvent(buttons[i],'click',useHealSpell,false);
        break;
      default:
        console.log("The " + buttons[i].name + " button has no event");
    }
  }
  btnRestart = document.getElementById("restart");
  addEvent(btnRestart,'click',restart,false);
}

// Updates the status of the player
function updateDisplay(){
  if(playerHealth < 0){playerHealth = 0;}
  if(playerMana < 0){playerMana = 0;}
  playerHpDisplay.innerHTML = playerHealth;
  playerManaDisplay.innerHTML = playerMana;
}

// Use the current item
function useHealSpell(){
  if(!playing){return;}
  if(playerMana >= playerHealCost){
    playerMana -= playerHealCost;
    playerDamage = getRandom(90,150);
    playerHealth += playerDamage;
    updateLog(playerName + " has regained "+ playerDamage+" HP!");
    updateDisplay();
    curTurn = 1;
  }else{
    updateLog("NOT ENOUGH MANA!")
  }
}

function rollCrit(rate){
  var chance = getRandom(0,100);
  if(chance <= rate){
    updateLog("CRIT!");
    return 2;
  }
  return 1;
}

// Deal damage to the dragon
function playerAttack(){
  if(!playing){return;}
  // Do player attack
  playerDamage = getRandom(70,120) * rollCrit(20);
  dragonHealth -= playerDamage;
  updateCanvas();
  updateLog(playerName +" has done "+playerDamage +" points of damage!");
  curTurn = 1;
}

// Deal magic damage to the dragon
function playerMagicAttack(){
  if(!playing){return;}
  playerDamage = getRandom(40,160);
  if(playerMana >= playerMAttackCost){
    dragonHealth -= playerDamage;
    updateCanvas();
    updateLog(playerName +" has done "+playerDamage +" points of magic damage!")
    playerMana -= playerMAttackCost;
    updateDisplay();
    curTurn = 1;
  }else{
    alert("You do not have enough mana!");
  }
}

// Deal damage to the player
function dragonAttack(){
  dragonDamage = getRandom(35,70);
  playerHealth -= dragonDamage;
  updateLog("The dragon has inflicted "+ dragonDamage + " points of damage!");
  curTurn = 0;
}

function endGame(){
  btnRestart.className = " ";
  playing = false;
}

// The game loop
function gameLoop(){
  // Win / lose check
  if(playerHealth <= 0){
    updateLog(playerName + " has lost! :(");
    endGame();
    return;
  }else if(dragonHealth <= 0){
    updateLog(playerName + " is victorious! :D");
    endGame();
    return;
  }
  // Players turn. Must implement better way to handle turn change
  if(curTurn == 0){
    if(displayTurn) {
      updateLog("Players Turn");
      displayTurn = false;
    }
  }else if(curTurn == 1){
    // Dragons turn
    updateLog("Dragon's Turn");
    dragonAttack();
    updateDisplay();
    displayTurn = true;
  }
  setTimeout(gameLoop,33);
}

// Updates the action log on the screen. Auto adds a new line character
function updateLog(text){
  actionLogDisplay.innerHTML = 
    text + "\n" + actionLogDisplay.innerHTML;
}

// Adds events to object
function addEvent(eventTaker,evt,handlerFunction,potato){
  // Can't remember what that last parameter was.
  // I know it wasn't particularly important so ill call it potato.
  if(eventTaker.addEventListener){
    eventTaker.addEventListener(evt,handlerFunction,potato);
  }else if(eventTaker.attachEvent){
    eventTaker.attachEvent(evt,handlerFunction,potato);
  }
}
// Generates a random number within the given range
function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

window.onload = function(){
  init(true);
}