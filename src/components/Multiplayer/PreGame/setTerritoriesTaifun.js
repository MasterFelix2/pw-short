import React, { useState} from 'react'
import { db } from '../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import {baltic_states, murmansk_peninsula, finnish_forward, south_leningrad, north_moscow, south_moscow,
    east_poland, north_kiev,east_ukraine, east_romania, stalingrad_area, caucasus_area,
    deep_caucasus, smolensk_area, east_minsk, 
    leningrad_area, murmansk_railway, northern_baltics, east_leningrad, german_starting}
    from './TaifunShort';

export async function setTerritoriesTaifun(gameId){

   const areasArray = [german_starting, baltic_states, finnish_forward, south_leningrad, east_poland,
      east_romania, northern_baltics, smolensk_area, east_minsk]

    await setDoc(doc(db, "games", gameId, "german", "territories"), {
        territories: [
        ]
        });

   for (let j = 0; j < areasArray.length; j++){

      for(let i = 0; i<areasArray[j].length; i++){
        await updateDoc(doc(db, "games", gameId, "territories", areasArray[j][i].name), {
            controlledBy: "Germany"
        });
        await updateDoc(doc(db, "games", gameId, "german", "territories"), {
            territories: arrayUnion(areasArray[j][i])
        });
      }
   }
}
