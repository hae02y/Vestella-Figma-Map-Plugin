import React, { useState } from "react";

// 쿼리 추출 패널 컴포넌트 import (아직 없으면 아래에 임시 정의)
import BeaconsQueryPanel from "../components/BeaconsQueryPanel.js";
import SlotsQueryPanel from "../components/SlotsQueryPanel.js";
import RouteQueryPanel from "../components/RouteQueryPanel.js";
import RoutePathsQueryPanel from "../components/RoutePathsQueryPanel.js";
import PillarsQueryPanel from "../components/PillarsQueryPanel.js";
import styles from "../styles/SecondPage.module.css";

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
          {/* 탭 네비게이션 드롭다운 */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <select
              value={activeTab}
              onChange={(e) => {
                setActiveTab(e.target.value as typeof activeTab);
              }}
              style={{
                background: "#23232A",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                padding: "8px 24px",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(76,222,128,0.10)",
                outline: "none",
                appearance: "none",
                minWidth: 160,
                textAlign: "center",
              }}
            >
              {visibleTabs.map((tab) => (
                <option key={tab} value={tab} style={{ color: "#18181B" }}>
                  {tab}
                </option>
              ))}
            </select>
          </div>
          {/* 탭별 쿼리 추출 UI */}
          <div style={{ minHeight: 220 }}>
            {activeTab === "Beacons" && (
              <BeaconsQueryPanel
                selected={selected}
                onFlash={(ids: string[]) => {
                  parent.postMessage({ pluginMessage: { type: "flash-elements", ids, duration: 3000 } }, "*");
                }}
              />
            )}
            {activeTab === "Slots" && (
              <SlotsQueryPanel
                selected={selected}
                onFlash={(ids: string[]) => {
                  parent.postMessage({ pluginMessage: { type: "flash-elements", ids, duration: 3000 } }, "*");
                }}
              />
            )}
            {activeTab === "RoutePaths" && (
              <RoutePathsQueryPanel
                selected={selected}
                onFlash={(ids: string[]) => {
                  parent.postMessage({ pluginMessage: { type: "flash-elements", ids, duration: 3000 } }, "*");
                }}
              />
            )}
            {activeTab === "Routes" && (
              <RouteQueryPanel
                selected={selected}
                onFlash={(ids: string[]) => {
                  parent.postMessage({ pluginMessage: { type: "flash-elements", ids, duration: 3000 } }, "*");
                }}
              />
            )}
            {activeTab === "Pillars" && (
              <PillarsQueryPanel
                selected={selected}
                onFlash={(ids: string[]) => {
                  parent.postMessage({ pluginMessage: { type: "flash-elements", ids, duration: 3000 } }, "*");
                }}
              />
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
