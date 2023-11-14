import React from "react";
import { useModal } from "../../context/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { deleteGroup } from "../../store/groups";
import "./deleteModal.css";

function DeleteGroup() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();
  const currentGroup = useSelector((state) => state.groups.currentGroup);

  const handleDeleteClick = () => {
    dispatch(deleteGroup(currentGroup.id)).then(closeModal);
    history.push("/groups");
  };

  const handleKeepClick = () => {
    closeModal();
  };

  return (
    <div className='delete-modal-div'>
      <div className='delete-modal-title-div'>
        <h2 className='delete-modal-title'> Confirm Delete</h2>
        <p className='delete-modal-p'>
          Are you sure you want to remove this group?
        </p>
      </div>
      <div className="delete-modal-button-div">
        <button onClick={handleDeleteClick} className='modal-delete-button'>
          Yes (Delete Group)
        </button>
        <button onClick={handleKeepClick} className='modal-keep-button'>
          No (Keep Group)
        </button>
      </div>
    </div>
  );
}

export default DeleteGroup;
