import React from 'react'

const Profile = () => {

  return (
    <div className='profile-container'>
      <img src="\images\profile_pictures\Profilbild.jpeg" height="70px"
      alt="profilPicture" className='profile-picture' 
      />

      <h4>Settings</h4>
      <h4>Dark Mode</h4>
      <h4>Language</h4>
      <h4>Logout</h4>
    </div>

  )
}

export default Profile