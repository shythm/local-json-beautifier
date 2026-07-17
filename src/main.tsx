import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@channel.io/bezier-react/styles.css";

import App from "./App";
import SystemThemeProvider from "./SystemThemeProvider";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <SystemThemeProvider>
      <App />
    </SystemThemeProvider>
  </StrictMode>,
);
