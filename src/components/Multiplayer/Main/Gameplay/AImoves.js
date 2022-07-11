import React from 'react'
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment} from "firebase/firestore";
import { CheckNeighbors } from './CheckNeighbors'
import { RiverBonus } from './RiverBonus';
import { MoveCommand, AttackCommand, AttackCommand2 } from './Commands';
import { SovietFightingTerritories } from '../svgComponents/MainMap';

const primaryLine = ["Riga", "Aizkraukle", "Jekabpils", "Daugavpils", "Kraslava", "Moiry", "Verkhnyadzvinsk",
   "Navapolatsk", "Sumilna", "Vitebsk", "UnnaBeshenkovichi", "Orsa", "Chavusy", "Bykhaw",
   "Kanhnho", "Svietlahorsk", "Kapmaebl", "Chojniki", "Chernobyl", "Boryspil", "Pereyaslav-Khmelnytskyi", "Shramkivka", "Lazirky",
   "Lubny", "Myrhorod", "Poltava", "Mahdalynivka", "Synelnykove", "Zaporozhe", "Enerhodor",
   "Nova Kakhovka", "Kherson"]

export async function AImoves(gameId, user){

   const docRefAi = doc(db, "games", gameId, "players", "AI");
   const docSnapAi = await getDoc(docRefAi);
   const docRefGame = doc(db, "games", gameId);
   const docSnapGame = await getDoc(docRefGame);
   const docRefGerFront = doc(db, "games", gameId, "frontline", "german");
   const docSnapGerman = await getDoc(docRefGerFront);
   const docRefSovFront = doc(db, "games", gameId, "frontline", "soviet");
   const docSnapSoviet = await getDoc(docRefSovFront);
   const docRefGerman = doc(db, "games", gameId, "german", "territories");
   

   var availablePoints = docSnapAi.data().pointsToSpend;

   //select random soviet front territory
   const sovietTerritories = docSnapSoviet.data().territories;
   const randomTerritoryNumber = Math.floor(Math.random()*sovietTerritories.length);
   const randomTerritory = sovietTerritories[randomTerritoryNumber];
   const docRefRandom = doc(db, "games", gameId, "territories", randomTerritory)
   const docSnapRandom = await getDoc(docRefRandom);
   const neighbors = docSnapRandom.data().neighbors;
   const faction = docSnapRandom.data().controlledBy;

   aiAttack();

   async function aiAttack(){

      //choose territory to attack
      var enemyTerr = [];
      for (let i = 0; i < neighbors.length; i++){
         const docSnap = await getDoc(doc(db, "games", gameId, "territories", neighbors[i]))
         if (faction !== docSnap.data().controlledBy){
            enemyTerr.push(neighbors[i])
         }
      }
      const chosenToAttack = enemyTerr[Math.floor(Math.random()*enemyTerr.length)]
      
      const docRefFrom = doc(db, "games", gameId, "territories", randomTerritory);
      const docSnapFrom = await getDoc(docRefFrom);
      const factionFrom = docSnapFrom.data().controlledBy;
      const docRefTo = doc(db, "games", gameId, "territories", chosenToAttack);
      const docSnapTo = await getDoc(docRefTo);   
      const factionTo = docSnapTo.data().controlledBy;
      

      //attack cost
      const docRefHumanPlayer = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
      const docSnapHumanPlayer = await getDoc(docRefHumanPlayer) 
      
      const humanInfantryResearchLevel = docSnapHumanPlayer.data().infantryResearchLevel;
      const humanTankResearchLevel = docSnapHumanPlayer.data().tankResearchLevel;
      const aiInfantryResearchLevel = docSnapAi.data().infantryResearchLevel;
      const aiTankResearchLevel = docSnapAi.data().tankResearchLevel;

      const tankAttack = docSnapTo.data().tankDivs;
      const infAttack = docSnapTo.data().infDivs;
      const tankDefence = docSnapTo.data().tankDivs;
      const infDefence = docSnapTo.data().infDivs;
      const fortificationNum = docSnapTo.data().defenceLevel;
      const basicDefenceBonus = 1.3;
      const riverDefenceBonus = RiverBonus(randomTerritory, chosenToAttack);

      const power = Number((tankAttack*5*(1+0.2*aiTankResearchLevel)+infAttack*(1+0.2*aiInfantryResearchLevel)).toFixed(1));
      const powerDefence = Number(((tankDefence*5*(1+0.2*humanTankResearchLevel)+infDefence*(1+0.2*humanInfantryResearchLevel)+(2*fortificationNum))*basicDefenceBonus*(1+0.4*fortificationNum)).toFixed(1))
      
      var cost = Math.floor((powerDefence*riverDefenceBonus/power)*4+1);

      await updateDoc(doc(db, "games", gameId, "players", "AI"), {
         pointsToSpend: increment(-cost),
      });


      async function moveBases(){
         if (factionFrom === "germany"){

            for(let i = 0; i<primaryLine.length; i++){
               if(chosenToAttack === primaryLine[i]){
                  const docRefActions = doc(db, "games", gameId, "ww2", "actions");
                  updateDoc(docRefActions, {
                     daugavaDniperBroken: true
                  })
               }
            }

            //Move bases forward
            if (chosenToAttack === "Riga" || chosenToAttack === "Leningrad"|| chosenToAttack === "Pskov"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesNorth: arrayUnion(chosenToAttack)
               })
            }
            if (chosenToAttack === "Brzesc Litewski" || chosenToAttack === "Minsk"|| chosenToAttack === "Smolensk"
            || chosenToAttack === "Vyazma"|| chosenToAttack === "Moscow"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesCenter: arrayUnion(chosenToAttack)
               })
            }
            if (chosenToAttack === "Lwow" || chosenToAttack === "Kiev"|| chosenToAttack === "Kharkov"
            || chosenToAttack === "Voroshilovgrad" || chosenToAttack === "Stalingrad"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesSouth: arrayUnion(chosenToAttack)
               })
            }
            if (chosenToAttack === "Odessa" || chosenToAttack === "Sevastopol"|| chosenToAttack === "Maikop"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesDeepSouth: arrayUnion(chosenToAttack)
               })
            }

         } else {
                  
            if (chosenToAttack === "Riga" || chosenToAttack === "Leningrad"|| chosenToAttack === "Pskov"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesNorth: arrayRemove(chosenToAttack)
               })
            }
            if (chosenToAttack === "Brzesc Litewski" || chosenToAttack === "Minsk"|| chosenToAttack === "Smolensk"
            || chosenToAttack === "Vyazma"|| chosenToAttack === "Moscow"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesCenter: arrayRemove(chosenToAttack)
               })
            }
            if (chosenToAttack === "Lwow" || chosenToAttack === "Kiev"|| chosenToAttack === "Kharkov"
            || chosenToAttack === "Voroshilovgrad" || chosenToAttack === "Stalingrad"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesSouth: arrayRemove(chosenToAttack)
               })
            }
            if (chosenToAttack === "Odessa" || chosenToAttack === "Sevastopol"|| chosenToAttack === "Maikop"){
               const docRefActions = doc(db, "games", gameId, "ww2", "actions");
               updateDoc(docRefActions, {
                  RFBasesDeepSouth: arrayRemove(chosenToAttack)
               })
            }
         }
      }
      async function shatter(){
         //shattered Divisions
         var shattTankDef;
         var shattInfDef;
         var shattTankAtt;
         var shattInfAtt;
         
         function shatteredInfDivs(strength){
            const shattInfDet = Math.floor(strength/20);
            const shattInfProb = (strength % 20)*5/100;
            if (Math.random() < shattInfProb){
               return shattInfDet +1;
            } else {
               return shattInfDet
            }
         }
         if (tankInput > 0){
            const shattTankAttProb = powerDefence/60;
            if (Math.random() < shattTankAttProb){
               shattTankAtt = 1;
               shattInfAtt = 0;
            } else {
               shattInfAtt = shatteredInfDivs(powerDefence)
               shattTankAtt = 0;
            }
         } else {
            shattInfAtt = shatteredInfDivs(powerDefence)
            shattTankAtt = 0;
         }
         if (tankTo > 0){
            const shattTankDefProb = power/60;
            if (Math.random() < shattTankDefProb){
               shattTankDef = 1;
               shattInfDef = 0;
            } else {
               shattInfDef = shatteredInfDivs(power)
               shattTankDef = 0;
            }
         } else {
            shattInfDef = shatteredInfDivs(power)
            shattTankDef = 0;
         }

         const remainingInfAtt = infantryInput-shattInfAtt;
         const remainingTanksAtt = tankInput-shattTankAtt;

         if (remainingTanksAtt > 0){updatedTerritoryToAttack = "tank"}
         if (remainingTanksAtt === 0 & remainingInfAtt > 0){updatedTerritoryToAttack = "inf"}

         updateDoc(docRefTo, {
            infDivs: remainingInfAtt,
            tankDivs: remainingTanksAtt,
            lastAttack: currentTime
         })
         updateDoc(docRefFrom, {
            infDivs: infantryFrom - infantryInput,
            tankDivs: tankFrom - tankInput,
         })
      }
      async function retreat(){
         console.log("retreat start")
         if (retreatableNeighbors === []){
            alert("encircled and shattered");
         } else {
            for (let i = 0; i < infantryTo-shattInfDef; i++){
               const position = Math.floor(Math.random()*retreatableNeighbors.length);
               const retreatTer = retreatableNeighbors[position];
               const docSnap = await getDoc(doc(db, "games", gameId, "territories", retreatTer));
               const infantryCount = docSnap.data().infDivs + 1
               
               updateDoc(doc(db, "games", gameId, "territories", retreatTer),{
                  infDivs: infantryCount
               })
               
            }
            for (let i = 1; i < tankTo-shattTankDef; i++){
               const position = Math.floor(Math.random()*neighbors.length);
               const retreatTer = retreatableNeighbors[position];
               const docSnap = await getDoc(doc(db, "games", gameId, "territories", retreatTer));
               const tankCount = docSnap.data().tankDivs +1;
               updateDoc(doc(db, "games", gameId, "territories", retreatTer),{
                  tankDivs: tankCount
               })
            }
         }
      }
      async function updateEconomy(){
         if (factionFrom === "Germany"){
            updateDoc(docRefGame, {
               germanTerritoryPoints: increment(economyTo),
               sovietTerritoryPoints: increment(-economyTo),
            })
            
         }
         if (factionFrom === "Russia"){
            updateDoc(docRefGame, {
               germanTerritoryPoints: increment(-economyTo),
               sovietTerritoryPoints: increment(economyTo),
            })
         }
      }
      async function updateFrontline(){
         const neighbors = docSnapTo.data().neighbors;
         var docRefAttack;
         var docRefDefence;

         if (factionFrom === "Germany"){
            docRefAttack = doc(db, "games", gameId, "frontline", "german");
            docRefDefence = doc(db, "games", gameId, "frontline", "soviet");
         } else {
            docRefAttack = doc(db, "games", gameId, "frontline", "soviet");
            docRefDefence = doc(db, "games", gameId, "frontline", "german");
         }

         await updateDoc(docRefAttack, {
            territories: arrayUnion(chosenToAttack)
         })
         await updateDoc(docRefDefence, {
            territories: arrayRemove(chosenToAttack)
         })

         var hostileBeforeChange = await hostileNeighbors(gameId, neighbors, docSnapTo); 
         await updateDoc(docRefTo, {
            controlledBy: docSnapFrom.data().controlledBy,
            defenceLevel: 0,
         })
         for(let i = 0; i<hostileBeforeChange.length; i++){
            const hostileFree = await CheckNeighbors(gameId, hostileBeforeChange[i]);
            if (hostileFree){
               await updateDoc(docRefAttack, {
                  territories: arrayRemove(hostileBeforeChange[i])
               })
            }
         }
         var friendlyBeforeChange = await friendlyNeighbors(gameId, neighbors, docSnapTo); 
         for(let i = 0; i<friendlyBeforeChange.length; i++){
            const hostileFree = await CheckNeighbors(gameId, friendlyBeforeChange[i]);
            if (hostileFree ){}
            else {
               const docSnapFrontLine = await getDoc(docRefDefence)
               const territories = docSnapFrontLine.data().territories;
               for(let j = 0; j<territories.length; j++){
                  if (friendlyBeforeChange[i]=== territories[j]){
                     //nothing
                  } else {
                     await updateDoc(docRefDefence, {
                        territories: arrayUnion(friendlyBeforeChange[i])
                     })
                  }
               }
            }
         }
      }
      async function updateMap(){

         var updatedTerritoryFrom = "empty";
         var updatedTerritoryToAttack = "inf";
         if(updatedTankFrom > 0){updatedTerritoryFrom = "tank"}
         if(updatedInfFrom > 0 & updatedTankFrom === 0){updatedTerritoryFrom = "inf"}


         if (updatedTerritoryFrom === "tank") {   //not moving all tanks
         //nothing to update
         } else {   
            if (factionFrom === "Russia"){

            }
            await updateDoc(docRefGerman, {
               territories: arrayRemove({name: randomTerritory, path: oldSelection.path, type: oldTerritoryFrom, })
            })
            await updateDoc(docRefGerman, {
               territories: arrayUnion({name: randomTerritory, path: oldSelection.path, type: updatedTerritoryFrom})
            })
         }
         await updateDoc(docRefGerman, {
            territories: arrayUnion({name: selection.name, path: selection.path, type: updatedTerritoryToAttack})
         })
      }

      shatter();
      var retreatableNeighbors = [];
      retreatableNeighbors = await retreatNeighbors(gameId, neighbors, docSnapTo);
      retreat();
      moveBases();
      updateEconomy();
      updateFrontline();
      updateMap();

   

   


   
      const docSnapGerman = await getDoc(docRefGerman);
      //return(docSnapGerman.data().territories);
      //props.setSelectedTerritories(selectedT);
            
   }
   







   async function aiMove(){
      cost = 3;
      await updateDoc(doc(db, "games", gameId, "players", "AI"), {
         pointsToSpend: increment(-cost),
      })
   }
   // if (docRefRandom.data().tankDivs*5+docRefRandom.data().infDivs > 10){}
   if (docSnapAi.data().pointsToSpend < 6){
   }  else {

      //Reinforce
      
      updateDoc(docRefRandom, {
         infDivs: increment(2),
         tankDivs: increment(0),
      })
      updateDoc(docRefRandom, {
         infDivs: increment(2),
         tankDivs: increment(0),
      })
   }
   if (docSnapGame.data().lastAiMove === 2){
      if (docSnapAi.data().pointsToSpend < 30){
      }  else {

         //Reinforce for attack
         const randomTerritoryNumber = Math.floor((Math.random()*sovietTerritories.length));
         const randomTerritory = sovietTerritories[randomTerritoryNumber];
         const docRefRandom = doc(db, "games", gameId, "territories", randomTerritory)
         updateDoc(docRefRandom, {
            infDivs: increment(4),
            tankDivs: increment(2),
         })
         updateDoc(docRefAi, {
            pointsToSpend: increment(-20),
         })
      }
   } 
}

/*
for(let i = length-50; i<germanTerritories.length; i++){
      const chosenTerritory = germanTerritories[i];
   }
*/


/*
   const docRefFrom = doc(db, "games", gameId, "territories", oldSelectionName);
   const docSnapFrom = await getDoc(docRefFrom);
   const infantryFrom = docSnapFrom.data().infDivs;
   const tankFrom = docSnapFrom.data().tankDivs;
   const factionFrom = docSnapFrom.data().controlledBy;
   const lastAttack = docSnapFrom.data().lastAttack;
   const docRefTo = doc(db, "games", gameId, "territories", chosenToAttack);
   const docSnapTo = await getDoc(docRefTo);   
   const infantryTo = docSnapTo.data().infDivs;
   const tankTo = docSnapTo.data().tankDivs;
   const economyTo = docSnapTo.data().economyLevel
   const updatedInfFrom = infantryFrom - infantryInput;
   const updatedTankFrom = tankFrom - tankInput;
   const oldTerritoryFrom = oldSelection.type;
   */