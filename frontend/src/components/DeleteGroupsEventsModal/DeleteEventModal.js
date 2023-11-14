import React from "react";
import { useModal } from "../../context/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { deleteEvent } from "../../store/events";
import "./deleteModal.css";

function DeleteEvent() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  const currentEvent = useSelector((state) => state.events.currentEvent);

  const handleDeleteClick = () => {
    dispatch(deleteEvent(currentEvent.id)).then(closeModal);
    history.push(`/groups/${currentEvent.groupId}`);
  };

  const handleKeepClick = () => {
    closeModal();
  };

  return (
    <div className='delete-modal-div'>
      <div className='delete-modal-title-div'>
        <h2 className='delete-modal-title'> Confirm Delete</h2>
        <p className='delete-modal-p'>
          Are you sure you want to remove this event?
        </p>
      </div>
      <div className='delete-modal-button-div'>
        <button onClick={handleDeleteClick} className='modal-delete-button'>
          Yes (Delete Event)
        </button>
        <button onClick={handleKeepClick} className='modal-keep-button'>
          No (Keep Event)
        </button>
      </div>
    </div>
  );
}

export default DeleteEvent;
