import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { createEvent } from "../../store/events";
import "./createEvent.css";

function CreateEvent() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {}, [dispatch]);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  // const [eventPrivacy, setEventPrivacy] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const group = location.state.group;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = {};

    if (!name) currentErrors.name = "Name is required";
    if (!type) currentErrors.type = "Event Type is required";
    // if (!eventPrivacy) currentErrors.private = "Visibility is required";
    if (!price) currentErrors.price = "Price is required";
    if (!startDate) currentErrors.startDate = "Event start is required";
    if (!endDate) currentErrors.endDate = "Event end is required";
    if (!imageUrl) currentErrors.imageUrl = "Image URL is required";
    if (imageUrl.length > 0 && !imageUrl.match(/\.(jpeg|jpg|gif|png)$/))
      currentErrors.imageUrl = "Image URL must end in .png, .jpg, or .jpeg";
    if (description.length < 30)
      currentErrors.description =
        "Description must be at least 30 characters long";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return; // prevent the form from submitting
    }

    const newEvent = await dispatch(
      createEvent(
        {
          name,
          type,
          price: parseInt(price),
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          url: imageUrl,
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

    if (newEvent) {
      history.push(`/events/${newEvent.id}`);
    }
  };

  return (
    <div className='create-event-div'>
      <h2 className='create-event-title'>Create an event for {group.name} </h2>
      <form onSubmit={handleSubmit}>
        <div className='create-event-name-div'>
          <p className='create-event-name'>What is the name of your event?</p>
          <input
            className='event-name-input'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Event Name'
          ></input>
          {errors.name && <p className='errors-group-create'>{errors.name}</p>}
        </div>
        <div>
          <p className='create-event-type'>
            Is this an in person or online event?
          </p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value='' disabled>
              (select one)
            </option>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
          {errors.type && <p className='errors-group-create'>{errors.type}</p>}
          <p className='create-event-price'>What is the price of your event?</p>
          <input
            className='event-price-input'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type='number'
            min='0'
            placeholder='0'
          ></input>
          {errors.price && (
            <p className='errors-group-create'>{errors.price}</p>
          )}
        </div>
        <div>
          <p className='create-event-start'>When does your event start?</p>
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            type='datetime-local'
          ></input>
          {errors.startDate && (
            <p className='errors-group-create'>{errors.startDate}</p>
          )}
          <p className='create-event-end'>When does your event end?</p>
          <input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            type='datetime-local'
          ></input>
          {errors.endDate && (
            <p className='errors-group-create'>{errors.endDate}</p>
          )}
        </div>
        <div>
          <p className='create-event-image'>
            Please add an image URL for your event below:
          </p>
          <input
            className='event-image-input'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)} // Updated to call setImageUrl
            type='text'
            placeholder='Image URL'
          ></input>
          {errors.imageUrl && (
            <p className='errors-group-create'>{errors.imageUrl}</p>
          )}
        </div>
        <div>
          <p className='create-event-description'>Please describe your event</p>
          <textarea
            className='event-description-input'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Please include at least 30 characters'
          >
            {" "}
          </textarea>
          {errors.description && (
            <p className='errors-group-create'>{errors.description}</p>
          )}
        </div>
        <section className='create-event-section'>
          <button className='create-event-button'>Create event</button>
        </section>
      </form>
    </div>
  );
}

export default CreateEvent;
