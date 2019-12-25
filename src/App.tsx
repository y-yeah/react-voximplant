import React from "react";
import "./App.css";
import SignUp from "./components/SignUp";
import Video from "./components/Video";

const App: React.FC = () => (
  <div className="App">
    <SignUp />
    <Video />
  </div>
);

export default App;
