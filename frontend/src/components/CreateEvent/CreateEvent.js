import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createGroup } from "../../store/groups";

function CreateEvent() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");


  const group = useSelector((state) => state.groups.currentGroup);

  return (
    <div>
      <h2>Create an event for {group.name} </h2>
      <form>
        <div>
          <p>What is the name of your event?</p>
          <input type='text' placeholder='Event Name'></input>
        </div>
        <div>
          <p>Is this an in person or online event?</p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='' disabled>
              (select one)
            </option>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
