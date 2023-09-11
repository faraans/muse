import { data } from "autoprefixer";
import axios from "axios";
import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("hi");
    console.log(email);
    console.log(password);

    await axios

      .post("http://127.0.0.1:8000/login", {
        params: { email: email, password: password },
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };
  return (
    <div className="">
      <div className="p-3 bg-white text-violet-900 p-10">
        {/* <form onSubmit={handleSubmit} method="POST"> */}
        <div className="mb-3 ">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Enter email"
            className="border px-3 mx-12"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            className="border px-3 mx-5"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="my-3 px-10 border border-violet-900"
          onClick={(event) => {
            handleSubmit(event);
          }}
        >
          Login
        </button>
        {/* </form> */}
      </div>
    </div>
  );
};

export default Login;
