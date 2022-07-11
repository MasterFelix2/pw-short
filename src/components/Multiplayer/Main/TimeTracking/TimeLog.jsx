import React, {useState} from 'react'
import { useEffect } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

const TimeLog = (props) => {

  const date = new Date();
  const midnightStart = date.setHours(0,0,0,0);

  const [typeSelection, setTypeSelection] = useState(false);
  const [type, setType] = useState(false)
  const [inputDescription, setInputDescription] = useState("")
  const [descriptionEdit, setDescriptionEdit] = useState(false);

  var startHours = Math.floor((props.startTime - midnightStart)/1000/60/60)
  var endHours = Math.floor((props.endTime - midnightStart)/1000/60/60)

  const [inputStartHours, setInputStartHours] = useState(startHours)
  const [inputEndHours, setInputEndHours] = useState(endHours)

  var startMin = Math.floor((props.startTime - midnightStart)/1000/60)-startHours*60
  var endMin = Math.floor((props.endTime - midnightStart)/1000/60)-endHours*60

  const [inputStartMinutes, setInputStartMinutes] = useState(startMin)
  const [inputEndMinutes, setInputEndMinutes] = useState(endMin)
  const [durationHours, setDurationHours] = useState(inputEndHours - inputStartHours);
  const [durationMinutes, setDurationMinutes] = useState(inputEndMinutes - inputStartMinutes);
  
  useEffect(()=>{
    if (startMin > endMin) {
      setDurationHours(durationHours-1)
      setDurationMinutes(60-inputStartMinutes+inputEndMinutes)
    }
  },[])

  const [redeemed, setRedeemed] = useState(props.redeemed)
  const [editStart, setEditStart] = useState(false);
  const [editEnd, setEditEnd] = useState(false);
  const [inputStart, setInputStart] = useState("");
  const [inputEnd, setInputEnd] = useState("");


  function redeemLog(){
    
    var minutes=Math.floor((inputEndHours-inputStartHours)*60+(inputEndMinutes-inputStartMinutes))
    if (type === false){
      alert("Need to select a productivity type. Red color is for supportive and healthy things that however will not lead to you achieving your productive goals. Things like working out, meditation etc. They give half as many points as productive time.")
    }
    if (minutes < 10){
      alert("Minimum of 10 minutes to redeem.");
      return null;
    }
    setRedeemed(true)
    if (type === "Maintenance"){
      minutes = minutes * 0.5
    }
    props.redeemPoints(props.logNumber, minutes)
  }
  function deleteLog(redeemed){
    console.log(props.logNumber)
    const minutes=Math.floor((inputEndHours-inputStartHours)*60+(inputEndMinutes-inputStartMinutes))
    props.triggerDelete(props.logNumber, props.index, redeemed, minutes);
  }
  function checkCorrectDuration(part, editedHours, editedMinutes){

    if (editedMinutes > 59) {
      return false
    }

    var differenceHours;
    var differenceMinutes;
    
    if(part === "start"){
      differenceHours = inputEndHours - editedHours
      differenceMinutes = inputEndMinutes - editedMinutes
    } else {
      differenceHours = editedHours - inputStartHours
      differenceMinutes = editedMinutes - inputStartMinutes
    }
    const differenceTotal = differenceHours * 60 + differenceMinutes

    if (differenceTotal >= 0 ){
      const hours = Math.floor(differenceTotal / 60)
      const minutes = differenceTotal % 60
      return {hours: hours, minutes: minutes}
    } else {
      return false
    }
  }
  function updateDuration(hours, minutes){
    setDurationHours(hours)
    setDurationMinutes(minutes)
  }
  function finishEditStart(editedTime){
    editedTime = editedTime.toString()
    const stringLength = editedTime.length
    var editedHours;
    var editedMinutes;

    if (stringLength === 4){
     
      if (editedTime.slice(0,1) == 0){
        editedHours = editedTime.slice(1, 2)
      } else {
        editedHours = editedTime.slice(0, 2)
      }
      if (editedTime.slice(2,3) == 0){
        editedMinutes = editedTime.slice(3, 4)
      } else {
        editedMinutes = editedTime.slice(2, 4)
      }
      
    } else if (stringLength === 3){
      editedHours = editedTime.slice(0, 1)
      if (editedTime.slice(1,2) == 0){
        editedMinutes = editedTime.slice(2, 3)
      } else {
        editedMinutes = editedTime.slice(1, 3)
      }
    }
    const updatedDifference = checkCorrectDuration("start", editedHours, editedMinutes)
    if (updatedDifference === false){
      setEditStart(false)
      return null
    };
    setInputStartHours(editedHours)
    setInputStartMinutes(editedMinutes)
    updateDuration(updatedDifference.hours, updatedDifference.minutes);
    setEditStart(false)
    editedHours = Number(editedHours)
    editedMinutes = Number(editedMinutes)
    const totalTime = editedHours * 60 + editedMinutes
    const newStartTime = midnightStart + totalTime*60*1000
    props.updateTime(props.logNumber, "start", newStartTime);
  }

  function finishEditEnd(editedTime){
    editedTime = editedTime.toString()
    const stringLength = editedTime.length
    
    var editedHours;
    var editedMinutes;

    if (stringLength === 4){
      if (editedTime.slice(0,1) == 0){
        editedHours = editedTime.slice(1, 2)
      } else {
        editedHours = editedTime.slice(0, 2)
      }
      if (editedTime.slice(2,3) == 0){
        editedMinutes = editedTime.slice(3, 4)
      } else {
        editedMinutes = editedTime.slice(2, 4)
      }
      
    } else if (stringLength === 3){
      editedHours = editedTime.slice(0, 1)
      if (editedTime.slice(1,2) == 0){
        editedMinutes = editedTime.slice(2, 3)
      } else {
        editedMinutes = editedTime.slice(1, 3)
      }
    }
    
    const updatedDifference = checkCorrectDuration("end", editedHours, editedMinutes)
    if (updatedDifference === false){
      setEditEnd(false)
      return null
    };
    setInputEndHours(editedHours);
    setInputEndMinutes(editedMinutes);
    updateDuration(updatedDifference.hours, updatedDifference.minutes);
    setEditEnd(false);
    editedHours = Number(editedHours)
    editedMinutes = Number(editedMinutes)
    const minutesSinceMidnight = editedHours * 60 + editedMinutes;
    const newEndTime = midnightStart + minutesSinceMidnight*60*1000;


    props.updateTime(props.logNumber, "end", newEndTime);
  }
  function triggerEditStart(){
    var ISHString = inputStartHours.toString()
    var ISMString = inputStartMinutes.toString()

      if (ISMString.length === 1){
        ISMString = "0" + ISMString 
      }

    setInputStart(ISHString + ISMString)
    setEditStart(true)

  }
  function triggerEditEnd(){
    var IEHString = inputEndHours.toString()
    var IEMString = inputEndMinutes.toString()

    if (IEMString.length === 1){
      IEMString = "0" + IEMString 
    }

    setInputEnd(IEHString + IEMString)
    setEditEnd(true)
  }


  return (
  <section className='timeLogContainer' onClick={()=>console.log(props.logNumber)}>
    <section className='fromToContainer'>
      {redeemed ?
        (<>
          <section className='timeReg'> 
              {inputStartHours < 10 ? <span>0</span>:<></>}
              <span>{inputStartHours}</span>
              <span>:</span>
              {inputStartMinutes < 10 ? <span>0</span>:<></>}
              <span>{inputStartMinutes}</span>
            </section>
        </>)
        :
        (<>
          {editStart ?
            <OutsideClickHandler
              onOutsideClick={()=>finishEditStart(inputStart)}
            >
              <section className='timeReg' onKeyPress={(e) => e.key === 'Enter' && finishEditStart(inputStart)}>
              
                <input type="text" spellCheck="false" autoComplete="off"
                  onChange={e=>setInputStart(e.target.value)} 
                  value={inputStart}
                  
                />
              </section>
            </OutsideClickHandler>
            :
            <section className='timeReg' onClick={()=>triggerEditStart()}>
              {inputStartHours < 10 ? <span>0</span>:<></>}
              <span>{inputStartHours}</span>
              <span>:</span>
              {inputStartMinutes < 10 ? <span>0</span>:<></>}
              <span>{inputStartMinutes}</span>
            </section>
          }
        </>)
        }
      
      <span className='timeDash'> - </span>
      {redeemed ? 
        (<>
          <section className='timeReg'>
            {inputEndHours < 10 ? <span>0</span>:<></>}
            <span>{inputEndHours}</span>
            <span>:</span>
            {inputEndMinutes < 10 ? <span>0</span>:<></>}
            <span>{inputEndMinutes}</span>
          </section>
        </>)
        :
        (<>
          {editEnd ?
            <OutsideClickHandler
              onOutsideClick={()=>finishEditEnd(inputEnd)}
            >
              <section className='timeReg' onKeyPress={(e) => e.key === 'Enter' && finishEditEnd(inputEnd)}>
              
                <input  type="text" spellCheck="false" tabIndex="0" autoComplete="off"
                  onChange={e=>setInputEnd(parseInt(e.target.value))}
                  value={inputEnd}
                />
              </section>
            </OutsideClickHandler>
            :
            <section className='timeReg' onClick={()=>triggerEditEnd()}>
              {inputEndHours < 10 ? <span>0</span>:<></>}
              <span>{inputEndHours}</span>
              <span>:</span>
              {inputEndMinutes < 10 ? <span>0</span>:<></>}
              <span>{inputEndMinutes}</span>
            </section>
          }
        </>)
      }
      
    </section>
    <section className='durationContainer'>

      {durationHours < 10 ? <span>0</span>:<></>}
      <span>{durationHours}</span>
      <span>:</span>
      {durationMinutes < 10 ? <span>0</span>:<></>}
      <span>{durationMinutes}</span>

    </section>


    {redeemed ? 
    (<>
      <span>{type}</span>
    </>)
    :
    (<>
      {type ? <section className='typeContainer'><span onClick={()=>setType(false)}>{type}</span></section>
      :
      <section className='hozcenter typeContainer'>
        <div onClick={()=>setType("Productive")} className='spButtonStopwatch'></div>
        <div onClick={()=>setType("Maintenance")} className='mButtonStopwatch'></div>
      </section>
      }
    </>)
    }

    <section className='buttonContainer'>
      {/* Show greyed out button if redeemed, else show redeemable button */}
      {redeemed ? 
        <img 
          className="ppButton"
          src="../images/icons/ContinueIconRoundGrey.svg" height="35px" alt="greyContinueIcon" 
        />
        :
        <img 
            onClick={()=>redeemLog()} className="ppButton"
            src="../images/icons/ContinueIconRound.svg" height="35px" alt="continueIcon" 
        />
      }
      <img 
        onClick={()=>deleteLog(false)} className="ppButton"
        src="../images/icons/DeleteIconRound.svg" height="35px" alt="deleteIcon" 
      />
    </section>

  </section> //Time log container
  )
}

export default TimeLog


/*

{inputDescription?(<span>{inputDescription}</span>):(<span>Add Description</span>)}
    {descriptionEdit ?
    (<>
      <input className='inputTimeLog' type="text"
      onChange={e=>setInputDescription(e.target.value)}
      value={inputDescription}
      onKeyPress={(e) => e.key === 'Enter' && setDescriptionEdit(false)}
      />
    </>)
    :
    (<>
      {inputDescription ? 
      (<>
        <span onDoubleClick={()=>setDescriptionEdit(true)}>{inputDescription}</span>
      </>)
      :
      (<>
        <span onDoubleClick={()=>setDescriptionEdit(true)}>Add Description</span>
      </>)
      }
    </>)
    }



<section>
      {inputStartHours > inputEndHours ? (<span>-</span>):(<>
        {durationHours < 10 & durationHours >= 0 ?
          (<span>0{durationHours}</span>):(<span>{durationHours}</span>)
        }</>)
      }
      <span>:</span>
      {inputStartMinutes > inputEndMinutes ? 
      (<>
        {60+durationMinutes < 10 & 60+durationMinutes >= 0?
          (<><span>0{60+durationMinutes}</span></>):(<><span>{60+durationMinutes}</span></>)
        }
        </>):(<>
        {durationMinutes < 10 & durationMinutes >= 0?
          (<><span>0{durationMinutes}</span></>):(<><span>{durationMinutes}</span></>)
        }
      </>)
      }
    </section>







    <section className='whenSubContainer'>
      {inputStartHours < 10 ? 
      (<>
        <input className='inputClockLogSmall' type="number"
          onChange={e=>setInputStartHours(parseInt(e.target.value))}
          value={inputStartHours}
        />
      </>):(<>
        <input className='inputClockLog' type="number"
          onChange={e=>setInputStartHours(parseInt(e.target.value))}
          value={inputStartHours}
        />
      </>)
      }
    
    <span>:</span>
      <input className='inputClockLog' type="number"
        onChange={e=>setInputStartMinutes(parseInt(e.target.value))}
        value={inputStartMinutes}
      />
    <span> - </span>
    {inputEndHours < 10 ? 
      (<>
        <input className='inputClockLogSmall' type="number"
          onChange={e=>setInputEndHours(parseInt(e.target.value))}
          value={inputEndHours}
        />
      </>):(<>
        <input className='inputClockLog' type="number"
          onChange={e=>setInputEndHours(parseInt(e.target.value))}
          value={inputEndHours}
        />
      </>)
      }
        
    <span>:</span>
      <input className='inputClockLog' type="number"
        onChange={e=>setInputEndMinutes(parseInt(e.target.value))}
        value={inputEndMinutes}
      />
  </section>
  <section>


    {(inputEndHours*60+inputEndMinutes)-(inputStartHours*60+inputStartMinutes) <0?
      (<>invalid:invalid</>):
      (<>
      { inputStartMinutes > inputEndMinutes ?
        (<>
        {(inputEndHours - inputStartHours-1) < 10 & (inputEndHours - inputStartHours-1) >= 0?
        (<span>0{(inputEndHours - inputStartHours-1)}</span>):
        (<span>{(inputEndHours - inputStartHours-1)}</span>)
        }
        </>)
        :
        (<>
        {inputEndHours - inputStartHours < 10 & inputEndHours - inputStartHours >= 0?
        (<span>0{inputEndHours-inputStartHours}</span>):
        (<span>{inputEndHours-inputStartHours}</span>)
        }
        </>)
      }
        <span>:</span>
        { inputStartMinutes > inputEndMinutes ? 
          (<>{60-inputStartMinutes+inputEndMinutes < 10 ? 
          (<span>0{60-inputStartMinutes+inputEndMinutes}</span>):
          (<span>{60-inputStartMinutes+inputEndMinutes}</span>)
          }</>)
        :
          (<>
            {inputEndMinutes- inputStartMinutes < 10 ? 
              <span>0{inputEndMinutes - inputStartMinutes}</span>:
              <span>{inputEndMinutes - inputStartMinutes}</span>
            }
          </>)
        }
      </>)
    }
    </section>
  </>)
  }

*/