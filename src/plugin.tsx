import { createRoot } from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/figma/theme.css";
import "./styles/scrollbar.module.css";
import Navbar from "./components/Navbar.js";

const App = () => {
  return <Navbar />;
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <Reshaped theme="figma">
    <App />
  </Reshaped>,
);
