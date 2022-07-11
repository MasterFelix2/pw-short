import React, {useState, useEffect} from 'react'
import NewCampaignImage from '../../General/NewCampaignImage'
import { db } from '../../../firebase-config';
import { useSelector} from 'react-redux'
import { doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion} from 'firebase/firestore';
import { Link} from "react-router-dom"
import {GermanTerritories, SovietTerritories, NeutralTerritories, FinnlandTerritories, SovietFightingTerritories} from "../Main/svgComponents/MainMap";
import { initializeGame } from './initializeGame';
import { setTerritoriesTaifun } from './setTerritoriesTaifun';
import { deleteGame } from './deleteGame';
import PastGame from './PastGame';

const MultiplayerGameListed = (props) => {

   const goalsArray = ["primary", "secondary", "tertiary", "sub1", "sub2", "sub3", "supp1", "supp2"];
   const item = props.item;
   const user = useSelector((state) => state.user.value)

   const territoryArray = [GermanTerritories, SovietTerritories, NeutralTerritories, SovietFightingTerritories];

   const [join, setJoin] = useState(true);
   const [deleting, setDeleting] = useState(false);
   const [reallyDelete, setReallyDelete] = useState(false);

   async function joinAs(item, faction){
      initializeGame(user, item, faction);
   }

   async function startGame(item){
      const docRef = doc(db, "games", item.data().id);
      await updateDoc(docRef, {
      state: "started"
      })
   }

   function deleteFunction (item){
      setDeleting(true);
      deleteGame(user, item);
      setDeleting(false);
   }
   

   function testFunction(item){
      //setTerritoriesTaifun(item.data().id)
       console.log("HELLO?")
      const userAI = {uid: "AI", nickName: "AI"}
      const faction = "Germany";
      if (faction === "Germany") { 
        console.log("Germany")
        initializeGame(userAI, item.data().id, "Russia");
      } else { 
        console.log("Russia")
        initializeGame(userAI, item.data().id, "Germany");
      }
   }

   return (
   <section className='gameListCont'>

      <div className='listed-image-div'>
         <NewCampaignImage
            selectedCampaign={item.data().campaign}
            height="50px"
         />
      </div>

      <div className='collapseable-div-info'>
         <div>
            <h4>Operation {item.data().scenario}</h4>
            {props.myGame === "yes" ? (<h5>
               ({item.data().state})
            </h5>):(<h5>
               (open)
            </h5>)}
         </div>
         <div>
            <h4>Game ID: </h4>
            <h5>{item.data().id}</h5>
         </div>
      </div>
      
      {/* players */}
      {item.data().playerCount === "Singleplayer" ? 
         (<>
            <h3>Singleplayer</h3>
         </>)
         :
         (<>
            <div>
               <h3>Players ({item.data().players.length} / {item.data().playerCount}):</h3>
               {item.data().playersGermany.length ? (<>
                  <h5>Germany</h5>
                  <h5>
                  {item.data().playersGermany.map((player) => {
                     return (
                        <>
                        {(player === item.data().host) ? 
                        (<h4>{player} (Host)</h4>) 
                        : 
                        (<h4>{player}</h4>)}
                        </>
                     )
                  })}
                  </h5>
               </>):(<>
                  <h5>Germany</h5>
                  <h5>-----</h5>
               </>)
               }
               {item.data().playersRussia.length ? (<>
               <h5>Russia</h5>
                  <h5>
                     {item.data().playersRussia.map((player) => {
                        return (
                           <>
                           {(player === item.data().host) ? 
                           (<h4>{player} (Host)</h4>) 
                           : 
                           (<h4>{player}</h4>)}
                           </>
                        )
                     })}
                  </h5>
               </>):(<>
               <h5>Russia</h5>
               <h5>------</h5>
               </>)
               }
            </div>
         </>)//Not singleplayerdeleteG
      }
      
      {item.data().playerCount === "Singleplayer" ? 
         (<>
            <button className="gameButton" onClick={()=>testFunction(item)}>Test button</button>
            <Link to={`/multiplayer/${item.data().id}`} 
               state={{ 
                  id: item.data().id,
                  players: item.data().players
               }}>
               <button className="gameButton">View game</button>
            </Link>
            {item.data().host === user.uid ? 
            <>
               {reallyDelete ? <>
               <button className="gameButton" onClick={(()=> {deleteFunction(item)})}>Really delete game?</button>
               <img onClick={()=>setReallyDelete(false)}src="images/icons/delete.png" width="30px" alt="cancel" />
               </>:<>
               <button className="gameButton" onClick={()=>setReallyDelete(true)}>Delete game</button>
               </>}
            </>
            :<></>}
         </>)
         :
         (<>
         <div className='collapseable-div-buttons'>
            {/* Own games vs public games -- own*/}
            {props.myGame === "yes" ? 
            (<>
               {/* started vs open -- started*/}
               {item.data().state === "started" ? 
               (<>
               <button className="gameButton" onClick={()=>testFunction(item)}>Test button</button>
               <Link to={`/multiplayer/${item.data().id}`} 
                  state={{ 
                     id: item.data().id,
                     players: item.data().players
                  }}>
                  <button className="gameButton">View game</button>
               </Link>
               </>)
               :  
               (<>   {/* started vs open -- open*/}
                  {/* full lobby vs not full -- full*/}
                  {item.data().players.length === item.data().playerCount ? 
                  (<>
                     {/* */}
                     {item.data().host === user.uid ? 
                     (<>
                        <Link to={`/multiplayer/${item.data().id}`} 
                           state={{ 
                              id: item.data().id,
                              players: item.data().players
                           }}>
                           <button className="gameButton" onClick={(()=> {startGame(item)})}>Start game</button>
                        </Link>
                        { deleting ? (<>
                        <h4>Deleting... </h4>
                        </>):(<>
                        {item.data().host === user.uid ? 
                        <>
                           {reallyDelete ? <>
                           <button className="gameButton" onClick={(()=> {deleteFunction(item)})}>Really delete game?</button>
                           <img onClick={()=>setReallyDelete(false)}src="images\icons\delete.png" width="30px" alt="cancel" />
                           </>:<>
                           <button className="gameButton" onClick={()=>setReallyDelete(true)}>Delete game</button>
                           </>}
                        
                        </>
                        :<></>}
                        </>)}
                     </>):(<>
                        <h4>Waiting for Host to start the game</h4>
                     </>)}
                     
                  </>)
                  :  
                  (<> {/* full lobby vs not full -- not full*/}
                     <h3>Lobby not full</h3>
                     {item.data().host === user.uid ? 
                     <>
                        {reallyDelete ? <>
                        <button className="gameButton" onClick={(()=> {deleteFunction(item)})}>Really delete game?</button>
                        <img onClick={()=>setReallyDelete(false)}src="images\icons\delete.png" width="30px" alt="cancel" />
                        </>:<>
                        <button className="gameButton" onClick={()=>setReallyDelete(true)}>Delete game</button>
                        </>}
                     </>
                     :<></>}
                  </>)}
               </>)}
            </>)
            : 
            (<>   {/* Own vs public -- public*/}

               {(item.data().playerCount-item.data().players.length) > 0 ?
               (<>
                  {join ? (<>
                  <button className="gameButton" onClick={()=>{setJoin(false)}}>Join game</button>
                  </>):(<>
                     <button onClick={()=>{joinAs(item, "germany")}}>as Germany</button>
                     <button onClick={()=>{joinAs(item, "russia")}}>as Russia</button>
                  </>)}
               </>)
               :
               (<>
               <h4>Game full</h4>
               </>)}
            </>)
            }
         </div>
      </>)}
   </section>
   )
}

export default MultiplayerGameListed