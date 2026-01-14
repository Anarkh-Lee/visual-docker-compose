import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGA } from './lib/analytics';

// 初始化 Google Analytics（仅在生产环境）
if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  initGA();
}

createRoot(document.getElementById("root")!).render(<App />);
