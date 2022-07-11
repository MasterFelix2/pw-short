import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment} from "firebase/firestore";
import { CheckNeighbors } from './CheckNeighbors';

export async function MoveCommand(gameId, user, pts, selection, cost, tankInput, infantryInput, oldSelectionName, attackedSelection, oldSelection){

   const docRefGerman = doc(db, "games", gameId, "german", "territories");

   var updatedTerritoryFrom = "empty";
   var updatedTerritoryToMove = "inf";

   const docRefFrom = doc(db, "games", gameId, "territories", oldSelectionName);
   const docSnapFrom = await getDoc(docRefFrom);
   const infantryFrom = docSnapFrom.data().infDivs;
   const tankFrom = docSnapFrom.data().tankDivs;
   const lastAttack = docSnapFrom.data().lastAttack;

   const docRefTo = doc(db, "games", gameId, "territories", attackedSelection);
   const docSnapTo = await getDoc(docRefTo);   
   const infantryTo = docSnapTo.data().infDivs;
   const tankTo = docSnapTo.data().tankDivs;

   const updatedInfTo = parseInt(infantryTo) + parseInt(infantryInput);
   const updatedTankTo = parseInt(tankTo) + parseInt(tankInput);
   const updatedInfFrom = infantryFrom - infantryInput;
   const updatedTankFrom = tankFrom - tankInput;
   const oldTerritoryFrom = oldSelection.type;
   const oldTerritoryTo = selection.type;
   const currentTime = Date.now();

   const timeSinceLastAttack = Math.floor((currentTime - lastAttack)/1000/60);
   if(updatedTankFrom > 0){updatedTerritoryFrom = "tank"}
   if(updatedInfFrom > 0 & updatedTankFrom === 0){updatedTerritoryFrom = "inf"}
   if(updatedTankTo > 0){updatedTerritoryToMove = "tank"}
   if(updatedInfTo > 0 & updatedTankTo === 0){ updatedTerritoryToMove = "inf" }

   const shortCooldown = 150;
      
   if (pts.pts < cost || timeSinceLastAttack < shortCooldown){
      if(timeSinceLastAttack > shortCooldown){
         alert("Not enough points. You have " + pts.pts + " / " + cost + " points.")
         return;
      } else {
         alert("Still on cooldown. " + timeSinceLastAttack + " / "+ shortCooldown +" minutes have passed.")
         return;
      }
   }

   updateDoc(docRefTo, {
      infDivs: infantryInput+infantryTo,
      tankDivs: tankInput+tankTo,
      lastAttack: currentTime,
   })
   updateDoc(docRefFrom, {
      infDivs: infantryFrom-infantryInput,
      tankDivs: tankFrom+tankInput,
   })

   if (updatedTerritoryFrom === "tank") {   //not moving all tanks
      //nothing to update
   } else {   
      await updateDoc(docRefGerman, {
         territories: arrayRemove({name: oldSelection.name, path: oldSelection.path, type: oldTerritoryFrom})
      })
      await updateDoc(docRefGerman, {
         territories: arrayUnion({name: oldSelection.name, path: oldSelection.path, type: updatedTerritoryFrom})
      })
   }

   if (oldTerritoryTo === updatedTerritoryToMove){
      //nothing to update
   } else {
      await updateDoc(docRefGerman, {
         territories: arrayRemove({name: selection.name, path: selection.path, type: oldTerritoryTo})
      })
      await updateDoc(docRefGerman, {
         territories: arrayUnion({name: selection.name, path: selection.path, type: updatedTerritoryToMove})
      })
   }
   
   const docSnapGerman = await getDoc(docRefGerman);
   return(docSnapGerman.data().territories)

}

const primaryLine = ["Riga", "Aizkraukle", "Jekabpils", "Daugavpils", "Kraslava", "Moiry", "Verkhnyadzvinsk",
   "Navapolatsk", "Sumilna", "Vitebsk", "UnnaBeshenkovichi", "Orsa", "Chavusy", "Bykhaw",
   "Kanhnho", "Svietlahorsk", "Kapmaebl", "Chojniki", "Chernobyl", "Boryspil", "Pereyaslav-Khmelnytskyi", "Shramkivka", "Lazirky",
   "Lubny", "Myrhorod", "Poltava", "Mahdalynivka", "Synelnykove", "Zaporozhe", "Enerhodor",
   "Nova Kakhovka", "Kherson"]

async function retreatNeighbors(gameId, neighbors, docSnapTo){
   var retreatableNeighbors = [];
   for (let i = 0; i < neighbors.length; i++){
      const docSnap = await getDoc(doc(db, "games", gameId, "territories", neighbors[i]))
      if (docSnap.data().controlledBy === docSnapTo.data().controlledBy){
         retreatableNeighbors.push(neighbors[i])
      }
   }
   return retreatableNeighbors
}
async function hostileNeighbors(gameId, neighbors, docSnapTo){
   var hostileBorderTerritories = [];
   
   for (let i = 0; i < neighbors.length; i++){
      const docSnap = await getDoc(doc(db, "games", gameId, "territories", neighbors[i]))
      if (docSnap.data().controlledBy !== docSnapTo.data().controlledBy){
         hostileBorderTerritories.push(neighbors[i])
      }
   }
   return hostileBorderTerritories
}
async function friendlyNeighbors(gameId, neighbors, docSnapTo){
   var friendlyBorderTerritories = [];
   
   for (let i = 0; i < neighbors.length; i++){
      const docSnap = await getDoc(doc(db, "games", gameId, "territories", neighbors[i]))
      if (docSnap.data().controlledBy === docSnapTo.data().controlledBy){
         friendlyBorderTerritories.push(neighbors[i])
      }
   }
   return friendlyBorderTerritories
}

export async function AttackCommand(gameId, user, pts, selection, cost, tankInput, infantryInput,  power, powerDefence, oldSelectionName, attackedSelection, oldSelection){

   const docRefGame = doc(db, "games", gameId);
   const docRefFrom = doc(db, "games", gameId, "territories", oldSelectionName);
   const docSnapFrom = await getDoc(docRefFrom);
   const infantryFrom = docSnapFrom.data().infDivs;
   const tankFrom = docSnapFrom.data().tankDivs;
   const factionFrom = docSnapFrom.data().controlledBy;
   const lastAttack = docSnapFrom.data().lastAttack;

   const docRefTo = doc(db, "games", gameId, "territories", attackedSelection);
   const docSnapTo = await getDoc(docRefTo);   
   const infantryTo = docSnapTo.data().infDivs;
   const tankTo = docSnapTo.data().tankDivs;
   const neighbors = docSnapTo.data().neighbors;
   const economyTo = docSnapTo.data().economyLevel

   const updatedInfFrom = infantryFrom - infantryInput;
   const updatedTankFrom = tankFrom - tankInput;
   const oldTerritoryFrom = oldSelection.type;
   const currentTime = Date.now();

   const longCooldown = 300;
   const timeSinceLastAttack = Math.floor((currentTime - lastAttack)/1000/60);

   if (pts < cost){
      alert("Not enough points. You need " + cost + " points.");
      return;
   } else if (timeSinceLastAttack < longCooldown){
      alert(alert("Still on cooldown. " + timeSinceLastAttack + " / "+ longCooldown+ " minutes have passed"));
      return;
   }

   var updatedTerritoryFrom = "empty";
   var updatedTerritoryToAttack = "inf";
   if(updatedTankFrom > 0){updatedTerritoryFrom = "tank"}
   if(updatedInfFrom > 0 & updatedTankFrom === 0){updatedTerritoryFrom = "inf"}

   var retreatableNeighbors = [];

   const docRefGerman = doc(db, "games", gameId, "german", "territories");

   //move bases forward & broken first line
   if (factionFrom === "germany"){

      for(let i = 0; i<primaryLine.length; i++){
         if(attackedSelection === primaryLine[i]){
            const docRefActions = doc(db, "games", gameId, "ww2", "actions");
            updateDoc(docRefActions, {
               daugavaDniperBroken: true
            })
         }
      }

      //Move bases forward
      if (attackedSelection === "Riga" || attackedSelection === "Leningrad"|| attackedSelection === "Pskov"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesNorth: arrayUnion(attackedSelection)
         })
      }
      if (attackedSelection === "Brzesc Litewski" || attackedSelection === "Minsk"|| attackedSelection === "Smolensk"
      || attackedSelection === "Vyazma"|| attackedSelection === "Moscow"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesCenter: arrayUnion(attackedSelection)
         })
      }
      if (attackedSelection === "Lwow" || attackedSelection === "Kiev"|| attackedSelection === "Kharkov"
      || attackedSelection === "Voroshilovgrad" || attackedSelection === "Stalingrad"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesSouth: arrayUnion(attackedSelection)
         })
      }
      if (attackedSelection === "Odessa" || attackedSelection === "Sevastopol"|| attackedSelection === "Maikop"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesDeepSouth: arrayUnion(attackedSelection)
         })
      }

   } else {
            
      if (attackedSelection === "Riga" || attackedSelection === "Leningrad"|| attackedSelection === "Pskov"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesNorth: arrayRemove(attackedSelection)
         })
      }
      if (attackedSelection === "Brzesc Litewski" || attackedSelection === "Minsk"|| attackedSelection === "Smolensk"
      || attackedSelection === "Vyazma"|| attackedSelection === "Moscow"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesCenter: arrayRemove(attackedSelection)
         })
      }
      if (attackedSelection === "Lwow" || attackedSelection === "Kiev"|| attackedSelection === "Kharkov"
      || attackedSelection === "Voroshilovgrad" || attackedSelection === "Stalingrad"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesSouth: arrayRemove(attackedSelection)
         })
      }
      if (attackedSelection === "Odessa" || attackedSelection === "Sevastopol"|| attackedSelection === "Maikop"){
         const docRefActions = doc(db, "games", gameId, "ww2", "actions");
         updateDoc(docRefActions, {
            RFBasesDeepSouth: arrayRemove(attackedSelection)
         })
      }
   }    

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

   //shattered Divisions
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
   retreatableNeighbors = await retreatNeighbors(gameId, neighbors, docSnapTo);
   retreat();

   if (updatedTerritoryFrom === "tank") {   //not moving all tanks
   //nothing to update
   } else {   
      await updateDoc(docRefGerman, {
         territories: arrayRemove({name: oldSelection.name, path: oldSelection.path, type: oldTerritoryFrom, })
      })
      await updateDoc(docRefGerman, {
         territories: arrayUnion({name: oldSelection.name, path: oldSelection.path, type: updatedTerritoryFrom})
      })
   }
   await updateDoc(docRefGerman, {
      territories: arrayUnion({name: selection.name, path: selection.path, type: updatedTerritoryToAttack})
   })

   //Update territory based economy
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

   //Update controlleyBy in territories and reduce fortification level to 0
   
   const docSnapGerman = await getDoc(docRefGerman);
   return(docSnapGerman.data().territories);

}
export async function AttackCommand2 (gameId, oldSelectionName, attackedSelection){
   //check if they territories of the attacking factions are removed from frontline
   //territories of attacking faction bordering conquered territory 
   //check ct if any hostile except for the conquered territory.
   const docRefFrom = doc(db, "games", gameId, "territories", oldSelectionName);
   const docSnapFrom = await getDoc(docRefFrom);
   const factionFrom = docSnapFrom.data().controlledBy;
   const docRefTo = doc(db, "games", gameId, "territories", attackedSelection);
   const docSnapTo = await getDoc(docRefTo);   
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
      territories: arrayUnion(attackedSelection)
   })
   await updateDoc(docRefDefence, {
      territories: arrayRemove(attackedSelection)
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

export async function ArchiveGame (gameId,){
   /*
   console.log("archive")
   const docSnapGame = await getDoc(doc(db, "games", gameId));
   for(let i = 0; i<(docSnapGame.data().players).length; i++){

      if(docSnapGame.data().players === "AI"){
         return;
      }
      const cycleUserId = docSnapGame.data().players[i];

      const docRefPlayers = doc(db, "games", gameId, "players", cycleUserId);
      const docSnapPlayers = await getDoc(docRefPlayers);
      const position = docSnapPlayers.data().position;
      
      const docRefTerritories = doc(db, "games", gameId, "german", "territories");
      const docSnapTerritories = await getDoc(docRefTerritories)

      const docRefPastGame = doc(db, "users", cycleUserId, "pastGames", docSnapGame.data().id);
      
      if ((victory === 10 & position === "Germany") || (victory === -10 & position === "Russia")){
         updateDoc(doc(db, "users", cycleUserId),{
            wins: increment(1)
         });
         setDoc(docRefPastGame, {
         victory: "yes",
         id: docSnapGame.data().id,
         scenario: docSnapGame.data().scenario,
         playersGermany: docSnapGame.data().playersGermany,
         playersRussia: docSnapGame.data().playersRussia,
         territories: docSnapTerritories.data().territories,
         });
      } else {
         updateDoc(doc(db, "users", cycleUserId),{
            losses: increment(1)
         });
         setDoc(docRefPastGame, {
         victory: "no",
         id: docSnapGame.data().id,
         scenario: docSnapGame.data().scenario,
         playersGermany: docSnapGame.data().playersGermany,
         playersRussia: docSnapGame.data().playersRussia,
         territories: docSnapTerritories.data().territories,
         });
      }
   }
   deleteGame(user, docSnapGame)
   */
}
