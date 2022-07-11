import React, {useState} from 'react'
import { useLocation} from 'react-router-dom';
import { db } from '../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion} from "firebase/firestore";
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { setPts } from "../../../features/pts"

export const UpgradeableItem = (props) => {

   const location = useLocation();
   const dispatch = useDispatch();
   const gameId = location.state.id;
   const pts = useSelector((state) => state.pts.value)
   const user = useSelector((state) => state.user.value)

   const docRefGameEco = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   const docRefGame = doc(db, "games", gameId);

   const [descriptionVisible, setDescriptionVisible] = useState(false)


   async function upgrade(type, level){

      const docSnap = await getDoc(docRefPlayers);

      const upgradeCost = props.productionLevel+6

      if(pts.pts >= upgradeCost){
          updateDoc(docRefGameEco, {
         [type]: level+1,
         })

         const points = Number((pts.pts - upgradeCost).toFixed(1))

         updateDoc(docRefPlayers, {
            pointsToSpend: points
         })
         dispatch(setPts({ pts: points }))
         props.upgradeItem();
      } else {
         alert("Not enough points.")
      }
   }

   return (
      <>
         <section className='economyItems'>
            
            <h3 className="economyText" onClick={()=>setDescriptionVisible(!descriptionVisible)}>{props.productionTypeText} : </h3>
            <h3>{props.productionLevel} ({props.productionLevel+5})</h3>
            <img
               onClick={()=>{upgrade(props.productionType, props.productionLevel)}}
               src="/images/icons/UpgradeButton.svg" height="20px" alt="upgrade" 
            />
         </section>
         {descriptionVisible ? 
         <section className='upgrade-description'>
            <p>{props.description}</p>
         </section>
         : <></>}
         
      </>
   )
}
