import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CategoryProvider } from "./context/CategoryContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </StrictMode>
);
