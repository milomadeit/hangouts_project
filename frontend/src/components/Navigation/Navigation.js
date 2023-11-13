import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignUpFormModal/SignupFormModal";
import "./navigation.css";
import hangout from "../../images/hangout.png";

function Navigation({ isLoaded }) {
  // const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  // const handleDemoUser = (e) => {
  //   e.preventDefault();

  //   dispatch(loginDemo());
  // };

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <li className='navProfile'>
        <NavLink className='startGroup' to='/groups/new'>
          Start a new group
        </NavLink>
        <ProfileButton user={sessionUser} />
      </li>
    );
  } else {
    sessionLinks = (
      <li className='navLinks'>
        <OpenModalButton
          className='loginButton'
          buttonText='Log In'
          modalComponent={<LoginFormModal />}
        />
        <OpenModalButton
          className='signupButton'
          buttonText='Sign Up'
          modalComponent={<SignupFormModal />}
        />
      </li>
    );
  }

  return (
    <div className='navHeader'>
      <ul className='navUl'>
        <li className='navLinkHome'>
          <NavLink exact to='/'>
            <img className='homeLogo' src={hangout} alt='hangout logo' />
          </NavLink>
        </li>
        {isLoaded && sessionLinks}
      </ul>
    </div>
  );
}

export default Navigation;
