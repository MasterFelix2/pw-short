import React from 'react'

const NewCampaignImage = (props) => {

  const selectedCampaign = props.selectedCampaign;

  

  return (
  <>
    <img 
      onClick={()=>{props.chooseMap(selectedCampaign)}} 
      src={"/images/map/" + selectedCampaign + ".jpg"}
      alt={selectedCampaign} height={props.height}
    />
  </>
  )
}

export default NewCampaignImage