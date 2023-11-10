import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createGroup } from "../../store/groups";
import "./createGroup.css";

function CreateGroup() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [type, setType] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newGroup = dispatch(
      createGroup({
        name,
        about,
        type,
        private: groupPrivacy === "Private" ? true : false,
        city,
        state,
        imageUrl,
      })
    )
      .then((group) => {
        if (group) {
          history.push(`/groups/${group.id}`);
        }
      })
      .catch((errorData) => {
        if (errorData && errorData.errors) {
          console.log(errorData, "loggin errors bitch");
          setErrors(errorData.errors);
        } else {
          console.log(errorData);
          setErrors({ general: "An unexpected error occurred." });
        }
      });
  };

  return (
    <div>
      <h4>BECOME AN ORGANIZER</h4>
      <h2>We'll walk you through a few steps to build your community</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h2>First, set your group's location</h2>
          <p>
            Hangout groups meets locally, in person, and online. We'll connect
            you with people in your area, and more can join you online.
          </p>
          <input
            type='text'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder='City, STATE'
          ></input>
          <input
            type='text'
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder='City, STATE'
          ></input>
        </div>
        <div>
          <h2>What will your group's name be?</h2>
          <p>
            Choose a name that will give people a clear idea of what the group
            is about. Feel free to get creative! You can edit this later if you
            change your mind.
          </p>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='What is your group name?'
          ></input>
        </div>
        <div>
          <h2>Now describe what your group will be about</h2>
          <p>
            People will see this when you promote your group, but you'll be able
            to add to it later, too.
          </p>
          <ol>
            <li>What's the purpose of the group?</li>
            <li>Who should join?</li>
            <li>What will you do at your events?</li>
          </ol>
          <textarea
            type='text'
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder='Please write at least 30 characters'
          ></textarea>
        </div>
        <div>
          <h2>Final steps...</h2>
          <p> Is this an in person or online group?</p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='' disabled>
              (select one)
            </option>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
          <p>Is this group private or public?</p>
          <select
            value={groupPrivacy}
            onChange={(e) => setGroupPrivacy(e.target.value)}
          >
            <option value='' disabled>
              (select one)
            </option>
            <option value='Public'>Public</option>
            <option value='Private'>Private</option>
          </select>
          <p>Please add an image url for your group below</p>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)} // Updated to call setImageUrl
            type='text'
            placeholder='Image URL'
          ></input>
        </div>

        <button>Create group</button>
      </form>
    </div>
  );
}

export default CreateGroup;
