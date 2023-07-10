import React from "react";
import logo from "./logo.svg";
import "./App.css";
import * as transcript from "@the-annotation-project/debate-data/BushVGore2000/Debate2/transcription.json";
import * as annotations from "@the-annotation-project/debate-data/BushVGore2000/Debate2/annotations.json";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
