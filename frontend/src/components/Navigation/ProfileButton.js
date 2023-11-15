import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import * as sessionActions from "../../store/session";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignUpFormModal/SignupFormModal";
import LoginFormModal from "../LoginFormModal/LoginFormModal";

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    history.push("/");
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button onClick={openMenu}>
        <i className='fas fa-user-circle' />
      </button>
      <div className='dropDownProfile'>
        <ul className={ulClassName} ref={ulRef}>
          {user ? (
            <>
              <li>Hello, {user.firstName}</li>
              <li>{user.email}</li>
              <li>
                <Link className='viewGroupsLink' to='/groups'>
                  View Groups
                </Link>
              </li>
              <li>
                <Link className='viewEventsLink' to='/events'>
                  View Events
                </Link>
              </li>
              <li>
                <button className='logoutButton' onClick={logout}>
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <OpenModalButton
                  buttonText='Log In'
                  modalComponent={<LoginFormModal />}
                />
              </li>
              <li>
                <OpenModalButton
                  buttonText='Sign Up'
                  modalComponent={<SignupFormModal />}
                />
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default ProfileButton;
