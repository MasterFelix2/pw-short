import { db } from '../../../../firebase-config';
import { doc, getDoc, updateDoc} from "firebase/firestore";

export async function DeductPoints(gameId, user, pts, cost){

   const points = Number((pts.pts -cost).toFixed(1))
      await updateDoc(doc(db, "games", gameId, "players", user.uid), {
         pointsToSpend: points,
      })
}