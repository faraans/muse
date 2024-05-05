import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path={"/"} element={<App />} />
      <Route path={"/login"} element={<Login />} />
      <Route
        path={"/profile"}
        element={<Profile accessToken={localStorage.getItem("accessToken")} />}
      />
    </Routes>
  </Router>,
  document.getElementById("root")
);
