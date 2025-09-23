import React, { useState } from "react";

// 쿼리 추출 패널 컴포넌트 import (아직 없으면 아래에 임시 정의)
import BeaconsQueryPanel from "../components/BeaconsQueryPanel.js";
import styles from "./styles/SecondPage.module.css";

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  children?: FigmaNode[];
};

const SecondPage = ({ onNext }: { onNext?: () => void }) => {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<FigmaNode | null>(null);
  const [activeTab, setActiveTab] = useState<"Beacons" | "RoutePaths" | "Routes" | "Pillars" | "Slots">("Beacons");

  // Figma selection 요청
  const requestSelection = () => {
    parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage && event.data.pluginMessage.type === "selection") {
        const node = event.data.pluginMessage.node as FigmaNode;
        setSelected(node);
      }
    };
    window.addEventListener("message", handleMessage);
    requestSelection();
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line
  }, []);

  // Beacons 그룹/프레임의 자식 요소들을 각각 쿼리로 변환
  const makeBeaconQueries = (node: FigmaNode | null) => {
    if (!node || !node.children) return [];
    // Beacons 그룹/프레임 찾기
    const beaconsGroup = node.children.find(
      (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Beacons",
    );
    if (!beaconsGroup || !beaconsGroup.children) return [];
    return beaconsGroup.children.map(
      (child) =>
        `INSERT INTO tb_msv_spot (spt_seq, ref_seq, spt_nm, spt_w, spt_h, spt_x, spt_y) VALUES ('${child.id}', '${child.id}', '${child.name}', '${child.width ?? 0}', '${child.height ?? 0}', '${child.x ?? 0}', '${child.y ?? 0}');`,
    );
  };

  const [beaconQueries, setBeaconQueries] = useState<string[]>([]);

  const handleExtract = () => {
    setBeaconQueries(makeBeaconQueries(selected));
    setQuery(makeBeaconQueries(selected).join("\n"));
  };

  const handleCopy = () => {
    if (!query) return;
    const tryClipboard = async () => {
      try {
        await navigator.clipboard.writeText(query);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
        return;
      } catch (e) {
        // fallback
        const textarea = document.createElement("textarea");
        textarea.value = query;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch (err) {
          alert("Failed to copy. Please check browser permissions.");
        }
        document.body.removeChild(textarea);
      }
    };
    tryClipboard();
  };

  // Child Element에 해당되는 타입이 실제로 존재할 때만 탭 표시
  const childTypes = React.useMemo(() => {
    if (!selected || !selected.children) return [];
    const typeSet = new Set<string>();
    selected.children.forEach((child) => {
      if ((child.type === "FRAME" || child.type === "GROUP") && child.name.endsWith("s")) {
        // 예: Beacons, RoutePaths, Routes, Pillars, Slots
        typeSet.add(child.name);
      }
    });
    return Array.from(typeSet) as Array<"Beacons" | "RoutePaths" | "Routes" | "Pillars" | "Slots">;
  }, [selected]);

  // childTypes에 해당하는 탭만 렌더링
  const tabList = ["Beacons", "RoutePaths", "Routes", "Pillars", "Slots"] as const;
  const visibleTabs = tabList.filter((tab) => childTypes.includes(tab));

  // activeTab이 visibleTabs에 없으면 첫 번째로 자동 이동
  React.useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] ?? "Beacons");
    }
    // eslint-disable-next-line
  }, [visibleTabs.join(",")]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.card}>
          {/* 탭 네비게이션 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, justifyContent: "center" }}>
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "#4ADE80" : "#23232A",
                  color: activeTab === tab ? "#18181B" : "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "6px 18px",
                  cursor: "pointer",
                  boxShadow: activeTab === tab ? "0 2px 8px 0 rgba(76,222,128,0.15)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* 탭별 쿼리 추출 UI */}
          <div style={{ minHeight: 220 }}>
            {activeTab === "Beacons" && <BeaconsQueryPanel selected={selected} />}
            {activeTab === "RoutePaths" && (
              <div style={{ color: "#aaa", marginBottom: 12 }}>RoutePaths 쿼리 추출 UI (구현 예정)</div>
            )}
            {activeTab === "Routes" && (
              <div style={{ color: "#aaa", marginBottom: 12 }}>Routes 쿼리 추출 UI (구현 예정)</div>
            )}
            {activeTab === "Pillars" && (
              <div style={{ color: "#aaa", marginBottom: 12 }}>Pillars 쿼리 추출 UI (구현 예정)</div>
            )}
            {activeTab === "Slots" && (
              <div style={{ color: "#aaa", marginBottom: 12 }}>Slots 쿼리 추출 UI (구현 예정)</div>
            )}
          </div>
          {onNext && (
            <button className={styles.nextButton} onClick={onNext} style={{ marginTop: 24 }}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondPage;
