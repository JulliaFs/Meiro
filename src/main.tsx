import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { seedDatabaseIfEmpty } from "./data/seed";
import { useUiStore } from "./store/useUiStore";

document.documentElement.classList.toggle("dark", useUiStore.getState().theme === "dark");

seedDatabaseIfEmpty().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
