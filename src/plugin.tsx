import { createRoot } from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/figma/theme.css";
import Navbar from "./components/Navbar.js";
import MainPage from "./pages/MainPage.js";
import SecondPage from "./pages/SecondPage.js";
import React, { useState } from "react";
import scrollbarStyles from "./styles/scrollbar.module.css";

const steps = [
  { key: "main", label: "1. 요소 선택" },
  { key: "second", label: "2. 이름 변경" },
  { key: "result", label: "3. 결과 확인" },
];

const App = () => {
  const [step, setStep] = useState(0); // 0: main, 1: second, 2: result
  const [completed, setCompleted] = useState([true, true, false]);

  const handleStepChange = (idx: number) => {
    setStep(idx);
  };

  let pageContent = null;
  if (step === 0)
    pageContent = (
      <MainPage
        onNext={() => {
          setCompleted([true, true, false]);
          setStep(1);
        }}
      />
    );
  else if (step === 1)
    pageContent = (
      <SecondPage
        onNext={() => {
          setCompleted([true, true, true]);
          setStep(2);
        }}
      />
    );
  else
    pageContent = (
      <div
        style={{
          color: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        🎉 결과가 여기에 표시됩니다!
      </div>
    );

  return (
    <div style={{ width: 400, height: 600, background: "#18181B", display: "flex", flexDirection: "column" }}>
      <Navbar step={step} completed={completed} onStepChange={handleStepChange} />
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className={scrollbarStyles.customScrollbar}>
        {pageContent}
      </div>
    </div>
  );
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <Reshaped theme="figma">
    <App />
  </Reshaped>,
);
