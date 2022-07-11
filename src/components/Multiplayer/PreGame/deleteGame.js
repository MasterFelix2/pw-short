import NewCampaignImage from '../../General/NewCampaignImage'
import { db } from '../../../firebase-config';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion} from 'firebase/firestore';
import { Link} from "react-router-dom"
import {GermanTerritories, SovietTerritories, NeutralTerritories, FinnlandTerritories, SovietFightingTerritories} from "../Main/svgComponents/MainMap";
import { initializeGame } from './initializeGame';
import { setTerritoriesTaifun } from './setTerritoriesTaifun';

export async function deleteGame(user, item){
      const territoryArray = [GermanTerritories, SovietTerritories, NeutralTerritories, SovietFightingTerritories];

      const docSnap = await getDoc(doc(db, "games", item.data().id, "players", user.uid, "time", "running"))
      const numberLogs = docSnap.data().numberLogs

      const docSnapGame = await getDoc(doc(db, "games", item.data().id))
      const playersArray = docSnapGame.data().players;

      for(let i = 0; i<playersArray.length; i++){
         console.log(playersArray[i])
         await deleteDoc(doc(db, "games", item.data().id, "players", playersArray[i]));
         await deleteDoc(doc(db, "games", item.data().id, "players", playersArray[i], "time", "running"));
         await deleteDoc(doc(db, "games", item.data().id, "players", playersArray[i], "ww2", "economy"));
         await deleteDoc(doc(db, "games", item.data().id, "players", playersArray[i], "ww2", "army"));
         
         for(let i = 1; i<numberLogs+1;i++){
            const logNumber = `log${i}`
            console.log(logNumber)
            await deleteDoc(doc(db, "games", item.data().id, "players", playersArray[i], "time", logNumber ));
         }
      }
      
      //get log number and cycle through logs

      await deleteDoc(doc(db, "games", item.data().id, "ww2", "actions"));
      await deleteDoc(doc(db, "games", item.data().id, "german", "territories"));
      await deleteDoc(doc(db, "games", item.data().id, "frontline", "german"));
      await deleteDoc(doc(db, "games", item.data().id, "frontline", "soviet"));
      await deleteDoc(doc(db, "games", item.data().id));

      for (let j = 0; j < territoryArray.length; j++){
         for (let i = 0; i < territoryArray[j].length; i++ ){
         await  deleteDoc(doc(db, "games", item.data().id, "territories", territoryArray[j][i].id), {
            infDivs: territoryArray[j][i].infDivs,
            tankDivs: territoryArray[j][i].tankDivs,
            startingTerritory: territoryArray[j][i].startingTerritory,
            neighbors: territoryArray[j][i].ct,
            controlledBy: territoryArray[j][i].controlledBy,
            urban: territoryArray[j][i].urban,
            defenceLevel: territoryArray[j][i].defenceLevel,
            lastAttack: 0,
            economyLevel: territoryArray[j][i].economy,
         });
         }
      }
   }