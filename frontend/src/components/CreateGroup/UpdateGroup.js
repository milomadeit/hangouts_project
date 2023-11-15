import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { updateGroup, getGroupDetail } from "../../store/groups";
import "./createGroup.css";

function UpdateGroup() {
  const dispatch = useDispatch();
  const history = useHistory();
  //   const location = useLocation();
  const { groupId } = useParams(); // Get groupId from URL params
  const sessionUser = useSelector((state) => state.session.user);
  const [isLoading, setIsLoading] = useState(true);
  const [cityState, setCityState] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [type, setType] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (groupId) {
      dispatch(getGroupDetail(groupId))
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load group details", error);
          setIsLoading(false);
        });
    }
  }, [dispatch, groupId]);

  const group = useSelector((state) => state.groups.currentGroup);

  //! useEffect for authentication and redirection
  useEffect(() => {
    if (group && sessionUser) {
      // Check if logged-in user is not the organizer
      if (sessionUser.id !== group.organizerId) {
        history.push("/");
      }
    } else if (!sessionUser) {
      //! If there is no group data or user is not logged in
      history.push("/");
    }
  }, [sessionUser, group, history]);

  //! useEffect for setting form data after group data is loaded
  useEffect(() => {
    if (group) {
      setCityState(`${group.city}, ${group.state}`);
      setCity(group.city);
      setState(group.state);
      setName(group.name);
      setAbout(group.about);
      setType(group.type);
      group.private === true
        ? setGroupPrivacy("Private")
        : setGroupPrivacy("Public");
    }
  }, [group]);

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

  if (isLoading) {
    return <div>Loading group details...</div>;
  }

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
    // if (!imageUrl) currentErrors.imageUrl = "Image URL is required";
    if (imageUrl.length > 0 && !imageUrl.match(/\.(jpeg|jpg|gif|png)$/))
      currentErrors.imageUrl = "Image URL must end in .png, .jpg, or .jpeg";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return; // prevent the form from submitting
    }

    const updatedGroup = await dispatch(
      updateGroup(
        {
          name,
          about,
          type,
          private: groupPrivacy === "Private" ? true : false,
          city,
          state,
        },
        group.id
      )
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

    if (updatedGroup) {
      if (imageUrl) {
        //do image thing
        //then push to group details
        history.push(`/groups/${updatedGroup.id}`);
      } else history.push(`/groups/${updatedGroup.id}`);
    }
  };

  return (
    <div className='create-group-div'>
      <div className='create-group-header'>
        <h4 className='become-an-organizer'>UPDATE YOUR GROUPS INFORMATION</h4>
        <h2 className='create-group-title'>
          We'll walk you through a few steps to update your groups information
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='create-group-location-div'>
          <h2>First, set your group's location</h2>
          <p className='group-location-label'>
            Hangout groups meets locally, in person, and online. We'll connect
            you with people in your area, and more can join you online.
          </p>
          <input
            className='group-location-input'
            type='text'
            value={cityState}
            onChange={handleCityStateChange}
            placeholder='City, STATE'
          ></input>
          {errors.location && (
            <p className='errors-group-create'>{errors.location}</p>
          )}
        </div>
        <div className='create-group-name-div'>
          <h2>What will your group's name be?</h2>
          <p className='group-name-label'>
            Choose a name that will give people a clear idea of what the group
            is about. Feel free to get creative! You can edit this later if you
            change your mind.
          </p>
          <input
            className='group-name-input'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='What is your group name?'
          ></input>
          {errors.name && <p className='errors-group-create'>{errors.name}</p>}
        </div>
        <div>
          <h2>Now describe what your group will be about</h2>
          <p className='group-description-label'>
            People will see this when you promote your group, but you'll be able
            to add to it later, too.
          </p>
          <ol>
            <li>What's the purpose of the group?</li>
            <li>Who should join?</li>
            <li>What will you do at your events?</li>
          </ol>
          <textarea
            className='group-about-input'
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
          <p>
            To update your Groups picture please add a new image URL for your
            group below:
          </p>
          <input
            className='group-image-input'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)} // Updated to call setImageUrl
            type='text'
            placeholder='Image URL'
          ></input>
          {errors.imageUrl && (
            <p className='errors-group-create'>{errors.imageUrl}</p>
          )}
        </div>
        <section className='create-group-section'>
          <button className='create-group-button'>Update group</button>
        </section>
      </form>
    </div>
  );
}

export default UpdateGroup;
