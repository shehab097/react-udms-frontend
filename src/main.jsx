import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes"; // Centralized routes
import "./index.css";

const rootElement = document.getElementById("root");


if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a <div id='root'></div>");
}


ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
