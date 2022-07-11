import React, {useState} from 'react'
import { db } from '../../../firebase-config';
import { doc, setDoc, deleteDoc, updateDoc, arrayUnion} from 'firebase/firestore';


export async function initializeGame (user, gameId, faction){

   console.log(user)
   console.log(user.uid)
   console.log(faction)

   const docRefGame = doc(db, "games", gameId);
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);

   const date = new Date();

   if (faction === "Germany") {
      await updateDoc(docRefGame,{
         playersGermany: arrayUnion(user.nickName)
      })
   } else if (faction === "Russia"){
      await updateDoc(docRefGame,{
         playersRussia: arrayUnion(user.nickName)
         //playersRussia: [user.nickName]
      });
   };

   await setDoc(docRefPlayers, {
      personalProgress: 0,
      position: faction,
      pointsToSpend: 0,
      productiveTime:0,
      semiproductiveTime:0,
      maintenanceTime:0,
      lastPayout: Math.floor(date.setHours(0,0,0,0)/1000),
    });

   await setDoc(doc(db, "games", gameId, "players", user.uid, "ww2", "economy"), {
      economyLevel: 1,
      infrastructureLevel: 1,
      tankProductionLevel: 1,
      tankResearchLevel: 1,
      recruitmentLevel: 1,
      infantryResearchLevel: 1,
      armyTrainingLevel: 1,
      winterPreparationlevel: 1,
      propagandaLevel: 1,
      armyResearchLevel: 1,
   });

   await setDoc(doc(db, "games", gameId, "players", user.uid, "ww2", "army"), {
      freeAttacks: 0,
      freeMoves: 0,
      lastInfRF: Math.floor(date.setHours(0,0,0,0)/1000),
      lastTankRF: Math.floor(date.setHours(0,0,0,0)/1000),
      autoRFlocation: "Center",
      deployableInfDivs: 0,
      deployableTankDivs: 0,
   });


   await setDoc(doc(db, "games", gameId, "players", user.uid, "time", "running"), {
      running: false,
      numberLogs: 0,
      startTime: 0,
    });
   

   await updateDoc(docRefGame, {
      players: arrayUnion(user.uid)
   });
   
   
}
