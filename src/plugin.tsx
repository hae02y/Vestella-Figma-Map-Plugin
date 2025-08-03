import { createRoot } from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/figma/theme.css";

import { useState } from "react";
import MainPage from "./pages/MainPage.js";
import SecondPage from "./pages/SecondPage.js";

const steps = [
  { key: "main", label: "1. 요소 선택" },
  { key: "second", label: "2. 이름 변경" },
  { key: "result", label: "3. 결과 확인" },
];

const App = () => {
  const [step, setStep] = useState(0); // 0: main, 1: second, 2: result

  // 각 단계별 완료 여부 (여기선 임시로 이전 단계 완료 시 true)
  const [completed, setCompleted] = useState([true, false, false]);

  // 단계별 페이지 컴포넌트
  const renderStep = () => {
    if (step === 0) return <MainPage onNext={() => {
      setCompleted([true, true, false]);
      setStep(1);
    }} />;
    if (step === 1) return <SecondPage onNext={() => {
      setCompleted([true, true, true]);
      setStep(2);
    }} />;
    return (
      <div style={{ color: "#fff", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>
        🎉 결과가 여기에 표시됩니다!
      </div>
    );
  };

  return (
    <div style={{ width: 700, height: 1100, background: "#18181B", display: "flex", flexDirection: "column" }}>
      {/* 스텝 네비게이션 */}
      <nav style={{
        width: "100%",
        height: 64,
        background: "#23232A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid #333",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
        gap: 0
      }}>
        {steps.map((s, idx) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
            <button
              disabled={idx > 0 && !completed[idx]}
              onClick={() => {
                // completed[idx]가 true인 경우에만 이동
                if (idx === 0 || completed[idx]) setStep(idx);
              }}
              style={{
                background: step === idx ? "#4ADE80" : completed[idx] ? "#23232A" : "#23232A",
                color: step === idx ? "#18181B" : completed[idx] ? "#fff" : "#888",
                border: "none",
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 15,
                padding: "10px 28px",
                margin: "0 8px",
                cursor: idx > 0 && !completed[idx] ? "not-allowed" : "pointer",
                opacity: idx > 0 && !completed[idx] ? 0.5 : 1,
                boxShadow: step === idx ? "0 2px 8px 0 rgba(76,222,128,0.15)" : "none",
                borderBottom: step === idx ? "3px solid #4ADE80" : "none",
                transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
            {idx < steps.length - 1 && (
              <span style={{ color: "#555", fontSize: 18, fontWeight: 700, margin: "0 2px" }}>→</span>
            )}
          </div>
        ))}
      </nav>
      <div style={{ flex: 1, overflow: "auto" }}>
        {renderStep()}
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
