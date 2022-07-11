import React, { useEffect } from 'react'
import Svgzeichnung from '../Main/svgComponents/SvgZeichnung'
import { db } from '../../../firebase-config';
import { doc, deleteDoc, updateDoc, arrayUnion, getDocs, getDoc, collection, query, where } from 'firebase/firestore';
import { useLocation} from 'react-router-dom';

const PastGame = () => {

   const location = useLocation();
   const id = location.state.id;
   const selectedTerritories = location.state.selectedTerritories;

   useEffect(()=>{

      async function fetchData(){

      }

      fetchData();
   }, [])

  return (
    <>
    <section>
      <Svgzeichnung
         gameId={id}
         selectedTerritories={selectedTerritories}
      />
    </section>
    
    
    </>
  )
}

export default PastGame