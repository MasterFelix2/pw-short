import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux'
import { login } from "../features/users";
import { useCookies } from 'react-cookie';

const Login = () => {

   const [cookies, setCookie] = useCookies(['cookie-name']);
   
   const auth = getAuth();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const [userState, setUserState] = useState(true);
   const [email, setEmail] = useState('felix.moosbauer@gmx.at');
   const [password, setPassword] = useState('123456');
   const [nickName, setNickName] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   
   function handleLogin (e) {
      e.preventDefault();

   signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
         const user = userCredential.user;

         if (user) {

            async function checkNickName(){
               const docSnapName = await getDoc(doc(db, "users", user.uid))
               console.log(user)
               console.log(user.email)
               console.log(docSnapName.data().nickName);
               console.log(cookies)
               dispatch(login({ name: user.email, uid: user.uid, nickName: docSnapName.data().nickName}));
               setCookie("user", {name: user.email, uid: user.uid, nickName: docSnapName.data().nickName}, {path: "/"})
               console.log(cookies)
               navigate('/multiplayer');
            }
            checkNickName();
         }
      })
      .catch(error => alert(error.message));
   }

   function handleRegister (e) {
      e.preventDefault();

      createUserWithEmailAndPassword(auth, email, password)
         .then( (userCredential) => {
            const user = userCredential.user;
            dispatch(login({ name: user.email, uid: user.uid, nickName: nickName }));
            setCookie("user", user, {path: "/"})
            if (user) {
               setDoc(doc(db, "users", user.uid), {
                  name: user.email,
                  nickName: nickName,
                  wins: 0,
                  losses: 0,
               });
                  navigate('/multiplayer');
            }
         })
         .catch( error => alert(error));
   }

   function switchToRegister() {
      {userState? (setUserState(false)) : (setUserState(true))}
   }

   return (
      <div className='main background'>
         <section className='hzcenter'>
            <div>
               <img className='logoLogin' src="/images/logo/pwLogo1.5blue.svg" height="100px"alt="pwLogo" />
            </div>
         </section>
         
         <section className='hzcenter'>
            
               {userState ?
               <div className='loginContLogin loginCont'>
                  <h1>Login</h1>
                  <form action="" onSubmit={handleLogin}>
                     <h4>E-mail</h4>
                     <input type="text" value={email} onChange={ (e) => {setEmail(e.target.value)}} />
                     <h4>Password</h4>
                     <input type="text" value={password} onChange={ (e) => {setPassword(e.target.value)}} />
                     <button>Login</button>
                  </form>
                  <button onClick={switchToRegister}>Switch to Register</button>
               </div>
               :
               <div className='loginContRegister loginCont'>
               <h1>Register</h1>
               <form action="" onSubmit={handleRegister}>
                  <h4>E-mail</h4>
                  <input type="text" value={email} onChange={ (e) => {setEmail(e.target.value)}} />
                  <h4>Password</h4>
                  <input type="text" value={password} onChange={ (e) => {setPassword(e.target.value)}} />
                  <h4>Confirm Password</h4>
                  <input type="text" value={confirmPassword} onChange={ (e) => {setConfirmPassword(e.target.value)}} />
                  <h4>Choose a Name</h4>
                  <input type="text" value={nickName} onChange={ (e) => {setNickName(e.target.value)}} />
                  <button>Register</button>
               </form>
               <button onClick={switchToRegister}>Switch to Login</button>
               </div>
               }
            
         </section>
      </div>
   )
};

export default Login;
