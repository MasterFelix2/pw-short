import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment} from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setPts } from '../../../../features/pts';
import { setDeployableDivs } from '../../../../features/deployableDivs';

export async function Generate(gameId, user, faction, pts, deployableDivs, currentTimeSec, timeDifferenceMins, lastPayoutSec){

   var generatedPoints = 0;
   var generatedInfDivs = 0;
   var generatedTankDivs = 0;

   const docRefGame = doc(db, "games", gameId);
   const docSnapGame = await getDoc(docRefGame);
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   const docRefEco = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
   const docSnapEco = await getDoc(docRefEco);

   //Generation Points part
   const timeDifferenceHours = (timeDifferenceMins)/60;
   const numberOfPayouts = Math.floor(timeDifferenceHours);
   const payoutTimeSec = numberOfPayouts*60*60;

   updateDoc(docRefPlayers, {
      lastPayout: lastPayoutSec+payoutTimeSec
   });
   var territoryPoints = 0;

   if (faction.faction === "Germany"){
      territoryPoints = docSnapGame.data().germanTerritoryPoints;
   } else {
      territoryPoints = docSnapGame.data().sovietTerritoryPoints;
   }
            
   const playerEconomyLevel = docSnapEco.data().economyLevel;
   const payout = Number((numberOfPayouts*(territoryPoints/500/10)*(1+0.1*playerEconomyLevel)).toFixed(1));
   console.log(payout)
   generatedPoints= Number((pts+payout).toFixed(1))
   console.log(generatedPoints)

   await updateDoc(docRefPlayers, {
      pointsToSpend: generatedPoints,
   });

   if (docSnapGame.data().playerCount === "Singleplayer"){
      const docRefAi = doc(db, "games", gameId, "players", "AI");
      var genPoints;

      if(docSnapGame.data().aiDifficulty === "Hard"){
         genPoints = numberOfPayouts*10
      } else if(docSnapGame.data().aiDifficulty === "Medium"){
         genPoints = numberOfPayouts*5
      } else {
         genPoints = numberOfPayouts*2
      }
      updateDoc(docRefAi, {
         pointsToSpend: increment(Number((genPoints).toFixed(1)))
      })
   }

   //Divisions part
   const docRefPlayersArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");
   const docSnapArmy = await getDoc(docRefPlayersArmy);
   const timeDifferenceInfSec = currentTimeSec - docSnapArmy.data().lastInfRF
   const timeDifferenceTankSec = currentTimeSec - docSnapArmy.data().lastTankRF
   
   const tankProductionSpeed = (5-(docSnapEco.data().tankProductionLevel*0.25))
   const tankProductionSpeedSec = (tankProductionSpeed*24*60*60)
   const recruitmentSpeed = (5-(docSnapEco.data().recruitmentLevel*0.25))
   const recruitmentSpeedSec = (recruitmentSpeed*24*60*60)

   if(timeDifferenceInfSec > recruitmentSpeedSec){
      console.log("generateNewInf")
      const numberPayouts = Math.floor(timeDifferenceInfSec/recruitmentSpeedSec)
      updateDoc(docRefPlayersArmy, {
         lastInfRF: (docSnapArmy.data().lastInfRF)+(recruitmentSpeedSec*numberPayouts), 
         deployableInfDivs: increment(1),
      });
      generatedInfDivs = 1;
   }
   if(timeDifferenceTankSec > tankProductionSpeedSec){
      console.log("generateNewTank")
      const numberPayouts = Math.floor(timeDifferenceTankSec/tankProductionSpeedSec)
      updateDoc(docRefPlayersArmy, {
         lastTankRF: (docSnapArmy.data().lastInfRF)+(tankProductionSpeedSec*numberPayouts), 
         deployableTankDivs: increment(1),
      });
      generatedTankDivs = 1;
   }
   console.log("Ancestors")


   return {generatedPoints, generatedInfDivs, generatedTankDivs};
}