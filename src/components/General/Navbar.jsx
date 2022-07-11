import React, {useState} from "react";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"
import { login, logout } from "../../features/users";
import { useCookies} from 'react-cookie';

function Navbar(){

   //const userdb = auth.currentUser;
   const [cookies, setCookie, removeCookie] = useCookies(['cookie-name']);
   const userCookies = cookies.user;

   const dispatch = useDispatch();
   const user = useSelector((state) => state.user.value.name)
   const navigate = useNavigate();
   const auth = getAuth();
   const userdb = auth.currentUser;

   const [burgerToggle, setBurgerToggle] = useState();

   function handleLogout () {
      console.log(user)
      if (user) {
         dispatch(login({ name: "", uid: "", nickName: ""}));
         removeCookie("user", {path: "/"})
      }
   }

   return (
     <>
         <nav className="container-flex">
            <div className="logo-nav">
               <Link to="/">
                  <img 
                  src="/images/logo/pwLogo1.5blue.svg" alt="logo" height="40px" />
               </Link>
            </div>
            <section className="outside-burger-section">
               {(user !== "") ? (
                  <Link to="/multiplayer">Singleplayer / Multiplayer</Link>
               ):<></>}
               
               <Link to="/help">
               <span>Help</span></Link>
               <Link to="/myprofile">
               <span>Profile</span>
               </Link>
               {(user !== "") ? (
                  <Link onClick={handleLogout} to="/">
                     <span>Logout</span>
                  </Link>
               ):(
                  <Link to="/">
                     <span>Login</span>
                  </Link>
               )}
            </section>
            {burgerToggle ?
               <section className="burger-section">
                  <div className="burger-menu">
                     {(user !== "") ? (
                        <Link to="/multiplayer">Singleplayer / Multiplayer</Link>
                     ):<></>}
                     <Link to="/help">
                     <span>Help</span></Link>
                     <Link to="/myprofile">
                     <span>Profile</span>
                     </Link>
                     {(user !== "") ? (
                        <Link onClick={handleLogout} to="/">
                           <span>Logout</span>
                        </Link>
                     ):(
                        <Link to="/">
                           <span>Login</span>
                        </Link>
                     )}
                  </div>
                  
                  <img src="/images/icons/BurgerMenuIcon.svg" className="burger-menu-toggler"
                  onClick={()=>setBurgerToggle(false)} height="20px" alt="BurgerMenu" />
               </section>
            :
            <img src="/images/icons/BurgerMenuIcon.svg" className="burger-menu-toggler"
               onClick={()=>setBurgerToggle(true)} height="20px" alt="BurgerMenu" />
            }

            

         </nav>
         <section className='sectionDiff'></section>
      </>
   )
}
export default Navbar;
