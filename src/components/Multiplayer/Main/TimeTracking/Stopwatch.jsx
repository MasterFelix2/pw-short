import React, { useState, useRef, useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion} from "firebase/firestore";
import { useSelector } from "react-redux"
import { useLocation} from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { TimeTracker } from 'react-time-tracker-stopwatch'

const Stopwatch = (props) => {
  
   const location = useLocation();
   const gameId = location.state.id;
   const user = useSelector((state) => state.user.value);
   const pts = useSelector((state) => state.pts.value);
   const firstUpdate = useRef(true);
   const docRefTime = doc(db, "games", gameId, "players", user.uid);
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   const docRefTimeRunning = doc(db, "games", gameId, "players", user.uid, "time", "running");
 
   const [startTime, setStartTime] = useState(props.startTime);
   const [running, setRunning] = useState(props.autostart);
   const [description, setDescription] = useState("working");
   const [type, setType] = useState("productive");
   const [log, setLog] = useState(0);
   const [logNumber, setLogNumber] = useState(null)
   
   //stopwatch logic
   const offsetTimestamp = new Date(); 
   offsetTimestamp.setSeconds(offsetTimestamp.getSeconds()+ props.offset/1000);
   const {seconds,minutes,hours,start,pause,reset,} = useStopwatch({ autoStart: props.autostart, offsetTimestamp: offsetTimestamp });


   useEffect(()=>{
      async function fetchData(){
         const docSnap = await getDoc(docRefTimeRunning);
         setLogNumber(docSnap.data().numberLogs);
      }
      fetchData();
   }, [])

   
   useEffect(() => {
      if (firstUpdate.current) {
         firstUpdate.current = false;
         return;
      }

      async function sendData(){
         await updateDoc(docRefTime, {
            [props.type]: hours*60*60 + minutes*60 + seconds
         })
      }

      if (minutes % 10 === 0){
         async function spendPoints(){
            const docSnap = await getDoc(docRefPlayers);
            const pointsToSpend = pts.pts; 
            const personalProgress = await docSnap.data().personalProgress;
            await updateDoc(docRefPlayers, {
               personalProgress: personalProgress+1,
               pointsToSpend: pointsToSpend+1,
            })
            props.setPts(pointsToSpend+1);
         }
         spendPoints();
         
      }
      sendData();
   }, [minutes]);

   async function triggerStart(){
      setRunning(true);
      start();
      const beginningTime = Date.now();
      setLogNumber(logNumber+1)
      setStartTime(beginningTime)
      await setDoc(docRefTimeRunning, {
         startTime: beginningTime,
         description: description,
         numberLogs: logNumber,
         type: type,
         running: true,
         redeemed: false,
         deleted: false,
      })
      
   }

   function triggerPause(){
      setRunning(false);
      pause();
   }

   async function triggerDelete(){
      setRunning(false);
      reset(0, false);
      await updateDoc(docRefTimeRunning, {
         running: false,
         numberLogs: logNumber
      })
   }

   async function triggerContinue(){
      setRunning(false);
      reset(0, false);
      const endTime = Date.now();
      await updateDoc(docRefTimeRunning, {
         running: false,
         numberLogs : logNumber
      })
      const docRefTimeLog = doc(db, "games", gameId, "players", user.uid, "time", `log${logNumber}`);
      await setDoc(docRefTimeLog, {
         startTime: startTime,
         endTime: endTime,
         description: description,
         type: type,
         logNumber: logNumber,
         redeemed: false,
         deleted: false,
      })
      console.log(logNumber)
      props.createTimeLog(startTime, endTime, description, type, logNumber)
   }

   if (logNumber === null){
      return null
   }

   return (
      <section className='hzSection stopwatchContainer'>
         <section className='stopwatchTimer'>
            {hours < 10 ?
            (<><span>0{hours}</span></>):(<><span>{hours}</span></>)
            }
            <span>:</span>
            {minutes < 10 ?
            (<><span>0{minutes}</span></>):(<><span>{minutes}</span></>)
            }
            <span>:</span>
            {seconds < 10 ?
            (<><span>0{seconds}</span></>):(<><span>{seconds}</span></>)
            }
         </section>
         <section>
            {running ? 
            (<>
            <img 
            onClick={triggerDelete} className="ppButton"
            src="../images/icons/DeleteIconRound.svg" height="40px" alt="deleteIcon" 
            />
            <img 
            onClick={triggerContinue} className="ppButton"
            src="../images/icons/ContinueIconRound.svg" height="40px" alt="deleteIcon"
            />
            </>):(<>
            <img 
            onClick={triggerStart} className="ppButton"
            src="../images/icons/PlayIconRound.svg" height="40px" alt="playIcon" 
            />
            </>)}
         </section>      
      </section>
   );
}
export default Stopwatch;