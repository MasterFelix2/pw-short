import {Routes, Route, useRouteMatch, useParams} from "react-router-dom";
import Navbar from "./components/General/Navbar";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Multiplayer from "./components/Multiplayer/PreGame/Multiplayer";
import CreateMultiplayerGame from "./components/Multiplayer/PreGame/CreateMultiplayerGame";
import Profile from "./pages/Profile"
import MultiplayerGameMain from "./components/Multiplayer/Main/Gameplay/MultiplayerGameMain";
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux'
import { login } from "./features/users";
import Test from "./pages/Test";
import PastGame from "./components/Multiplayer/PreGame/PastGame";


function App(){

  const [cookies, setCookie] = useCookies(null);
  const dispatch = useDispatch();
  
  if (Object.keys(cookies).length){
    dispatch(login({ name: cookies.user.email, uid: cookies.user.uid, nickName: cookies.user.nickName}));
  }
  
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/help" element={<Help />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/new/multiplayer" element={<CreateMultiplayerGame />} />
        <Route path="/myprofile" element={<Profile />} />
        <Route path="/started/multiplayergame" element={<MultiplayerGameMain />} />
        <Route path="/multiplayer/:id" element={<MultiplayerGameMain />} />
        <Route path="/pastgames/:id" element={<PastGame />} />
        <Route path="/multiplayer/:campaign" element={<Test />} />
      </Routes>
    </>
  )
}
export default App;

