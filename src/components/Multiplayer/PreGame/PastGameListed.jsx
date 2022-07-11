import React from 'react'
import { Link} from "react-router-dom"

const PastGameListed = (props) => {

   const item = props.item;
   console.log(item.data().id)
   console.log(item.data().territories)

   return (
      <>
      <section className='gameListContPast'>
         <h4>Operation {item.data().scenario}</h4>
         {item.data().victory === "yes" ?
         <h4>Victory</h4>:<h4>Defeat</h4>}
         <h4>{item.data().id}</h4>
         <section>
            <h4>Germany: {item.data().playersGermany}</h4>
            <h4>Russia: {item.data().playersRussia}</h4>
         </section>
            <Link to={`/pastgames/${item.data().id}`} 
               state={{ 
                  id: item.data().id,
                  selectedTerritories: item.data().territories,
               }}>
               <button className="gameButton">View game</button>
            </Link>
      </section>
         

      </>
   )
}

export default PastGameListed