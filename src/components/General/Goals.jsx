import React, { useState, useEffect} from 'react';
import { db } from '../../firebase-config';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux"
   

const Goals = (props) => {

   const goalType = props.goalType;

   const user = useSelector((state) => state.user.value)
   const [state, setState] = useState(true);
   const [resolved, setResolved] = useState(false);
   const [input, setInput] = useState("");

   const userRef = doc(db, "users", user.uid);
   const tasksRef = doc(db, "users", user.uid, "tasks", goalType);

   useEffect( () => {
      fetchData();
   }, []);

   async function fetchData() {
      const docSnap = await getDoc(tasksRef);
      console.log(docSnap.data().value)
      const data = (docSnap.data().value);
      data === "" ? setState(true):setState(false);
      setInput(data);
   }

   async function setTaskSuccess () {
      const docSnap = await getDoc(userRef);
      console.log(docSnap.data());
      const prog = await docSnap.data().progress; 
      await updateDoc(userRef, {
      progress: prog+15
      })
      setResolved(true);
      props.getData();
   }

   async function setTaskSoso () {
      const docSnap = await getDoc(userRef);
      console.log(docSnap.data());
      const prog = await docSnap.data().progress; 
      await updateDoc(userRef, {
      progress: prog+8
      })
      setResolved(true);
      props.getData();
   }

    async function setGoalDb () {

      console.log(goalType + input)
      await setDoc(tasksRef, {
            value : input
      });
   }

   async function setTaskDefeat () {
      const docSnap = await getDoc(userRef);
      console.log(docSnap.data());
      const prog = await docSnap.data().progress; 
      await updateDoc(userRef, {
      progress: prog-1
      })
      setResolved(true);
      props.getData();
   }

   function setGoal (){
      setGoalDb();
      setState(false);
   }

   return (
   <>
   <section className='hzcenter'>
      {state ? 
         <>
            <h2 className='goalText'>{props.text} :</h2>
            <section className='hzSection'>
            <input className='goalInput'type="text" value={input} 
               onChange={ (e) => {setInput(e.target.value)}}/>
            <button className='goalBtn' onClick={setGoal}>Add</button>
            </section>
         </> 
         : 
         <>
         {resolved ? 
            <>
            <h2 className='goalText'>{props.text} : {input}</h2>
            <section className='hzSection'>
            <button className='goalBtn'>Done</button>
            </section>
            </>

            :
            <>
            <h2 className='goalText'>{props.text} : {input}</h2>
            <section className='hzSection'>
            <button className='goalBtn' onClick={setTaskSuccess}>Finish</button>
            <button className='goalBtn' onClick={setTaskSoso}>Draw</button>
            <button className='goalBtn' onClick={setTaskDefeat}>Fail</button>
            </section>
            </>
         }
         </>
      }
   </section>
   </>
   )
}

export default Goals;
