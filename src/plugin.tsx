import { createRoot } from "react-dom/client";
import { Reshaped } from "reshaped";
import "reshaped/themes/figma/theme.css";

import { useState } from "react";
import MainPage from "./pages/MainPage.js";
import SecondPage from "./pages/SecondPage.js";

const App = () => {
  const [page, setPage] = useState<"main" | "second">("main");
  return (
    <div style={{ width: 700, height: 1100, background: "#18181B", display: "flex", flexDirection: "column" }}>
      {/* 네비게이션 바 */}
      <nav
        style={{
          width: "100%",
          height: 56,
          background: "#23232A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: "1px solid #333",
          boxSizing: "border-box",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={() => setPage("main")}
            style={{
              background: page === "main" ? "#4ADE80" : "#23232A",
              color: page === "main" ? "#18181B" : "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              padding: "8px 20px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: page === "main" ? "0 2px 8px 0 rgba(76,222,128,0.15)" : "none",
            }}
          >
            메인
          </button>
          <button
            onClick={() => setPage("second")}
            style={{
              background: page === "second" ? "#4ADE80" : "#23232A",
              color: page === "second" ? "#18181B" : "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              padding: "8px 20px",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: page === "second" ? "0 2px 8px 0 rgba(76,222,128,0.15)" : "none",
            }}
          >
            두번째
          </button>
        </div>
        <span style={{ color: "#aaa", fontWeight: 600, fontSize: 15, letterSpacing: 1 }}>Figma Plugin</span>
      </nav>
      <div style={{ flex: 1, overflow: "auto" }}>
        {page === "main" ? <MainPage onNext={() => setPage("second")} /> : <SecondPage />}
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
