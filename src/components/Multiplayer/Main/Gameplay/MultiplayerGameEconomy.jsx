import React, {useState, useEffect} from 'react'
import { UpgradeableItem } from '../../Components/UpgradeableItem';
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux"
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion} from "firebase/firestore";

const MultiplayerGameEconomy = (props) => {

   //setup
   const location = useLocation();
   const gameId = location.state.id;
   const user = useSelector((state) => state.user.value)
   const pts = useSelector((state) => state.pts.value)
   const docRefGame = doc(db, "games", gameId);
   const docRefGameEco = doc(db, "games", gameId, "players", user.uid, "ww2", "economy");

   const [playerCount, setPlayerCount] = useState(1)

   const [economyLevel, setEconomyLevel] = useState(1)
   const [infrastructureLevel, setInfrastructureLevel] = useState(1)
   const [tankProductionLevel, setTankProductionLevel] = useState(1)
   const [armyTrainingLevel, setArmyTrainingLevel] = useState(1)
   const [recruitmentLevel, setRecruitmentLevel] = useState(1)
   const [propagandaLevel, setPropagandaLevel] = useState(1)
   const [tankResearchLevel, setTankResearchLevel] = useState(1)
   const [armyResearchLevel, setArmyResearchLevel] = useState(1)
   const [infantryResearchLevel, setInfantryResearchLevel] = useState(1)

   const [economyLevelEnemy, setEconomyLevelEnemy] = useState(1)
   const [infrastructureLevelEnemy, setInfrastructureLevelEnemy] = useState(1)
   const [tankProductionLevelEnemy, setTankProductionLevelEnemy] = useState(1)
   const [armyTrainingLevelEnemy, setArmyTrainingLevelEnemy] = useState(1)
   const [recruitmentLevelEnemy, setRecruitmentLevelEnemy] = useState(1)
   const [propagandaLevelEnemy, setPropagandaLevelEnemy] = useState(1)
   const [tankResearchLevelEnemy, setTankResearchLevelEnemy] = useState(1)
   const [armyResearchLevelEnemy, setArmyResearchLevelEnemy] = useState(1)
   const [infantryResearchLevelEnemy, setInfantryResearchLevelEnemy] = useState(1)


   const [territoryPoints, setTerritoryPoints] = useState(1)
   const [playerFaction, setPlayerFaction] = useState(null)
   const [totalEconomy, setTotalEconomy] = useState(1)
   const [showEnemyUpgrades, setShowEnemyUpgrades] = useState(false)
   const [enemyPlayerPosition, setEnemyPlayerPosition] = useState(0)
   const [moreThanTwoEnabled, setMoreThanTwoEnabled] = useState(false)

   var upgradeReduction = 0;

   //const [pts, setPts] = useState(0);
   
   useEffect( ()=> {
      fetchData();
   }, [])

   async function fetchData(){
      const docSnap = await getDoc(docRefGameEco);
      setEconomyLevel(docSnap.data().economyLevel)
      setInfrastructureLevel(docSnap.data().infrastructureLevel)
      setTankProductionLevel(docSnap.data().tankProductionLevel)
      setArmyTrainingLevel(docSnap.data().armyTrainingLevel)
      setRecruitmentLevel(docSnap.data().recruitmentLevel)
      setTankResearchLevel(docSnap.data().tankResearchLevel)
      setPropagandaLevel(docSnap.data().propagandaLevel)
      setArmyResearchLevel(docSnap.data().armyResearchLevel)
      //setWinterPreparationLevel(docSnap.data().winterPreparationLevel)
      setInfantryResearchLevel(docSnap.data().infantryResearchLevel)
      
      const docSnip = await getDoc(docRefGame);

      setPlayerCount(docSnip.data().playerCount)

      if (docSnip.data().playersGermany[0] === user.uid){
         setPlayerFaction("germany")
      } else {
         setPlayerFaction("russia")
      }

      if (playerFaction === "germany"){
         if (economyLevel === 2 || economyLevel === 3 ){
            upgradeReduction = 1
         } else if (economyLevel === 4 || economyLevel === 5 ){
            upgradeReduction = 2
         } else if (economyLevel === 6 || economyLevel === 7 ){
            upgradeReduction = 3
         } else if (economyLevel === 8 || economyLevel === 9 ){
            upgradeReduction = 4
         } else if (economyLevel === 10 || economyLevel === 11 ){
            upgradeReduction = 5
         }
      }
      else if (playerFaction === "russia"){
         if (economyLevel >= 2 & economyLevel < 7 ){
            upgradeReduction = 1
         } else if (economyLevel >= 7){
            upgradeReduction = 2
         }
      }

   }

   useEffect( ()=>{
      
      async function fetchData(){
         const docSnip = await getDoc(docRefGame)
         setTerritoryPoints((docSnip.data().germanTerritoryPoints).toFixed(1))
         setTotalEconomy((docSnip.data().germanTerritoryPoints*(1+0.1*economyLevel)).toFixed(1))
      }
      fetchData();
   },[pts])

   async function enemyUpgrades (){
      const docSnapGame = await getDoc(docRefGame)
      const playersArray = docSnapGame.data().players;
      var enemyPlayersArray = [];
      for (let i = 0; i<playersArray.length; i++){
         if (user.uid !== playersArray[i]){
            enemyPlayersArray.push(playersArray[i])
         }
      }


      const docRefGameEcoEnemy = doc(db, "games", gameId, "players", enemyPlayersArray[enemyPlayerPosition], "ww2", "economy");
      const docSnapEnemy = await getDoc(docRefGameEcoEnemy);
      setEconomyLevelEnemy(docSnapEnemy.data().economyLevel)
      setInfrastructureLevelEnemy(docSnapEnemy.data().infrastructureLevel)
      setTankProductionLevelEnemy(docSnapEnemy.data().tankProductionLevel)
      setArmyTrainingLevelEnemy(docSnapEnemy.data().armyTrainingLevel)
      setRecruitmentLevelEnemy(docSnapEnemy.data().recruitmentLevel)
      setTankResearchLevelEnemy(docSnapEnemy.data().tankResearchLevel)
      setPropagandaLevelEnemy(docSnapEnemy.data().propagandaLevel)
      setArmyResearchLevelEnemy(docSnapEnemy.data().armyResearchLevel)
      setInfantryResearchLevelEnemy(docSnapEnemy.data().infantryResearchLevel)

      setShowEnemyUpgrades(!showEnemyUpgrades)
   }

   function changeEnemyUpgrades (change){
      setEnemyPlayerPosition(enemyPlayerPosition + change);
      enemyUpgrades();
   }

   if(playerFaction === null){return null}

   return (
      <>
      <div className='GameInfoMainDiv'>
         <UpgradeableItem
            productionTypeText="Propaganda Level"
            productionType="propagandaLevel"
            description="increases the amount of points you get from productivity time by 0.1 per 30 mins"
            productionLevel={propagandaLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={null}
            upgradeItem={()=>setPropagandaLevel(propagandaLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Economy Level"
            productionType="economyLevel"
            description="increases the amount of points you naturally generate every hour by 10%."
            productionLevel={economyLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={null}
            upgradeItem={()=>setEconomyLevel(economyLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Inftrastructure Level"
            productionType="infrastructureLevel"
            description="increases the movement capabilities of your troops.
            (lvl1: 1 territory per move, lvl2: +2 free moves, lvl 3: +1 ter per move, lvl4: +1 free move,
            lvl5: +1 free move, lvl 6: +1 free move, lvl 7: +1 territory per move, lvl 8: +1 free move,
            lvl9: +1 free move, lvl 10: unlimited free moves)"
            productionLevel={infrastructureLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={null}
            upgradeItem={()=>setInfrastructureLevel(infrastructureLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Tank Production Level"
            productionType="tankProductionLevel"
            description="Reduces the amount of time it takes to automatically spawn new tank divisions by 5%."
            productionLevel={tankProductionLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={null}
            upgradeItem={()=>setTankProductionLevel(tankProductionLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Tank Research Level"
            productionType="tankResearchLevel"
            description="Increases fighting strength of tank divisions by 20%."
            productionLevel={tankResearchLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setTankResearchLevel(tankResearchLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Recruitment Level"
            productionType="recruitmentLevel"
            description="Reduces the amount of time it takes to automatically spawn new infantry divisions by 5%."
            productionLevel={recruitmentLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setRecruitmentLevel(recruitmentLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Inf. Research Level"
            productionType="infantryResearchLevel"
            description="Increases fighting strength of infantry divisions by 20%."
            productionLevel={infantryResearchLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setInfantryResearchLevel(infantryResearchLevel+1)}
         />
         <UpgradeableItem
            productionTypeText="Army Training Level"
            productionType="armyTrainingLevel"
            description="Offers diverse benefits to your troops.
            (lvl1: -1 cost to attack, lvl2: -1 cost to assault, lvl 3: -10% shatter probability, lvl4: +1 cost for enemy to attack,
            lvl5: -1 cost to attack, lvl 6: -1 cost to assault, lvl 7: -10% shatter probability, lvl 8: +1 cost for enemy to attack,
            lvl9: -1 cost to attack, lvl 10: -1 cost to attack)"
            productionLevel={armyTrainingLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setArmyTrainingLevel(armyTrainingLevel+1)}
         />
         {playerFaction === "germany" ? 
         <UpgradeableItem
            productionTypeText="Army Research"
            productionType="armyResearchLevel"
            description="Offers diverse benefits to your troops.
            (lvl2: -1 cost to upgrade, lvl 3: -1 cost of artillery barrage, lvl4: -1 cost to upgrade,
            lvl5: -1 cost to fortify, lvl 6: -1 cost to upgrade, lvl 7: +10 damage artillery barrage, lvl 8: -1 cost to upgrade,
            lvl9: -3 daily cost to prepare offensive, lvl 10: unlock counter attack ability)"
            productionLevel={armyResearchLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setArmyResearchLevel(armyResearchLevel+1)}
         />
         :
         <UpgradeableItem
            productionTypeText="Army Research Level"
            productionType="armyResearchLevel"
            description="Offers diverse benefits to your troops.
            (lvl2: -1 cost to upgrade, lvl 3: -5 cost on all actions, lvl4: +20% strength of fortifications
            lvl5: -1 cost to fortify, lvl 6: -1 cost of artillery barrage lvl 7: -1 cost to upgrade, lvl 8: +20% strength of fortifications,
            lvl9: -1 cost of artillery barrage, lvl 10: unlock the katyusha ability)"
            productionLevel={armyResearchLevel}
            upgradeReduction={upgradeReduction}
            playerFaction={playerFaction}
            upgradeItem={()=>setArmyResearchLevel(armyResearchLevel+1)}
         />
         }
      </div>
      <div className='GameInfoMainDiv'>

         <h3>Number of occupied territories: </h3>
         <h3>Number of occupation points: {territoryPoints}</h3>
         <h3>Total economy: {totalEconomy}</h3>
         <h3 className="economy-pseudo-button" onClick={()=>enemyUpgrades()}>Show enemy levels</h3>
         {showEnemyUpgrades?
            <section>
               {moreThanTwoEnabled?
               <section>
                  <h4 onClick={()=>changeEnemyUpgrades(-1)}>previous</h4>
                  <h4 onClick={()=>changeEnemyUpgrades(1)}>next</h4>
               </section>
               : <></>
               }
               
               <div>
                  <h4>Propaganda Level {propagandaLevelEnemy}:</h4>
                  <h4>Economy Level : {economyLevelEnemy}</h4>
                  <h4>Inftrastructure Level : {infrastructureLevelEnemy}</h4>
                  <h4>Tank Production Level : {tankProductionLevelEnemy}</h4>
                  <h4>Tank Research Level : {tankResearchLevelEnemy}</h4>
                  <h4>Recruitment Level : {recruitmentLevelEnemy}</h4>
                  <h4>Infantry Research Level : {infantryResearchLevelEnemy}</h4>
                  <h4>Army Training Level : {armyTrainingLevelEnemy}</h4>
                  <h4>Army Research Level : {armyResearchLevelEnemy}</h4>
               </div>
            </section>
            :
            <div></div>
         }
      </div>
    </>
   )
}

export default MultiplayerGameEconomy