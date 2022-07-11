import React, {useState, useEffect} from 'react';
import SvgComponent from '../svgComponents/SvgZeichnung.js';
import { db } from '../../../../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, increment} from "firebase/firestore";
import { useLocation} from 'react-router-dom';
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import MultiplayerGameEconomy from './MultiplayerGameEconomy';
import GameInfo from './GameInfo';
import TimeTracking from '../TimeTracking/TimeTracking';
import { setPts } from "../../../../features/pts";
import { addFreeMoves } from "../../../../features/freeMoves";
import TerritorySelectionSVG from './TerritorySelectionSVG.jsx';
import MultiplayerGameActions from './MultiplayerGameActions.jsx';
//import { RiverBonus } from './RiverBonus.js';
//import { CheckNeighbors } from './CheckNeighbors.js';
import { setDeployableDivs } from '../../../../features/deployableDivs.js';
import { setFaction } from '../../../../features/faction.js';
import { deleteGame } from '../../PreGame/deleteGame.js';
import { Generate } from './Generate.js';
import { ArchiveGame } from './Commands.js';

const MultiplayerGameMain = (props) => {

   const location = useLocation();
   const dispatch = useDispatch();
   const gameId = location.state.id;
   const user = useSelector((state) => state.user.value);
   const deployableDivs = useSelector((state) => state.deployableDivs.value);
   const faction = useSelector((state) => state.faction.value);

   const docRefGame = doc(db, "games", gameId);
   const docRefPlayers = doc(db, "games", gameId, "players", user.uid);
   const docRefGerman = doc(db, "games", gameId, "german", "territories");

   const [loaded, setLoaded] = useState(false);
   const [gameLoaded, setGameLoaded] = useState(false);
   const [selectedTerritories, setSelectedTerritories] = useState();
   const [showMap, setShowMap] = useState(true);
   const [victory, setVictory] = useState(1);

   useEffect( () => {

      async function fetchDataGame (){
         
         const docSnapGerman = await getDoc(docRefGerman);
         const docSnapPlayers = await getDoc(docRefPlayers);
         const docSnapGame = await getDoc(docRefGame);
         
         //Hiding game and function if it is still initializing
         setGameLoaded(docSnapGame.data().loaded)
         if (docSnapGame.data().loaded === true){
            setSelectedTerritories(docSnapGerman.data().territories);
         }

         //Victory 
         if(docSnapGame.data().victory !== false){
            setVictory(docSnapGame.data().victory)
         }
         
         //Create redux variables
         if (docSnapPlayers.data().position === "Germany"){
            dispatch(setFaction({ faction: "Germany", nonFaction: "Russia"}));
            
         } else {
            dispatch(setFaction({ faction: "Russia", nonFaction: "Germany"}));
         }

         dispatch(setPts({ pts:docSnapPlayers.data().pointsToSpend}));

         //generate new divisions and points
         const lastPayoutSec = docSnapPlayers.data().lastPayout;
         const currentTimeSec = Math.floor(Date.now()/1000);
         const timeDifferenceMins = (currentTimeSec-lastPayoutSec)/60;

         if (timeDifferenceMins > 60) {
            const generated = await Generate(gameId, user, faction, docSnapPlayers.data().pointsToSpend, deployableDivs, currentTimeSec, timeDifferenceMins, lastPayoutSec);
            dispatch(setPts({ pts: generated.generatedPoints}));
            dispatch(setDeployableDivs({ infDivs: docSnapPlayers.data().deployableInfDivs+generated.generatedInfDivs, tankDivs: docSnapPlayers.data().deployableTankDivs+generated.generatedTankDivs}));
         }
         
         console.log("hello")
         setLoaded(true)
         
      }
         
      fetchDataGame();

   }, [])

   if ((loaded === false )){
      return <h1>Loading...</h1>
   }

   return (
   <>
      <section className='gameInfoGrid'>
         <GameInfo 
         />
      </section>

      <section className='game-main-container'>
         {gameLoaded ?
            <>
            {showMap?
               (<>
               <button className="hide-map-button" onClick={()=>setShowMap(false)}>Hide Map</button>
               <section className='hzcenterSVG'>
                
               <SvgComponent
                  gameid={gameId}
                  selectedTerritories={selectedTerritories}
               />
                  <TerritorySelectionSVG 
                     setSelectedTerritories={(selectedT)=>setSelectedTerritories(selectedT)}
                  />
                  
               </section>
               </>)
               :
               (<>
               <button className="hide-map-button" onClick={()=>setShowMap(true)}>Show Map</button>
               </>)
            }
            </>: <><h1>Creating game..</h1>
            </>  
         }
         <div className='sub-map-container'>
            {victory === 10 ? 
            <>
            <h1>GERMANY wins!</h1>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/vlDpF7jKGPA?autoplay=1&loop=1" title="Erika" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <h1 className="continue_victory" onClick={ArchiveGame}>Continue</h1>
            <h4>(move game to archive)</h4>
            </>:<></>}
            {victory === -10 ? 
            <>
            <h1>THE SOVIET UNION wins!</h1>
            
            <iframe width="560" height="315" src="https://www.youtube.com/embed/SAzofLc3DMk?autoplay=1&loop=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            <h1 className="continue_victory" onClick={ArchiveGame}>Continue</h1>
            <h4>(move game to archive)</h4>
            </>:<></>}
            <TimeTracking/>
            <section className='gameInfoEconomy'>
               <MultiplayerGameEconomy/>
            </section>
            <section>
               <MultiplayerGameActions
                  faction="Germany"
                  setVictory={(number)=>setVictory(number)}
                  setSelectedTerritories={(selectedT)=>setSelectedTerritories(selectedT)}
               />
            </section>
         </div>
      </section>
   </>
   )
}

export default MultiplayerGameMain

/* TODOS

collapse time logs
create simple history only with how many time for each day

Attack only possible neighboring division


Create game Ai difficulty
AI moves
Leaderboard with best time to beat AI as germany

send an email or something that someone joined their game.
Create game weird with standard and taifun
Deployable divisions NaN

Make map have different colors for russia too, but always only visible to yourself. Make a different shade for bordering territories.
Retreat all function in python -> sort neighbors by their north eastness



--- Maybe ---
3. BUG: Login cookies still sometimes making page not work?
12. CHORE: Backup everything to github and make local copy PW 4.0

--- Late stage ---

City names should become bigger when zoomed out and smaller when zoomed in
polish responsiveness
Make an animation while the game is creating.
19. Include something like a chat function.
Automatically refresh or something once game is loaaded after creating to load german territories
4.BUG: Fix key errors on main game, maybe add key values with python
16. Set up territories defence for Stalin line and cities, Moscow, Leningrad

--- Extremely late stage ---
18. Give trying to set up city images on svg map another go
15.a  Make cities be sorted into tiers. Make cities urban and create urban fighting bonus.
15.b  If at least 3 divisions in city -> requires 1 assault per city tier to be able to take the city
15.c  Have an encircled function that checks if none or only 1 neighboring territory 
15.d  Cities should automatically get 1 assault thingy get applied every 2 days if they are encircled
15.e  Odessa should go at 1/3 the rate, as it gets supplied by sea, Sevastopol 1/5
15.f  Make cooldown of tank divisions less. Make tank divisions move faster or something.
Make Total division count be displayed and react when divisions are created, shattered and encircled

--- Optional ---

Victory condition for russia to take germany? any starting territory has fortification at 20?
Maybe change it to "Germany" and "Russia" instead of user.uid for database sorting
11. FEATURE: Troops should automatically build up fortification slowly (dig in-max 2 level) in dashboard 0 (+2)

Adapt for timeframe settings. Default is probably around the 6 month version.
*/
