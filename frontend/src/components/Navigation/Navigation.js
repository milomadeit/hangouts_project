import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton/ModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignUpFormModal/SignupFormModal";
import { loginDemo } from "../../store/session";
import "./navigation.css";

function Navigation({ isLoaded }) {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  const handleDemoUser = (e) => {
    e.preventDefault();

    dispatch(loginDemo());
  };

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <li>
        <ProfileButton user={sessionUser} />
      </li>
    );
  } else {
    sessionLinks = (
      <li>
        <OpenModalButton
          buttonText='Log In'
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          buttonText='Sign Up'
          modalComponent={<SignupFormModal />}
        />
        <button onClick={handleDemoUser}>Demo User</button>
      </li>
    );
  }

  return (
    <ul>
      <li>
        <NavLink exact to='/'>
          Home
        </NavLink>
      </li>
      {isLoaded && sessionLinks}
    </ul>
  );
}

export default Navigation;
