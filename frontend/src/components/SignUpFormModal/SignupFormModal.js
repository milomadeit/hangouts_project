import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  // variable for button to be disabled
  const isButtonDisabled =
    !email ||
    username.length < 4 ||
    !password ||
    password.length < 6 ||
    confirmPassword.length < 6 ||
    !firstName ||
    !lastName;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setErrors(data.errors);
          }
        });
    }
    return setErrors({
      confirmPassword:
        "Confirm Password field must be the same as the Password field",
    });
  };

  return (
    <div className='SignUpFormDiv'>
      <h1>Sign Up</h1>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label className='inputLabel'>
          Email
          <input
            className='inputField'
            type='text'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p className='error'>{errors.email}</p>}
        <label className='inputLabel'>
          Username
          <input
            className='inputField'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p className='error'>{errors.username}</p>}
        <label className='inputLabel'>
          First Name
          <input
            className='inputField'
            type='text'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && <p className='error'>{errors.firstName}</p>}
        <label className='inputLabel'>
          Last Name
          <input
            type='text'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p className='error'>{errors.lastName}</p>}
        <label className='inputLabel'>
          Password
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className='error'>{errors.password}</p>}
        <label className='inputLabel'>
          Confirm Password
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && (
          <p className='error'>{errors.confirmPassword}</p>
        )}
        <label className='signUpButton'>
          <button
            id={isButtonDisabled ? "inactive" : "activeButton"}
            type='submit'
            disabled={isButtonDisabled}
          >
            Sign Up
          </button>
        </label>
      </form>
    </div>
  );
}

export default SignupFormModal;
