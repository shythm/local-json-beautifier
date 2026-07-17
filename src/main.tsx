import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProvider } from "@channel.io/bezier-react";
import "@channel.io/bezier-react/styles.css";

import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <AppProvider themeName="dark">
      <App />
    </AppProvider>
  </StrictMode>,
);
