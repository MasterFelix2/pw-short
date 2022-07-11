import React from 'react'
import { useDispatch } from 'react-redux'
import { addSelection } from "../../features/selection";

const Territory = (props) => {

  const colour = props.fill;
  const dispatch = useDispatch();

  function sendSelected(){
    console.log(props.id)
    dispatch(addSelection({ name: props.id, path: props.d, type: props.type}));
  }

  return (
    <>
    <path
      className='basicTerritory'
      onClick={sendSelected}
      id={props.id}
      style={{
        fill: colour,
        fillOpacity: 1,
        stroke: "black",
        //stroke: "#686868",
        strokeWidth: 0.342299,
        strokeMiterlimit: 4,
        strokeDasharray: "none",
      }}
      d={props.d}
    />
    <img src="public/images/icons/check.png" alt="check"/>
    </>
  )
}

export default Territory