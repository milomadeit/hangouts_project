import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createGroup } from "../../store/groups";
import "./createGroup.css";

function CreateGroup() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [cityState, setCityState] = useState([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [type, setType] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log(errors, "logging state errors after update");
  }, [errors]);

  const handleCityStateChange = (e) => {
    const value = e.target.value;
    setCityState(value);
    splitCityState(value);
  };

  // split the cityState string into city and state
  const splitCityState = (cityStateValue) => {
    const parts = cityStateValue.split(",").map((part) => part.trim()); // split and trim any extra whitespace
    if (parts.length === 2) {
      setCity(parts[0]); // set the first part as the city
      setState(parts[1]); // set the second part as the state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = {};

    if (!city || !state)
      currentErrors.location =
        "Location is required (follow format City, STATE)";
    if (!name) currentErrors.name = "Name is required";
    if (about.length < 50)
      currentErrors.about = "Description must be at least 50 characters long";
    if (!type) currentErrors.type = "Group Type is required";
    if (!groupPrivacy) currentErrors.private = "Visibility Type is required";
    if (!imageUrl) currentErrors.imageUrl = "Image URL is required";
    if (imageUrl.length > 0 && !imageUrl.match(/\.(jpeg|jpg|gif|png)$/))
      currentErrors.imageUrl = "Image URL must end in .png, .jpg, or .jpeg";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return; // prevent the form from submitting
    }

    const newGroup = await dispatch(
      createGroup({
        name,
        about,
        type,
        private: groupPrivacy === "Private" ? true : false,
        city,
        state,
      })
    ).catch(async (error) => {
      const errorData = await error.json();
      if (errorData && errorData.errors) {
        console.log(errorData, "loggin errors bitch");
        // spread in backend, privacy, location and imageUrl errors
        setErrors({ ...errorData.errors, ...currentErrors });
        console.log(errors);
      } else {
        console.log(error);
        setErrors({ general: "An unexpected error occurred." });
      }
    });

    if (newGroup) {
      if (imageUrl) {
        //do image thing
        //then push to group details
        history.push(`/groups/${newGroup.id}`);
      } else history.push(`/groups/${newGroup.id}`);
    }
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
            value={cityState}
            onChange={handleCityStateChange}
            placeholder='City, STATE'
          ></input>
          {errors.location && (
            <p className='errors-group-create'>{errors.location}</p>
          )}
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
          {errors.name && <p className='errors-group-create'>{errors.name}</p>}
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
            placeholder='Please write at least 50 characters'
          ></textarea>
          {errors.about && (
            <p className='errors-group-create'>{errors.about}</p>
          )}
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
          {errors.type && (
            <p className='errors-group-create'>Group Type required</p>
          )}
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
          {errors.private && (
            <p className='errors-group-create'>Visibility Type is required</p>
          )}
          <p>Please add an image url for your group below</p>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)} // Updated to call setImageUrl
            type='text'
            placeholder='Image URL'
          ></input>
          {errors.imageUrl && (
            <p className='errors-group-create'>{errors.imageUrl}</p>
          )}
        </div>
        <button>Create group</button>
      </form>
    </div>
  );
}

export default CreateGroup;
