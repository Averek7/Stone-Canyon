import "./App.css";
import { useState } from "react";
import Chatbot from "./components/Chatbot";
import { useCategory } from "./context/CategoryContext";

function App() {
  const { categoryID, setCategoryID, chatbotVisible, setChatbotVisible } = useCategory();

  const handleStart = () => {
    if (categoryID) {
      setChatbotVisible(true);
    }
  };

  return (
    <div className="app-container">
      {!chatbotVisible && (
        <div className="start-box">
          Category ID:
          <input
            type="text"
            placeholder="Enter Category ID"
            className="input-box"
            value={categoryID}
            onChange={(e) => setCategoryID(e.target.value)}
          />
          <button onClick={handleStart} className="btn">
            Start
          </button>
        </div>
      )}

      <div
        className="chatbot-icon"
        onClick={() => setChatbotVisible(!chatbotVisible)}
      >
        💬
      </div>

      {chatbotVisible && (
        <div className="chatbot-container">
          <Chatbot categoryID={categoryID} onClose={() => setChatbotVisible(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
