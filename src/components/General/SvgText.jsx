import React from 'react'

const SvgText = (props) => {

   return (
      <text>
         <tspan
            id={props.id2}
            style={{
               stroke:"black",
               fontStyle:"normal",
               fontVariant:"normal",
               fontWeight:"bold",
               fontSize:"3.52778",
               fontFamily: "serif",
               inkscapeFontSpecification: "serif",
               fill: "lightgrey",
               strokeWidth: 0.1
            }}
            x={props.x}
            y={props.y}
         >{props.name}</tspan>
      </text>
       
   )
}

export default SvgText