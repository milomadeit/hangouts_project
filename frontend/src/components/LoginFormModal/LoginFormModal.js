import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import { loginDemo } from "../../store/session";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleDemoUser = (e) => {
    e.preventDefault();

    dispatch(loginDemo());
    closeModal();
  };

  useEffect(() => {
    const currErrors = {};

    if (credential.length < 4)
      currErrors.credential = "Please enter a username or email";
    if (password.length < 6) currErrors.password = "password is too short";

    setErrors(currErrors);
  }, [credential, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    dispatch(sessionActions.login({ credential, password }))
      .then((response) => {
        // Check if the response is okay, then close the modal
        if (response.ok) {
          closeModal();
        }
      })
      .catch((error) => {
        error.json().then((errorData) => {
          // Assuming your error structure has a 'message' key
          if (errorData.message === "Invalid credentials")
            setErrors({ login: "The provided credentials were invalid" });
        });
      });
  };

  return (
    <div className='LoginFormDiv'>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label className='inputLabel'>
          Username or Email
          <input
            className='inputField'
            type='text'
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p className='error'>{errors.credential}</p>}
        <label className='inputLabel'>
          Password
          <input
            className='inputField'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.login && <p className='error'>{errors.login}</p>}
        <label className='submitButton'>
          <button type='submit' disabled={errors.credential || errors.password}>
            Log In
          </button>
        </label>
        <label className='demoLabel'>
          <button className='demoButton' onClick={handleDemoUser}>
            Demo User
          </button>
        </label>
      </form>
    </div>
  );
}

export default LoginFormModal;
