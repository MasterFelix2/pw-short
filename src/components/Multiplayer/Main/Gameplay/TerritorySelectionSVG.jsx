import React, {useState, useRef, useEffect} from 'react';
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, increment, getDocs, collection, query, where} from "firebase/firestore";
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux"
import { useDispatch } from 'react-redux'
import { setPts } from "../../../../features/pts";
import { addFreeMoves } from '../../../../features/freeMoves';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';
import Draggable from 'react-draggable';
import { CheckNeighbors } from './CheckNeighbors';
import { RiverBonus } from './RiverBonus';
import { MoveCommand, AttackCommand, AttackCommand2 } from './Commands';

const TerritorySelection = (props) => {

   //basic setup
   let location = useLocation();
   let dispatch = useDispatch();
   const user = useSelector((state) => state.user.value)
   const selection = useSelector((state) => state.selection.value)
   const pts = useSelector((state) => state.pts.value)
   const freeMoves = useSelector((state) => state.freeMoves.value)
   const faction = useSelector((state) => state.faction.value)
   const gameId = location.state.id;
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   
   const [tanksNum, setTanksNum] = useState(0);
   const [infantryNum, setInfantryNum] = useState(0);
   const [fortificationNum, setFortificationNum] = useState(0);
   const [attack, setAttack] = useState(false);
   const [tankInput, setTankInput] = useState(0);
   const [infantryInput, setInfantryInput] = useState(0);
   const [oldSelection, setOldSelection] =useState(0);
   const [oldSelectionName, setOldSelectionName] = useState(false)
   const [oldTankNum, setOldTankNum] = useState(0);
   const [oldInfantryNum, setOldInfantryNum] = useState(0);
   const [factionStance, setFactionStance] = useState("friendly");
   const [hidden, setHidden] = useState(false);
   const [power, setPower] = useState(0);
   const [powerDefence, setPowerDefence] = useState(0);
   const [attackPower, setAttackPower] = useState(0);
   const [battleInfo, setBattleInfo] = useState(false);
   const [totalDefence, setTotalDefence] = useState(0);
   const [costAttack, setCostAttack] = useState(0);

   const costArtilleryBarrage = 5;
   const costAssault = 5;
   const costFortify = 3;

   const firstUpdate = useRef(true);

   useEffect( () => {
      if (firstUpdate.current) {
         firstUpdate.current = false;
         return;
      }
      
      async function getDataSelection(){

         const docRefTerritory = doc(db, "games", gameId, "territories", selection.name)
         const docSnapTerritory = await getDoc(docRefTerritory);
         var factionStanceVar = "";

         if (faction.faction === docSnapTerritory.data().controlledBy){
            factionStanceVar = "friendly";
            setFactionStance("friendly");
         } else {
            factionStanceVar = "enemy";
            setFactionStance("enemy")
         }

         async function fullInformation(type){

            const docSnapGame = await getDoc(doc(db, "games", gameId));
            var uid = "";
            if(type === "friendly"){
               uid = user.uid
            } else {
               const playersArray = docSnapGame.data().players
               for (let i = 0; i< playersArray.length; i++){
                  if (playersArray[i] !== user.uid){
                     uid = playersArray[i];
                  }
               }
            }
            
            const docRefEnemyPlayer = doc(db, "games", gameId, "players", uid, "ww2", "economy");
            const docSnapEnemyPlayer = await getDoc(docRefEnemyPlayer) 
            const enemyInfantryResearchLevel = docSnapEnemyPlayer.data().infantryResearchLevel;
            const enemyTankResearchLevel = docSnapEnemyPlayer.data().tankResearchLevel;
            const docSnapPlayer = await getDoc(docRefPlayers);
            const infantryResearchLevel = docSnapPlayer.data().infantryResearchLevel;
            const tankResearchLevel = docSnapPlayer.data().tankResearchLevel;

            const tankNum = docSnapTerritory.data().tankDivs;
            const infNum = docSnapTerritory.data().infDivs;
            const fortificationNum = docSnapTerritory.data().defenceLevel;
            const basicDefenceBonus = 1.3;

            setTanksNum(tankNum);
            setInfantryNum(infNum);
            setFortificationNum(fortificationNum);
            setPower(Number(tankNum*5*(1+0.2*enemyTankResearchLevel)+infNum*(1+0.2*enemyInfantryResearchLevel)).toFixed(1));
            setPowerDefence(Number((tankNum*5*(1+0.2*enemyTankResearchLevel)+infNum*(1+0.2*enemyInfantryResearchLevel)+(2*fortificationNum))*basicDefenceBonus*(1+0.4*fortificationNum)).toFixed(1))

            if (attack === true){
               const freeAttacksNum = freeMoves.freeAttacks;
               const riverDefenceBonus = RiverBonus(oldSelectionName, selection.name);
               var cost = Math.floor((powerDefence*riverDefenceBonus/attackPower)*4+1);

               if (freeAttacksNum > 0){
                  cost = cost -2;
               }

               if (factionStanceVar === "friendly"){
                  setPower(Number(tankInput*5*(1+0.2*tankResearchLevel)+infantryInput*(1+0.2*infantryResearchLevel)).toFixed(1));
                  setPowerDefence(Number((tankInput*5*(1+0.2*tankResearchLevel)+infantryInput*(1+0.2*infantryResearchLevel)+(2*fortificationNum))*basicDefenceBonus*(1+0.4*fortificationNum)).toFixed(1))
               } else if (factionStanceVar === "enemy"){
                  setPower(Number(tankNum*5*(1+0.2*enemyTankResearchLevel)+infantryNum*(1+0.2*enemyInfantryResearchLevel)).toFixed(1));
                  setPowerDefence(Number((tankNum*5*(1+0.2*enemyTankResearchLevel)+infantryNum*(1+0.2*enemyInfantryResearchLevel)+(2*fortificationNum)*riverDefenceBonus)*basicDefenceBonus*(1+0.4*fortificationNum)).toFixed(1))
               }
                  //setAttackPower(Number(tankInput*5*(1+0.2*tankResearchLevel)+infNum*(1+0.2*enemyInfantryResearchLevel)).toFixed(1));
                  //setTotalDefence(powerDefence*riverDefenceBonus)
               setCostAttack(cost)
            }
         }

         if(factionStanceVar === "enemy"){
            console.log("Enemy if")
            let hostileFree = await CheckNeighbors(gameId, selection.name);
               if (hostileFree){
                  setInfantryNum("?")
                  setTanksNum("?")
                  setFortificationNum("?")
                  setPower("?")
                  setPowerDefence("?")
               } else {
                  
                  fullInformation("enemy");
               }
         } else {
            fullInformation("friendly");
         }

      }
      getDataSelection()
   }, [selection])

   useEffect(()=>{

      async function fetchData(){
      }

      fetchData();
   },[])

   async function reducePoints(cost){
      const points = Number((pts.pts -cost).toFixed(1))
      await updateDoc(docRefPlayers, {
         pointsToSpend: points,
      })
      dispatch(setPts({ pts: points}));
   }
   async function getTimeSinceLastAttack(){
      const docRefTerritory = doc(db, "games", gameId, "territories", selection.name);
      const docSnap = await getDoc(docRefTerritory)
      const lastAttack = docSnap.data().lastAttack;
      const currentTime = Date.now();
      const timeSinceLastAttack = Math.floor((currentTime - lastAttack)/1000/60);
      return timeSinceLastAttack;
   }
   async function updateLastAttack(){
      const docRefTerritory = doc(db, "games", gameId, "territories", selection.name);
      await updateDoc(docRefTerritory, {
         lastAttack: Date.now()
      })
   }

   async function triggerAttack () {
      const docRefTerritory = doc(db, "games", gameId, "territories", selection.name)
      const docSnapTerritory = await getDoc(docRefTerritory);

      setAttackPower(power)


      if (docSnapTerritory.data().controlledBy === faction.faction){
         setOldTankNum(tanksNum)
         setOldInfantryNum(infantryNum)
         setOldSelectionName(selection.name)
         setOldSelection(selection)
         setAttack(true)
      } else {
         alert("Select a territory controlled by you.")
      }
   }
   

   async function confirmAttack(){
      
      //Errors
      if (oldSelectionName === selection.name){
         alert("Cannot move to same territory.");
         return;
      }
      if ((tankInput > oldTankNum) || (infantryInput > oldInfantryNum)){
         console.log("Invalid attack. Not enough divisions.");
         return;
      } 

      const docRefFrom = doc(db, "games", gameId, "territories", oldSelectionName);
      const docSnapFrom = await getDoc(docRefFrom);
      const factionFrom = docSnapFrom.data().controlledBy;
      const docRefTo = doc(db, "games", gameId, "territories", selection.name);
      const docSnapTo = await getDoc(docRefTo);   
      const factionTo = docSnapTo.data().controlledBy;
      var cost;
      
      if (factionTo === factionFrom) { 

         //freeMoves and move cost
         const freeMovesNum = freeMoves.freeMoves;
         cost = 3;
         if (freeMovesNum > 0){
            cost = 0;
            dispatch(addFreeMoves({ freeAttacks: freeMoves.freeAttacks, freeMoves: freeMovesNum-1, distance: 1}));
            const docRefArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");
            updateDoc(docRefArmy, {
               freeMoves: increment(-1)
            })
         }
         await updateDoc(doc(db, "games", gameId, "players", user.uid), {
            pointsToSpend: pts.pts-cost,
         })
         dispatch(setPts({ pts: pts.pts-cost})); 
         const selectedT = await MoveCommand(gameId, user, pts, selection, cost, tankInput, infantryInput, oldSelectionName, selection.name, oldSelection);
         props.setSelectedTerritories(selectedT);

      } else if(factionTo !== factionFrom){

         //freeAttacks and attack cost
         const freeAttacksNum = freeMoves.freeAttacks;
         const riverDefenceBonus = RiverBonus(oldSelectionName, selection.name);
         cost = Math.floor((powerDefence*riverDefenceBonus/power)*4+1);

         if (freeAttacksNum > 0){
            cost = cost -2;
            dispatch(addFreeMoves({ freeAttacks: freeAttacksNum-1, freeMoves: freeMoves.freeMoves, distance: 1}));
            const docRefArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");
            updateDoc(docRefArmy, {
               freeAttacks: increment(-1)
            })
         }
         await updateDoc(doc(db, "games", gameId, "players", user.uid), {
            pointsToSpend: pts.pts-cost,
         })
         dispatch(setPts({ pts: pts.pts-cost})); 
         const selectedT = await AttackCommand(gameId, user, pts, selection, cost, tankInput, infantryInput, power, powerDefence, oldSelectionName, selection.name, oldSelection)
         props.setSelectedTerritories(selectedT);
         AttackCommand2(gameId, oldSelectionName, selection.name)
      }
      
      
      setAttack(false)
      setOldSelectionName(null)
   }
   function cancelAttack(){
      setOldSelectionName(false)
      setAttack(false)
   }
   async function fortify(){

      
      if (pts.pts < costFortify){
         alert("Not enough points.");
         return;
      } 
      let hostileFree = await CheckNeighbors(gameId, selection.name);
      if ( hostileFree === false) {
         alert("Cannot fortify at the front line.");
         return;
      }

      const docRefTerritory = doc(db, "games", gameId, "territories", selection.name);
      const docSnap = await getDoc(docRefTerritory)
      const lastFortified = docSnap.data().lastFortified;

      const currentTime = Date.now();
      const timeSinceLastFortifiedHours = Math.floor((currentTime - lastFortified)/1000/60/60);
      console.log(timeSinceLastFortifiedHours)

      if (timeSinceLastFortifiedHours < 24){
         alert("You already fortified. " + timeSinceLastFortifiedHours + " / 24 hours." )
         return;
      }

      const docRefFrom = doc(db, "games", gameId, "territories", selection.name);
      updateDoc(docRefFrom, {
         defenceLevel: increment(1)
      })
      reducePoints(costFortify)

   }
   async function assault(){

      let timeSinceLastAttack = getTimeSinceLastAttack()
      const docRefTerritory = doc(db, "games", gameId, "territories", selection.name);
      const docSnap = await getDoc(docRefTerritory)

      if(pts.pts > costAssault & timeSinceLastAttack > 300 & docSnap.data().defenceLevel > -4){

         //reduce Defence level
         updateDoc(docRefTerritory, {
               defenceLevel: increment(-1)
            })

            updateLastAttack()
            reducePoints(costAssault)
      } else {
         alert("Not enough points or troops have not yet reorganized.")
      }
      

   }
   async function artilleryBarrage(){
      if(pts.pts > costArtilleryBarrage){
         const docRefTerritory = doc(db, "games", gameId, "territories", selection.name);
         const docSnapTerritory = await getDoc(docRefTerritory);

         //calculate shattered divisions
         let shatteredInfDivs=Math.floor(docSnapTerritory.data().infDivs*Math.random()*0.15);
         let shatteredTankDivs=Math.floor(docSnapTerritory.data().infDivs*Math.random()*0.05)
         
         //reduce divisions
         updateDoc(docRefTerritory, {
            infDivs: increment(-shatteredInfDivs)
         })
         updateDoc(docRefTerritory, {
            tankDivs: increment(-shatteredTankDivs)
         })

         reducePoints(costArtilleryBarrage)
      } else {
         alert("Not enough points.")
      }
   }

   return (
      <>
      
      {hidden ? 
      (<>
      <Draggable>
      <div className="dashboardSvgMin">
         <button className="buttonSVG" onClick={()=>setHidden(false)}>Show</button>
      </div>
      </Draggable>
      </>)
      :
      (<>
      <Draggable>
      <div className="dashboardSvg">
      <div className='gameInfoGridSVG'>
      <div>
         <h4>Available points: {pts.pts}</h4>
         <h4>Free attacks / moves: {freeMoves.freeAttacks} / {freeMoves.freeMoves}</h4>
      </div>
      <div> 
         <h4>Selected territory: </h4>
         {oldSelectionName ? (<>
         <section>
            <h4>{oldSelectionName} 
            <img 
               src="../images/icons/ContinueIconRound.svg" height="15px" alt="continueIcon" 
            />
            {selection.name}</h4>
         </section>
         </>)
         :(<>
         <h4>{selection.name}</h4>
         </>)}
      </div>
         {attack ? 
         (<>
            <div>
               <h4>Tank divisions: </h4>
               <section className='gameInfoContainerInput'>
                  <input className='inputInfo' type="number"
                     onChange={e=>setTankInput(e.target.value)}
                     value={tankInput}
                  />
                  <h4>({oldTankNum})</h4>
                  <img src="../images/icons/ContinueIconRound.svg" height="15px" alt="continueIcon" />
                  <h4>{tanksNum}</h4>
               </section>
               <h4>Infantry divisions: </h4>
               <section className='gameInfoContainerInput'>
                  <input className='inputInfo' type="number"
                     onChange={e=>setInfantryInput(e.target.value)}
                     value={infantryInput}
                  />
                  <h4>({oldInfantryNum})</h4>
                  <img src="../images/icons/ContinueIconRound.svg" height="15px" alt="continueIcon" />
                  <h4>{infantryNum}</h4>
               </section>
               <h4>Strength: {power} / {powerDefence}</h4>
               <h4>Cost to attack: {costAttack} points.</h4>
            </div>

            <section >
               <button className="buttonSVG" onClick={()=>confirmAttack()}>Confirm</button>
               <button className="buttonSVG" onClick={cancelAttack}>Cancel</button>
            </section>
         </>):(<>
            <div>
               <section className='gameInfoContainerPre'>
                  <h4>Controlled by:</h4>
                  <h4>{faction.faction}</h4>
               </section>
               <section className='gameInfoContainerPre'>
                  <h4>Tank divisions: </h4>
                  <h4>{tanksNum}</h4>
               </section>
               <section className='gameInfoContainerPre'>
                  <h4>Infantry divisions: </h4>
                  <h4>{infantryNum}</h4>
               </section>
               <section className='gameInfoContainerPre'>
                  <h4>Fortification level: </h4>
                  <h4>{fortificationNum}</h4>
               </section>
               <section className='gameInfoContainerPre'>
                  <h4>Offensive strength: </h4>
                  <h4>{power}</h4>
               </section>
               <section className='gameInfoContainerPre'>
                  <h4>Defensive strength: </h4>
                  <h4>{powerDefence}</h4>
               </section>
            </div>
            {factionStance === "friendly" ?
            (<>
            <div>
               <button className="buttonSVG" onClick={fortify}>Fortify</button>
               <button className="buttonSVG" onClick={()=>triggerAttack()}>Use to attack / move</button>
            </div>
            </>)
            :
            (<>
            <div>
               <button className="buttonSVG" onClick={assault}>Assault</button>
               <button className="buttonSVG" onClick={artilleryBarrage}>Artillery Barrage</button>
            </div>
            </>)
            }
            
         </>)
         }
   </div>
   </div>
   </Draggable>
      </>)
      }
   

      
   </>
   )
}

export default TerritorySelection

/*
<button className="buttonSVG" onClick={()=>setHidden(true)}>Hide</button>

if(pts.pts > 5 & timeSinceLastAttack > 300){
   await updateDoc(docRefPlayers, {
      pointsToSpend: pts.pts -3
   })
   dispatch(setPts({ pts: pts.pts -3}));
} else {
   alert("Not enough points or troops have not yet reorganized.")
}

*/