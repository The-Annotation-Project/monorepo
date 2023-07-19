import React, { Suspense, lazy, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

// Use imports if we don't want to code split
// import {
//   annotationData,
//   transcriptionData,
// } from "@the-annotation-project/debate-data/BushVGore2000/Debate2";

const BoringButCool = lazy(() => import("./components/BoringButCool"));

function App() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={() => setShowComponent(!showComponent)}>
          Toggle Component
        </button>
        {showComponent && (
          <Suspense fallback={<div>fetching...</div>}>
            <BoringButCool />
          </Suspense>
        )}
      </header>
    </div>
  );
}

export default App;
