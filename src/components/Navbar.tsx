import React, { useState } from "react";
import styles from "../styles/Navbar.module.css";
import scrollbar from '../styles/scrollbar.module.css';
import MainPage from "../pages/MainPage.js";
import SecondPage from "../pages/SecondPage.js";

const steps = [
  { key: "main", label: "Floor" },
  { key: "second", label: "Query" },
  { key: "result", label: "Result" },
];

const Navbar = () => {
  const [step, setStep] = useState(0); // 0: main, 1: second, 2: result

  const [completed, setCompleted] = useState([true, true, false]);

  // 단계별 페이지 컴포넌트
  const renderStep = () => {
    if (step === 0)
      return (
        <MainPage
          onNext={() => {
            setCompleted([true, true, false]);
            setStep(1);
          }}
        />
      );
    if (step === 1)
      return (
        <SecondPage
          onNext={() => {
            setCompleted([true, true, true]);
            setStep(2);
          }}
        />
      );
    return (
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
  };

  return (
    <div className={styles.navbarContainer}>
      {/* 스텝 네비게이션 */}
      <nav className={styles.navbar}>
        {steps.map((s, idx) => (
          <div key={s.key} className={styles.step}>
            <button
              className={[
                styles.button,
                step === idx ? styles.active : styles.inactive,
                idx > 0 && !completed[idx] ? styles.disabled : "",
              ].join(" ")}
              disabled={idx > 0 && !completed[idx]}
              onClick={() => {
                if (idx === 0 || completed[idx]) setStep(idx);
              }}
            >
              {s.label}
            </button>
            {idx < steps.length - 1 && <span className={styles.arrow}>→</span>}
          </div>
        ))}
      </nav>
      <div className={`${styles.contentArea} ${scrollbar["scrollbar"] || ""}`}>{renderStep()}</div>
    </div>
  );
};

export default Navbar;