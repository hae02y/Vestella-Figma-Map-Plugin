import React from "react";
import styles from "../styles/Navbar.module.css";

const steps = [
  { key: "main", label: "Floor" },
  { key: "second", label: "Query" },
  { key: "result", label: "Result" },
];

interface NavbarProps {
  step: number;
  completed: boolean[];
  onStepChange: (idx: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ step, completed, onStepChange }) => {
  return (
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
              if (idx === 0 || completed[idx]) onStepChange(idx);
            }}
          >
            {s.label}
          </button>
          {idx < steps.length - 1 && <span className={styles.arrow}>→</span>}
        </div>
      ))}
    </nav>
  );
};

export default Navbar;
