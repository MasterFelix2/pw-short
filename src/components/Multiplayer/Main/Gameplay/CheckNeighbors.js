import React, {useState, useRef, useEffect} from 'react';
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment} from "firebase/firestore";

export async function CheckNeighbors(gameId, territory){

   const docRefTerritory = doc(db, "games", gameId, "territories", territory);
   const docSnap = await getDoc(docRefTerritory);
   const neighbors = docSnap.data().neighbors;
   const faction = docSnap.data().controlledBy;

   for (let i = 0; i < neighbors.length; i++){
      const docSnap = await getDoc(doc(db, "games", gameId, "territories", neighbors[i]))
      console.log(neighbors[i], docSnap.data().controlledBy)
      if (faction !== docSnap.data().controlledBy){
         return false
      }
   }

   return true


}