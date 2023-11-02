import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import "./LoginForm.css";
import * as sessionActions from "../../store/session";

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser.id) return <Redirect to='/' />;

  const handleSubmit = (e) => {
    e.preventDefault();
    // clear any errors
    setErrors({});
    // establish payload
    const payload = {
      credential,
      password,
    };

    return dispatch(sessionActions.login(payload)).catch(async (res) => {
      const data = await res.json();
      if (data && data.errors) setErrors(data.errors);
    });
  };

  return (
    <div>
      <h2>Login Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email or Username:{" "}
          <input
            type='text'
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
          ></input>
        </label>
        <label>
          Password:{" "}
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          <button type='submit'>Login</button>
        </label>
      </form>
    </div>
  );
}

export default LoginFormPage;
