
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const APP_WIDTH = 390;
const APP_HEIGHT = 844;

function updateAppScale() {
  const widthScale = window.innerWidth / APP_WIDTH;
  const heightScale = window.innerHeight / APP_HEIGHT;
  const scale = Math.min(widthScale, heightScale, 1);

  document.documentElement.style.setProperty("--app-scale", String(scale));
}

updateAppScale();
window.addEventListener("resize", updateAppScale);

createRoot(document.getElementById("root")!).render(<App />);
  
