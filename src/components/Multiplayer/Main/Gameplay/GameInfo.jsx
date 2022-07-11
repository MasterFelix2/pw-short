import React, {useEffect, useState} from 'react'
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux"
import { db } from '../../../../firebase-config';
import { doc, getDoc, increment, updateDoc,} from "firebase/firestore";
import { useDispatch } from 'react-redux'
import { addFreeMoves } from '../../../../features/freeMoves';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';

const GameInfo = () => {

   //basic setup
   let location = useLocation();
   const gameId = location.state.id;
   const dispatch = useDispatch();

   const user = useSelector((state) => state.user.value)
   const pts = useSelector((state) => state.pts.value)
   const freeMoves = useSelector((state) => state.freeMoves.value)

   const docRefGame = doc(db, "games", gameId);
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   const docRefUpgrade = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
   const docRefArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");

   const [item, setItem] = useState(null)
   const [dayOfTimeframe, setDayOfTimeframe] = useState(1);
   const [timeframe, setTimeframe] = useState(1);
   const [faction, setFaction] = useState("");

   useEffect(()=>{

      async function fetchData(){
      
         //Database
         const docSnap = await getDoc(docRefGame);
         setItem(docSnap)

         //time logic
         const date = new Date();
         const todayDay = date.getDate();
         const now = Math.floor(Date.now()/1000);
         const gameDuration = (now - docSnap.data().midnightStart)/60/60/24;
         const currentDay = Math.floor(gameDuration);
         setDayOfTimeframe(currentDay+1);
         setTimeframe(docSnap.data().timeframe);
         setFaction(docSnap.data().position)

         const gameLoaded = (docSnap.data().loaded)
         if (gameLoaded !== true){
            return;
         }
            if (todayDay !== docSnap.data().currentDay){
               await updateDoc(docRefGame, {
                  currentDay: todayDay,
                  currentMonth: date.getMonth()+1,
                  currentYear: date.getFullYear()
               })
               const docSnapUpgrade = await getDoc(docRefUpgrade);
               const infrastructureLevel = docSnapUpgrade.data().infrastructureLevel; 
               var freeMovesNum;

               console.log(infrastructureLevel)

               if (infrastructureLevel === 1){
                  freeMovesNum = 0
               } else if (infrastructureLevel === 2 || infrastructureLevel === 3){
                  freeMovesNum = 2
               } else if (infrastructureLevel === 4){
                  freeMovesNum = 3
               } else if (infrastructureLevel === 5){
                  freeMovesNum = 4
               } else if (infrastructureLevel === 6 || infrastructureLevel === 7){
                  freeMovesNum = 5
               } else if (infrastructureLevel === 8){
                  freeMovesNum = 6
               } else if (infrastructureLevel === 9){
                  freeMovesNum = 7
               } else if (infrastructureLevel === 10){
                  freeMovesNum = 20;
               }
               console.log(freeMovesNum)
               updateDoc(docRefArmy, {
                  freeMoves: freeMovesNum
               });

               let freeAttacks = 0;
               if (faction === "Germany"){
                  if(dayOfTimeframe===1||dayOfTimeframe===2){
                     freeAttacks=15;
                  } else if(dayOfTimeframe===3||dayOfTimeframe===4){
                     freeAttacks=14;
                  } else if(dayOfTimeframe===5||dayOfTimeframe===6||dayOfTimeframe===7){
                     freeAttacks=13;
                  } else if(dayOfTimeframe >= 8||dayOfTimeframe <22){
                     freeAttacks=10;
                  } else if(dayOfTimeframe >= 22||dayOfTimeframe <29){
                     freeAttacks=9;
                  } else if(dayOfTimeframe >= 29||dayOfTimeframe <36){
                     freeAttacks=8;
                  } else if(dayOfTimeframe >= 36||dayOfTimeframe <43){
                     freeAttacks=7;
                  } else if(dayOfTimeframe >= 43||dayOfTimeframe <50){
                     freeAttacks=6;
                  } else if(dayOfTimeframe >= 50||dayOfTimeframe <57){
                     freeAttacks=5;
                  } else if(dayOfTimeframe >= 57||dayOfTimeframe <64){
                     freeAttacks=4;
                  } else if(dayOfTimeframe >= 64||dayOfTimeframe <71){
                     freeAttacks=3;
                  } else if(dayOfTimeframe >= 71||dayOfTimeframe <78){
                     freeAttacks=2;
                  }
               }
               dispatch(addFreeMoves({ freeAttacks: freeAttacks, freeMoves: freeMovesNum, distance: 1}));
            } else {
               const docSnapArmy = await getDoc(docRefArmy);
               dispatch(addFreeMoves({ freeAttacks: docSnapArmy.data().freeAttacks, freeMoves: docSnapArmy.data().freeMoves, distance: 1}));
            }

         //check victory
         const docRefMoscow = doc(db, "games", gameId, "territories", "Moscow");
         const docSnapMoscow = await getDoc(docRefMoscow);
         const docRefKharkov = doc(db, "games", gameId, "territories", "Kharkov");
         const docSnapKharkov = await getDoc(docRefKharkov);
         const docRefLeningrad = doc(db, "games", gameId, "territories", "Leningrad");
         const docSnapLeningrad = await getDoc(docRefLeningrad);
         const docRefGrozny = doc(db, "games", gameId, "territories", "Grozny");
         const docSnapGrozny = await getDoc(docRefGrozny);
         const docRefMaikop = doc(db, "games", gameId, "territories", "Maikop");
         const docSnapMaikop = await getDoc(docRefMaikop);
         const docRefStalingrad = doc(db, "games", gameId, "territories", "Stalingrad");
         const docSnapStalingrad = await getDoc(docRefStalingrad);
         const docRefBaku = doc(db, "games", gameId, "territories", "Baku");
         const docSnapBaku = await getDoc(docRefBaku);

         const docSnapGame = await getDoc(docRefGame)
         if (docSnapMoscow.data().controlledBy === "Germany" &
            docSnapLeningrad.data().controlledBy === "Germany" &
            docSnapKharkov.data().controlledBy === "Germany" &
            dayOfTimeframe < 170){

            updateDoc(docRefGame, {
               victory: increment(1)
            });
         } else if (docSnapMoscow.data().controlledBy === "Germany" &
            docSnapMaikop.data().controlledBy === "Germany" &
            docSnapGrozny.data().controlledBy === "Germany" &
            docSnapStalingrad.data().controlledBy === "Germany" &
            dayOfTimeframe < 500){
            
            updateDoc(docRefGame, {
               victory: increment(1)
            });
         } else if (docSnapLeningrad.data().controlledBy === "Germany" &
            docSnapMaikop.data().controlledBy === "Germany" &
            docSnapGrozny.data().controlledBy === "Germany" &
            docSnapStalingrad.data().controlledBy === "Germany" &
            dayOfTimeframe < 500){
            
            updateDoc(docRefGame, {
               victory: increment(1)
            });
         } else if (docSnapBaku.data().controlledBy === "Germany" &
            docSnapMaikop.data().controlledBy === "Germany" &
            docSnapGrozny.data().controlledBy === "Germany" &
            dayOfTimeframe < 500){
            
            updateDoc(docRefGame, {
               victory: increment(1)
            });
         } else if (dayOfTimeframe >= 500){
            updateDoc(docRefGame, {
               victory: -10
            });

            /*
            Add win to personal profile
            for(let i = 0; i<docSnapGame.data().playersRussia; i++){
               docSnapGame.data().playersRussia[i]
            }
            */

         }
      }

      fetchData();
      
   }, [])

   if (item === null){
      return null
   }

   return (
      <section className='hzcenterTrim'>
         <div>
            <h3>Day: {dayOfTimeframe} / {timeframe}</h3>
         </div>
         <h3>Germany: {item.data().playersGermany}</h3>
         <h3>Russia: {item.data().playersRussia}</h3>
         <h4>Available points: {pts.pts}</h4>
      </section>
   )
}

export default GameInfo