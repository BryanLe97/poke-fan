import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* basename matches vite.config.ts's `base`, so routing works once the
        build is served from https://<user>.github.io/poke-fan/ */}
    <BrowserRouter basename="/poke-fan">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
