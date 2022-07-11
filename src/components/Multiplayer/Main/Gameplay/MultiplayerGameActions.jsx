import React, {useState, useEffect} from 'react'
import { db } from '../../../../firebase-config';
import { doc, getDoc, increment, arrayRemove, arrayUnion, setDoc, updateDoc} from "firebase/firestore";
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { setPts } from "../../../../features/pts";
import { setDeployableDivs } from '../../../../features/deployableDivs';
import { Bases } from '../svgComponents/MainMap';
   

const MultiplayerGameActions = (props) => {

   //basic setup
   const location = useLocation();
   const dispatch = useDispatch();
   const gameId = location.state.id;
   const user = useSelector((state) => state.user.value)
   const pts = useSelector((state) => state.pts.value)
   const deployableDivs = useSelector((state) => state.deployableDivs.value)

   const ActionCost = 20;
   const reinforceDaugavaCost = 20;
   const retreatAllCost = 5;
   const reinforceSmolenskCost = 20;

   const docRefGame = doc(db, "games", gameId);
   const docRefActions = doc(db, "games", gameId, "ww2", "actions");

   const [reallySurrender, setReallySurrender] = useState(false)

   const [retreatedAll, setRetreatedAll] = useState(false)
   const [daugavaRF, setdaugavaRF] = useState(false)
   const [smolenskRF, setSmolenskRF] = useState(false)
   const [dniperRF, setDniperRF] = useState(false)
   const [leningradFortified, setLeningradFortified] = useState(false)
   const [moscowFortified, setMoscowFortified] = useState(false)
   const [leningradRF, setLeningradRF] = useState(false)
   const [moscowRF, setMoscowRF] = useState(false)

   const [unlocked, setUnlocked] = useState(false);
   const [loaded, setLoaded] = useState(false);
   const [chooseRfLocationNorth, setChooseRfLocationNorth] = useState(false)
   const [chooseRfLocationCenter, setChooseRfLocationCenter] = useState(false)
   const [chooseRfLocationSouth, setChooseRfLocationSouth] = useState(false)
   const [chooseRfLocationDeepSouth, setChooseRfLocationDeepSouth] = useState(false)
   const [chooseRfLocationFinland, setChooseRfLocationFinland] = useState(false)
   const [chooseRfLocationDeployable, setChooseRfLocationDeployable] = useState(false)

   const [germanRfNorth, setGermanRfNorth] = useState("East_Prussia")
   const [germanRfCenter, setGermanRfCenter] = useState("Poland")
   const [germanRfSouth, setGermanRfSouth] = useState("Poland")
   const [germanRfDeepSouth, setGermanRfDeepSouth] = useState("Romania")

   const [northRFBases, setNorthRFBases] = useState(["East Prussia"])
   const [centerRFBases, setCenterRFBases] = useState(["Poland"])
   const [southRFBases, setSouthRFBases] = useState(["Poland"])
   const [deepSouthRFBases, setDeepSouthRFBases] = useState(["Romania"])

   const daugavaArray = ["Riga", "Aizkraukle", "Jekabpils", "Daugavpils", "Kraslava", "Moiry", "Verkhnyadzvinsk",
      "Navapolatsk", "Sumilna"]
   const daugavaArrayB = ["Sigulda", "Valmiera", "Madona", "Rezekne", "Ludza", "Nevel",
      "Opukhliki", "Haradok"]
   const smolenskGomelArray = ["Vitebsk", "UnnaBeshenkovichi", "Orsa", "Chavusy", "Bykhaw",
      "Kanhnho", "Svietlahorsk", "Kapmaebl", "Chojniki"]
   const smolenskGomelArrayB = ["Berezino", "Krasny", "Kadino", "Monastyrshchina","Lobkovichi",
      "Cherykaw", "Kapma", "Vietka", "Gomel", "Horodnya", "Honcharivske"]
   const dniperArray = ["Chernobyl", "Boryspil", "Pereyaslav-Khmelnytskyi", "Shramkivka", "Lazirky",
      "Lubny", "Myrhorod", "Poltava", "Mahdalynivka", "Synelnykove", "Zaporozhe", "Enerhodor",
      "Nova Kakhovka", "Kherson"]
   const dniperArrayB = ["Oster", "Nizhyn", "Yahotyn", "Pryluky", "Pyryatyn", "Lokhvytsya", "Hadyach",
      "Kotelva", "Karlivka", "Krasnohrad", "Pereshchepyne", "Pavlohrad", "Vasylkivka", "Novomykolaivka",
      "Melitopol", "Tavrychanka", "Novotroits'ke", "Skadovs'k", "Bekhtery"
   ]

   useEffect(()=>{

      async function fetchData(){
         const docSnap = await getDoc(docRefActions)
         setRetreatedAll(docSnap.data().retreatedAll)
         setdaugavaRF(docSnap.data().daugavaRF)
         setSmolenskRF(docSnap.data().smolenskRF)
         setDniperRF(docSnap.data().dniperRF)
         setLeningradFortified(docSnap.data().leningradFortified)
         setMoscowFortified(docSnap.data().moscowFortified)
         setGermanRfNorth(docSnap.data().RFBaseNorth)
         setGermanRfCenter(docSnap.data().RFBaseCenter)
         setGermanRfSouth(docSnap.data().RFBaseSouth)
         setGermanRfDeepSouth(docSnap.data().RFBaseDeepSouth)
         setLeningradRF(docSnap.data().RFLeningrad)
         setMoscowRF(docSnap.data().RFMoscow)
         setUnlocked(docSnap.data().daugavaDniperBroken)
         setLoaded(true)

         const docRefArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");
         const docSnapArmy = await getDoc(docRefArmy);
         const deployableInfNum = docSnapArmy.data().deployableInfDivs;
         const deployableTankNum = docSnapArmy.data().deployableTankDivs;
         dispatch(setDeployableDivs({infDivs: deployableInfNum , tankDivs: deployableTankNum}))

      }

      fetchData();
   }, [])

   async function applyTerritoryColor(territoryName){

      const docRefTerritory = doc(db, "games", gameId, "territories", territoryName);
      const docRefGerman = doc(db, "games", gameId, "german", "territories");
      const docSnapTerritory = await getDoc(docRefTerritory);
      
      var type;
      var path;

      if(docSnapTerritory.data().tankDivs > 0){type = "tank"}
      else if(docSnapTerritory.data().infDivs > 0){type = "inf"}
      else {type = "empty"}
      

      for(let i = 0; i<Bases.length; i++){
         if (territoryName === Bases[i].id){
            path = Bases[i].d;
         }
      }
      console.log(territoryName)
      console.log(path)
      console.log(type)
      
      await updateDoc(docRefGerman, {
         territories: arrayRemove({name: territoryName, path: path, type: type})
      })
      await updateDoc(docRefGerman, {
         territories: arrayUnion({name: territoryName, path: path, type: "tank"})
      })
      const docSnapGerman = await getDoc(docRefGerman)
      props.setSelectedTerritories(docSnapGerman.data().territories)
   }


   function retreatAll(){
      if (pts.pts < retreatAllCost){alert("Retreating costs 5 points. You have " + pts.pts + ".")}
      else {

         //RETREAT ALL CODE STILL MISSING


         updateDoc(docRefActions, {
            retreatedAll: retreatedAll+1
         })
         setRetreatedAll(retreatedAll+1)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-5)
         })
         dispatch(setPts({ pts: pts.pts -retreatAllCost}));
      }
   }

   function reinforceDaugava(){

      if (pts.pts < reinforceDaugavaCost){alert("Reinforcing costs 20 points. You have " + pts.pts + ".")}
      else {
         for(let i = 0; i<daugavaArray.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", daugavaArray[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(4)
            })
         }
         for(let i = 0; i<daugavaArrayB.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", daugavaArrayB[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(1)
            })
         }
         updateDoc(docRefActions, {
            daugavaRF: true
         })
         setdaugavaRF(true)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-reinforceDaugavaCost)
         })
         dispatch(setPts({ pts: pts.pts -reinforceDaugavaCost}));
      }
   }
   function reinforceDniper(){
      if (pts.pts < 20){alert("Reinforcing costs 20 points. You have " + pts.pts + ".")}
      else {
         for(let i = 0; i<dniperArray.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", dniperArray[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(4)
            })
         }
         for(let i = 0; i<dniperArrayB.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", dniperArrayB[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(1)
            })
         }
         updateDoc(docRefActions, {
            dniperRF: true
         })
         setDniperRF(true)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-20)
         })
         dispatch(setPts({ pts: pts.pts -20}));
      }
   }
   function reinforceSmolenskGomel(){
      if (pts.pts < 20){alert("Reinforcing costs 20 points. You have " + pts.pts + ".")}
      else {
         for(let i = 0; i<smolenskGomelArray.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", smolenskGomelArray[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(4)
            })
         }
         for(let i = 0; i<smolenskGomelArrayB.length;i++){
            const docRefGerman = doc(db, "games", gameId, "territories", smolenskGomelArrayB[i]);
            updateDoc(docRefGerman, {
               infDivs: increment(1)
            })
         }
         updateDoc(docRefActions, {
            smolenskRF: true
         })
         setSmolenskRF(true)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-reinforceSmolenskCost)
         })
         dispatch(setPts({ pts: pts.pts-reinforceSmolenskCost}));
      }
   }
   function reinforceLeningrad(){
      if (pts.pts < 20){alert("Reinforcing costs 20 points. You have " + pts.pts + ".")}
      else {
         updateDoc(doc(db, "games", gameId, "territories", "Petergof"), {
            infDivs: increment(5)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Tosno"), {
            infDivs: increment(5),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Kirovsk"), {
            infDivs: increment(3),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Vsevolozhsk"), {
            infDivs: increment(4),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Leningrad"), {
            infDivs: increment(4),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Sanatoriy"), {
            infDivs: increment(1)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Zaporozhskoye"), {
            infDivs: increment(1)
         })
         updateDoc(docRefActions, {
            leningradRF: true
         })
         setLeningradRF(true)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-20)
         })
         dispatch(setPts({ pts: pts.pts -20}));
      }
   }
   function reinforceMoscow(){
      if (pts.pts < 20){alert("Reinforcing costs 20 points. You have " + pts.pts + ".")}
      else {
         updateDoc(doc(db, "games", gameId, "territories", "Moscow"), {
            infDivs: increment(4)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Podolsk"), {
            infDivs: increment(5),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Odintsovo"), {
            infDivs: increment(5),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Zelenograd"), {
            infDivs: increment(5),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Klin"), {
            infDivs: increment(2),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Elektrostal"), {
            infDivs: increment(2),
            tankDivs: increment(1),
         })
         updateDoc(doc(db, "games", gameId, "territories", "Dmitrov"), {
            infDivs: increment(2)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Sergiev Posad"), {
            infDivs: increment(2)
         })
         updateDoc(docRefActions, {
            leningradRF: true
         })
         setLeningradRF(true)
         updateDoc(doc(db, "games", gameId, "players", user.uid),{
            pointsToSpend: increment(-20)
         })
         dispatch(setPts({ pts: pts.pts -20}));
      }
   }
   function fortifyLeningrad(){
      if (pts.pts < 10){alert("Fortifying costs 10 points. You have " + pts.pts + ".")}
      else {
         updateDoc(doc(db, "games", gameId, "territories", "Petergof"), {
            defenceLevel: increment(2)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Tosno"), {
            defenceLevel: increment(2)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Kirovsk"), {
            defenceLevel: increment(1)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Vsevolozhsk"), {
            defenceLevel: increment(4)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Leningrad"), {
            defenceLevel: increment(6)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Sanatoriy"), {
            defenceLevel: increment(1)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Zaporozhskoye"), {
            defenceLevel: increment(1)
         })
         updateDoc(docRefActions, {
            leningradFortified: true
         })
         setLeningradFortified(true)
      }
   }
   function fortifyMoscow(){
      if (pts.pts < 10){alert("Fortifying costs 10 points. You have " + pts.pts + ".")}
      else {
         updateDoc(doc(db, "games", gameId, "territories", "Moscow"), {
            defenceLevel: increment(8)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Podolsk"), {
            defenceLevel: increment(5)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Odintsovo"), {
            defenceLevel: increment(4)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Zelenograd"), {
            defenceLevel: increment(4)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Klin"), {
            defenceLevel: increment(3)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Elektrostal"), {
            defenceLevel: increment(3)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Dmitrov"), {
            defenceLevel: increment(2)
         })
         updateDoc(doc(db, "games", gameId, "territories", "Sergiev Posad"), {
            defenceLevel: increment(2)
         })
         updateDoc(docRefActions, {
            moscowFortified: true
         })
         setMoscowFortified(true)
      }
   }

   //Germany
   async function germanReinforceNorth(){
      if (chooseRfLocationNorth === true){
            setChooseRfLocationNorth(!chooseRfLocationNorth)
      } else {
         if (pts.pts  > 10){
            const docSnap = await getDoc(docRefActions);
            setNorthRFBases(docSnap.data().RFBasesNorth)
            setChooseRfLocationNorth(!chooseRfLocationNorth)
         } else {
            alert("Reinforcing costs 10 points. You have " + pts.pts  + ".")
         }
      }
   }
   async function germanReinforceCenter(){
      if (chooseRfLocationCenter === true){
            setChooseRfLocationCenter(!chooseRfLocationCenter)
      } else {
         if (pts.pts  > 10){
            const docSnap = await getDoc(docRefActions);
            setCenterRFBases(docSnap.data().RFBasesCenter)
            setChooseRfLocationCenter(!chooseRfLocationCenter)
         } else {
            alert("Reinforcing costs 10 points. You have " + pts.pts  + ".")
         }
      }
   }
   async function germanReinforceSouth(){
      if (chooseRfLocationSouth === true){
            setChooseRfLocationSouth(!chooseRfLocationSouth)
      } else {
         if (pts.pts  > 10){
            const docSnap = await getDoc(docRefActions);
            setSouthRFBases(docSnap.data().RFBasesSouth)
            setChooseRfLocationSouth(!chooseRfLocationSouth)
         } else {
            alert("Reinforcing costs 10 points. You have " + pts.pts  + ".")
         }
      }

   }
   async function germanReinforceDeepSouth(){
      if (chooseRfLocationDeepSouth === true){
         setChooseRfLocationDeepSouth(!chooseRfLocationDeepSouth)
      } else {
         if (pts.pts  > 10){
            const docSnap = await getDoc(docRefActions);
            setDeepSouthRFBases(docSnap.data().RFBasesDeepSouth)
            setChooseRfLocationDeepSouth(!chooseRfLocationDeepSouth)
         } else {
            alert("Reinforcing costs 10 points. You have " + pts.pts  + ".")
         }
      }
   }
   async function germanReinforceFinland(){
      if (chooseRfLocationFinland === true){
            setChooseRfLocationFinland(!chooseRfLocationFinland)
      } else {
         if (pts.pts  > 10){
            const docSnap = await getDoc(docRefActions);
            setChooseRfLocationDeepSouth(!chooseRfLocationFinland)
         } else {
            alert("Reinforcing costs 10 points. You have " + pts.pts  + ".")
         }
      }
   }

   async function triggerDeploy(){
      setChooseRfLocationDeployable(!chooseRfLocationDeployable)
      const docSnap = await getDoc(docRefActions);
      setCenterRFBases(docSnap.data().RFBasesCenter)
   }

   function deployToBase(base){
      console.log(base)
      const docRefBase = doc(db, "games", gameId, "territories", base);
      updateDoc(docRefBase, {
         infDivs: increment(deployableDivs.infDivs),
         tankDivs: increment(deployableDivs.tankDivs),
      })
      applyTerritoryColor(base)
      dispatch(setDeployableDivs({ infDivs: 0, tankDivs: 0}));

      const docRefArmy = doc(db, "games", gameId, "players", user.uid, "ww2", "army");
      updateDoc(docRefArmy, {
         deployableInfDivs: 0,
         deployableTankDivs: 0,
      })

   }


   function reinforceBase(base){
      console.log(base)
      const docRefBase = doc(db, "games", gameId, "territories", base);
      updateDoc(docRefBase, {
         infDivs: increment(5),
         tankDivs: increment(1),
      })
      const newPoints = Number((pts.pts-20).toFixed(1))
      updateDoc(doc(db, "games", gameId, "players", user.uid),{
         pointsToSpend: newPoints
      })
      dispatch(setPts({ pts: newPoints}));
      applyTerritoryColor(base)
   }

   async function surrender(){
      var number = 0;
      if(props.faction === "Germany"){
         number = -10;
         updateDoc(docRefGame, {
         victory: number
         })
      } else if (props.faction === "Russia"){
         number = 10;
         updateDoc(docRefGame, {
            victory: number
         })
      }
      props.setVictory(number)
   }

   if (loaded === false){
      return <div>Loading...</div>
   }

   return (
      <>
      <div className='actions-container'>
         {props.faction === "Russia" ?
         (<>
            {retreatedAll < 6 ? (<></>) :
            <button onClick={retreatAll}>Retreat all front units by 1 territory. (5)</button>}
            {daugavaRF ? (<></>) :
            <button onClick={reinforceDaugava}>Reinforce the Daugava river river line from Riga-Vitebsk. (20) </button>}
            {dniperRF ? (<></>) :
            <button onClick={reinforceDniper}>Reinforce the Dniper river line from Dnipro-Kiev. (30)</button>}
            {smolenskRF ? (<></>) :
            <button onClick={reinforceSmolenskGomel}>Reinforce the Smolensk-Golem area. 16*4=64+32 divisions. (30)</button>}

            {unlocked ?
            <div>
               {leningradFortified ? (<></>) :
               <button onClick={fortifyLeningrad}>Fortify the Leningrad area (10)</button>}
               {moscowFortified ? (<></>) :
               <button onClick={fortifyMoscow}>Fortify the Leningrad area (10)</button>}
               {leningradRF ? (<></>) :
               <button onClick={reinforceLeningrad}>Reinforce the Leningrad area (20)</button>}
               {moscowRF ? (<></>) :
               <button onClick={reinforceMoscow}>Reinforce the Moscow area (20)</button>}
               
               <button>Reinforce Pskov, Tallinn and Narva (10)</button>
               <button>Reinforce Leningrad (10)</button>
               <button>Reinforce the Crimea and Sevastopol (10)</button>
               <button>Build up the Crimea and Sevastopol (5)</button>
               <button>Reinforce the Vyazma and Tula areas (20)</button>
               <button>Reinforce Kursk and Kharkov (20)</button>
               <button>Reinforce the Voronezh-Rostov River line (20)</button>
               <button>Reinforce the Moscow area (40)</button>
               <button>Reinforce Stalingrad (30)</button>
               <button>Reinforce the Saratow-Astrakhan river line (20)</button>
               <button>Reinforce Maikop and Grozny (20)</button>
            </div>:
            <div>
               <h4>Germany must cross the the first Riga-Smolensk-Kiev-Dnipro Line for more options to be unlocked.</h4>
            </div>
            }
         </>)
         :
         (<>
            <button onClick={germanReinforceNorth}>Reinforce the northern front.</button>
            {chooseRfLocationNorth ?
               northRFBases.map((base)=>{
                  return <button className="reinforceButton" onClick={()=>reinforceBase(base)}>{base}</button>
               })
            :(<></>)}

            <button onClick={germanReinforceCenter}>Reinforce the central front.</button>
            {chooseRfLocationCenter ?
               centerRFBases.map((base)=>{
                  return <button className="reinforceButton" onClick={()=>reinforceBase(base)}>{base}</button>
               })
            :(<></>)}
            <button onClick={germanReinforceSouth}>Reinforce the southern front.</button>
            {chooseRfLocationSouth ?
               southRFBases.map((base)=>{
                  return <button className="reinforceButton" onClick={()=>reinforceBase(base)}>{base}</button>
               })
            :(<></>)}
            <button onClick={germanReinforceDeepSouth}>Reinforce the southern coastal front.</button>
            {chooseRfLocationDeepSouth ?
               deepSouthRFBases.map((base)=>{
                  return <button className="reinforceButton" onClick={()=>reinforceBase(base)}>{base}</button>
               })
            :(<></>)}
            <button onClick={germanReinforceFinland}>Reinforce the finnish front.</button>
            {chooseRfLocationFinland ?
            <button className="reinforceButton" onClick={()=>reinforceBase("Finland")}>Finland</button>
            :(<></>)}
         </>) 
         }
         <button onClick={triggerDeploy}>Deployable from production (center): {deployableDivs.infDivs} Infantry and {deployableDivs.tankDivs} Tanks</button>
         {chooseRfLocationDeployable ?
            centerRFBases.map((base)=>{
               return <button className="reinforceButton" onClick={()=>deployToBase(base)}>{base}</button>
            })
         :(<></>)}
         
      </div>
      <div className='actions-container'>
         {reallySurrender ?
         <><button  onClick={surrender} className='surrender-button'>Are you sure you want to surrender?</button>
         <img onClick={()=>setReallySurrender(false)}src="/images/icons/delete.png" width="30px" alt="cancel" /></>
         :
         <><button onClick={()=>setReallySurrender(true)} className='surrender-button'>Surrender</button></>}
      </div>
      </>
   )
}

export default MultiplayerGameActions

//Garrisons at Minsk, Kiev and Odessa.

// Give murmansk area high defence bonuses
// Option to assault a city which reduces defence bonuses
// -> every 10h attack that requires 5 points already budgeted before, defender has
// possibility to match with 5 points

//Free 15 moves per day for Soviet
//Free 5 moves per day for Germany

//Reinforce place of selected territory and neigbors also -> costs more than other
// actions and can only be done if neigbor isnt german

//Have divisions counts in game info Economy of both nations
// Attacking should always

//