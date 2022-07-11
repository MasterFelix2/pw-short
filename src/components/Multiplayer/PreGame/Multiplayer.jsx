import React, { useState, useEffect } from 'react'
import NewCampaignImage from '../../General/NewCampaignImage'
import { useNavigate } from "react-router-dom"
import { db } from '../../../firebase-config';
import { useSelector, useDispatch } from 'react-redux'
import { doc, deleteDoc, updateDoc, arrayUnion, getDocs, getDoc, collection, query, where } from 'firebase/firestore';
import MultiplayerGameListed from './MultiplayerGameListed';
import PastGameListed from './PastGameListed';


const Multiplayer = () => {

  const user = useSelector((state) => state.user.value)
  const navigate = useNavigate();
  const [wholeData, setWholeData] = useState([]);
  const [ownData, setOwnData] = useState([]);
  const [ownPastData, setOwnPastData] = useState([]);
  const [loading, setLoading] = useState(false);

  function createGame(){
    navigate("/new/multiplayer");
  }
  
    const fetchData3 = async() => {

      const q = query(collection(db, "users", user.uid, "pastGames"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        ownPastData.push(doc)
      });
      setLoading(true)
    }

    const fetchData2 = async() => {
      const q = query(collection(db, "games"), where("players", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        ownData.push(doc)
      });
    }

   const fetchData = async () => {
      const q = query(collection(db, "games"), where("state", "==", "open"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        wholeData.push(doc)
      })
    }

  useEffect( () => {
    fetchData();
    fetchData2();
    fetchData3();
    
  }, []);

  if(loading===false) return (<span>loading...</span>);

  return (
    <>
    <div className="mainCont">
      {(user.uid !== "") ? (
      <>
      <section className='hzcenter'>
          <h1 className='heading'>My games</h1>
      </section>
      <div className='vtcenter'>
        {ownData.map( (item) => {
          return (
            <MultiplayerGameListed
              key={item.data().id}
              item={item}
              myGame="yes"
            />
          )
        })}
      </div>
      </>)
      :(<></>)}
      <section className='hzcenter'>
        <h1>List of public multiplayer games</h1>
      </section>
      <div className='vtcenter'>
        {wholeData.map( (item) => {
          return (
            <MultiplayerGameListed
              item={item}
              myGame="no"
            />
          )
        })}
      </div>
      <section className='hzcenter'>
        <button onClick={createGame}>Create a new game</button>
      </section>
      <section className='hzcenter'>
        <h1>My past games</h1>
      </section>
      <div className='vtcenter'>
        {ownPastData.map( (item) => {
          return (
            <PastGameListed
              item={item}
            />
          )
        })}
      </div>
    </div>
    </>
  )
}

export default Multiplayer