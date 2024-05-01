import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import { Profile } from "./pages/Profile.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path={"/"} Component={App}></Route>
      <Route path={"/login"} Component={Login}></Route>
      <Route path={"/profile"} Component={Profile}></Route>
    </Routes>
  </Router>
);
