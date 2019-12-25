import React, { useState, SyntheticEvent } from "react";
import axios from "axios";

const SignUp: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    console.log(username, password);

    try {
      const res = await axios.post("/addUser", {
        username,
        userDisplayName,
        password
      });
      console.log("Success: ", res.data);
    } catch (err) {
      console.error("Error: ", err);
    }
  };
  const onChangeUsername = (e: { target: { value: string } }) => {
    setUsername(e.target.value);
  };
  const onChangeUserDisplayName = (e: { target: { value: string } }) => {
    setUserDisplayName(e.target.value);
  };
  const onChangePassword = (e: { target: { value: string } }) => {
    setPassword(e.target.value);
  };
  return (
    <div className="jumbotron vertical-center">
      <div className="container">
        <section className="panel panel-default">
          <header className="panel-heading">
            <h3 className="panel-title">SignUp Component</h3>
          </header>
          <main className="panel-body">
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  id="username"
                  placeholder="Username"
                  onChange={onChangeUsername}
                />
              </div>
              <div className="form-group">
                <label htmlFor="userDisplayName">User Display Name</label>
                <input
                  type="text"
                  name="userDisplayName"
                  className="form-control"
                  id="userDisplayName"
                  placeholder="User Display Name"
                  onChange={onChangeUserDisplayName}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                  onChange={onChangePassword}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </main>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
