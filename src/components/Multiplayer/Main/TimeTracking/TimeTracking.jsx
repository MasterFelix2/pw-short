import React, {useEffect, useState} from 'react'
import Stopwatch from './Stopwatch'
import { db } from '../../../../firebase-config';
import { setPts } from "../../../../features/pts";
import TimeLog from './TimeLog';
import { deleteDoc, doc, getDoc, updateDoc} from "firebase/firestore";
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux"
import { useDispatch } from 'react-redux'


const TimeTracking = () => {

   //basic setup
   const location = useLocation();
   const dispatch = useDispatch();
   const user = useSelector((state) => state.user.value)
   const pts = useSelector((state) => state.pts.value)
   const gameId = location.state.id;
   const docRefGame = doc(db, "games", gameId);
   const docRefTimeRunning = doc(db, "games", gameId, "players", user.uid, "time", "running");


   const [offset, setOffset] = useState(null);
   const [running, setRunning] = useState(null);
   const [logArray, setLogArray] = useState([]);
   const [startTime, setStartTime] = useState(null);
   const [numberLogs, setNumberlogs] = useState(50);
   
   async function loadLogs(){
      const docSnap = await getDoc(docRefTimeRunning);
      //Load existing database logs
      var testArray = [];   //interim variable because logArray only updates on next render
      var shownIndex = 0;
      for(let i = 1; i<=docSnap.data().numberLogs; i++){    //start with i = 1
         
         const docRefLogFlex = doc(db, "games", gameId, "players", user.uid, "time", `log${i}`);
         const docSnip = await getDoc(docRefLogFlex);

         if(docSnip.data().deleted){
         }  else {

         console.log(i)
         console.log(docSnip.data().logNumber)

         const startTime = docSnip.data().startTime;
         const endTime = docSnip.data().endTime;
         const description = docSnip.data().description;
         const type = docSnip.data().type;
         const logId = docSnip.data().logNumber;
         const redeemed = docSnip.data().redeemed;
         const index = shownIndex;
         const logItem = {startTime, endTime, description, type, logId, redeemed, index};
         testArray = [...testArray, logItem]
         //shownIndex++
         }
      }
      setLogArray(testArray)
   }

   useEffect(()=>{

      async function fetchData(){

         //clear everything if new day
         const docSnup = await getDoc(docRefGame);
         console.log(new Date().getDate())
         if (docSnup.data().currentDay !== new Date().getDate()){
            const docSnop = await getDoc(docRefTimeRunning);
            for(let i = 0; i<docSnop.data().numberLogs; i++){
               const docRefLogFlex = doc(db, "games", gameId, "players", user.uid, "time", `log${i}`);
               await deleteDoc(docRefLogFlex)
            }
            await updateDoc(docRefTimeRunning, {
               numberLogs: 0
            })
            await updateDoc(docRefGame, {
               currentDay: new Date().getDate()
            })
         }

         const docSnap = await getDoc(docRefTimeRunning);
         setRunning(docSnap.data().running)
         setStartTime(docSnap.data().startTime)
         setNumberlogs(docSnap.data().numberLogs)
         if (docSnap.data().running){
            setOffset(Date.now() - docSnap.data().startTime)
         } else if (docSnap.data().running === false){
            setOffset(0)
         }

         loadLogs();
         
      }

      fetchData();
   }, [])

   function createTimeLog(startTime, endTime, description, type, logId){
      const index = logArray.length
      const redeemed = false;
      setLogArray([...logArray, {startTime, endTime, description, type, logId, redeemed, index }]); 
   }
   
   async function deleteLog(deletedLog, shownIndex, redeemed, minutes){
      if(redeemed){
         
         const docRefUser = doc(db, "games", gameId, "players", user.uid);
         const docRefLevel = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
         const docSnapLevel = await getDoc(docRefLevel);

         let amount = Number((minutes/30*(1+0.1*docSnapLevel.data().propagandaLevel)).toFixed(1))

         if (pts.pts > amount){
            const newAmount = Number((pts.pts - amount).toFixed(1));
            await updateDoc(docRefUser, {
               pointsToSpend: newAmount
            })
            dispatch(setPts({ pts: newAmount}));
         } else {
            alert("Points cannot go negative. Redeem more points before deleting this time.")
            return null
         }
         
      }
      const docRefTimeLog = doc(db, "games", gameId, "players", user.uid, "time", `log${deletedLog}`);
      await updateDoc(docRefTimeLog, {
         deleted: true
      });
      const myTimeout = setTimeout(loadLogs, 5000);
      console.log("timeout finished")
      //let removed = logArray.filter((id) => id !== shownIndex)
      //setLogArray(removed)
   }

   async function redeemPoints(redeemedLog, minutes){

      const docRefUser = doc(db, "games", gameId, "players", user.uid);
      const docRefLevel = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
      const docSnapLevel = await getDoc(docRefLevel);

      let amount = Number((minutes/30*(1+0.1*docSnapLevel.data().propagandaLevel)).toFixed(1))
      console.log(amount)

      const docRefTimeLog = doc(db, "games", gameId, "players", user.uid, "time", `log${redeemedLog}`);
      await updateDoc(docRefTimeLog, {
         redeemed: true
      });

      const newAmount = Number((pts.pts + amount).toFixed(1));

      console.log(pts.pts+amount)

      await updateDoc(docRefUser, {
         pointsToSpend: newAmount
      })
      dispatch(setPts({ pts: newAmount}));
   }

   async function updateTime(updatedLog, fromTo, time){
      const docRefTimeLog = doc(db, "games", gameId, "players", user.uid, "time", `log${updatedLog}`);
      if (fromTo === "start"){
         await updateDoc(docRefTimeLog, {
            startTime: time
         })
      } else if (fromTo === "end"){
         await updateDoc(docRefTimeLog, {
            endTime: time
         })
      }
      
   }

   if (running === null || offset === null || startTime === null || numberLogs === 50 ){ //|| logArray[numberLogs]===false
      return null
   }

   return (
   <>
      <Stopwatch
         startTime={startTime}
         offset={offset}
         autostart={running}
         createTimeLog={(startTime, endTime, description, type, logNumber)=>createTimeLog(startTime, endTime, description, type, logNumber)}
      />
      {logArray.map(item=>{
      return (
         <TimeLog
            startTime={item.startTime}
            endTime={item.endTime}
            description={item.description}
            type={item.type}
            logNumber={item.logId}
            index={item.index}
            triggerDelete={(deletedLog, index, redeemed, minutes)=>deleteLog(deletedLog, index, redeemed, minutes)}
            redeemPoints={(redeemedLog, amount)=>redeemPoints(redeemedLog, amount)}
            updateTime={(updatedLog, fromTo, time)=>updateTime(updatedLog, fromTo, time)}
            redeemed={item.redeemed}
            deleted={item.deleted}
         />
      )
      })}
   </>
   )
}

export default TimeTracking