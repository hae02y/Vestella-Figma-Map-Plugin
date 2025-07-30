import { createRoot } from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/figma/theme.css";

import { useState } from "react";
import MainPage from "./MainPage.js";
import SecondPage from "./SecondPage.js";

const App = () => {
  const [showSecond, setShowSecond] = useState(false);
  return showSecond ? <SecondPage /> : <MainPage onNext={() => setShowSecond(true)} />;
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <Reshaped theme="figma">
    <App />
  </Reshaped>,
);
