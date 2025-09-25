import React, { useState } from "react";
import VerifiedIcon from "../pages/VerifiedIcon.js";
import styles from "../styles/SecondPage.module.css";
// --- 리팩토링: 비콘 패널 스타일로 RouteQueryPanel 구현 ---
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

interface RouteQueryPanelProps {
  selected: FigmaNode | null;
  onFlash?: (ids: string[]) => void;
}

function getRelativeCenter(node: FigmaNode): { x: number; y: number } {
  return {
    x: (node.x ?? 0) + (node.width ?? 0) / 2,
    y: (node.y ?? 0) + (node.height ?? 0) / 2,
  };
}

const todayPrefix = (() => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
})();

function makeRouteQueries(
  node: FigmaNode | null,
  prefix: string,
  startCounter: number,
  pklSeq: string,
  pkfSeq: string,
  spgSeq: string,
  sptW: string,
  sptH: string,
): { route: string[]; spot: string[] } {
  if (!node || !node.children) return { route: [], spot: [] };
  const routeGroup = node.children.find(
    (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Routes",
  );
  if (!routeGroup || !routeGroup.children) return { route: [], spot: [] };
  let counter = startCounter;
  const route: string[] = [];
  const spot: string[] = [];
  routeGroup.children.forEach((child) => {
    const number = String(counter).padStart(7, "0");
    const id = prefix + number;
    counter++;
    // tb_svp_route 쿼리
    route.push(`INSERT INTO tb_svp_route (rot_seq, pkl_seq, pkf_seq) VALUES ('${id}', '${pklSeq}', '${pkfSeq}');`);
    // tb_msv_spot 쿼리 (비콘과 동일)
    const width = child.width ?? 0;
    const height = child.height ?? 0;
    const { x: cx, y: cy } = getRelativeCenter(child);
    spot.push(
      `INSERT INTO tb_msv_spot (spt_seq, spg_seq, ref_seq, spt_tp, spt_st, spt_w, spt_h, spt_rt, spt_pt, spt_ph, spt_pg, created, updated) VALUES ('${id.replace("ROT", "SPT")}', '${spgSeq}', '${id}', 'ROT', '01', ${width}, ${height}, 0, GEOMFROMTEXT('POINT(${cx} ${cy})'), NULL, NULL, NOW(), NOW());`,
    );
  });
  return { route, spot };
}

const RouteQueryPanel = ({ selected, onFlash }: RouteQueryPanelProps) => {
  const getRouteIds = () => {
    if (!selected || !selected.children) return [];
    const routeGroup = selected.children.find(
      (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Route",
    );
    if (!routeGroup || !routeGroup.children) return [];
    return routeGroup.children.map((child) => child.id);
  };

  const [prefix, setPrefix] = useState(`ROT${todayPrefix}`);
  const [startCounter, setStartCounter] = useState(1);
  const [pklSeq, setPklSeq] = useState(`PKL${todayPrefix}`);
  const [pkfSeq, setPkfSeq] = useState(`PKF${todayPrefix}`);
  const [spgSeq, setSpgSeq] = useState(`SPG${todayPrefix}`);
  const [sptW, setSptW] = useState("64");
  const [sptH, setSptH] = useState("64");
  const [routeQueries, setRouteQueries] = useState<string[]>([]);
  const [spotQueries, setSpotQueries] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [queried, setQueried] = useState(false);

  const handleExtract = () => {
    const result = makeRouteQueries(selected, prefix, startCounter, pklSeq, pkfSeq, spgSeq, sptW, sptH);
    setRouteQueries(result.route);
    setSpotQueries(result.spot);
    setQueried(true);
  };

  const handleCopy = (type: "route" | "spot" | "all") => {
    let text = "";
    if (type === "route") text = routeQueries.join("\n");
    else if (type === "spot") text = spotQueries.join("\n");
    else text = [...routeQueries, ...spotQueries].join("\n");
    if (!text) return;
    const tryClipboard = async () => {
      try {
        setCopied(true);
        await navigator.clipboard.writeText(text);
        setTimeout(() => setCopied(false), 1200);
        return;
      } catch (e) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
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
          alert("복사에 실패했습니다. 브라우저 권한을 확인하세요.");
        }
        document.body.removeChild(textarea);
      }
    };
    tryClipboard();
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <div
        style={{
          background: "#23232A",
          borderRadius: 12,
          padding: "18px 10px 12px 10px",
          marginBottom: 14,
          boxShadow: "0 2px 8px 0 rgba(76,222,128,0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px 12px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="prefix"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              Prefix
              {prefix.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="prefix"
              className={styles.inputBox}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="startCounter"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              Start No.
              {startCounter > 0 && <VerifiedIcon size={16} />}
            </label>
            <input
              id="startCounter"
              className={styles.inputBox}
              type="number"
              value={startCounter}
              min={1}
              onChange={(e) => setStartCounter(Number(e.target.value))}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="pklSeq"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              PKL Code.
              {pklSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pklSeq"
              className={styles.inputBox}
              value={pklSeq}
              onChange={(e) => setPklSeq(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="pkfSeq"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              PKF Code.
              {pkfSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pkfSeq"
              className={styles.inputBox}
              value={pkfSeq}
              onChange={(e) => setPkfSeq(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="spgSeq"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              SPG Code.
              {spgSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="spgSeq"
              className={styles.inputBox}
              value={spgSeq}
              onChange={(e) => setSpgSeq(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px 12px",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="sptW"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              SPOT W{sptW.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="sptW"
              className={styles.inputBox}
              value={sptW}
              onChange={(e) => setSptW(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          <div
            style={{
              background: "#23232A",
              borderRadius: 8,
              padding: "7px 8px",
              boxShadow: "0 1px 2px 0 rgba(76,222,128,0.05)",
              maxWidth: 180,
              margin: "0 auto",
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="sptH"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              SPOT H{sptH.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="sptH"
              className={styles.inputBox}
              value={sptH}
              onChange={(e) => setSptH(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
        </div>
        <div style={{ marginTop: 18, textAlign: "right", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className={styles.nextButton} onClick={handleExtract} style={{ fontSize: 15, padding: "8px 28px" }}>
            Query
          </button>
          <button
            className={styles.nextButton}
            style={{
              fontSize: 15,
              padding: "8px 18px",
              background: "#23232A",
              color: "#4ADE80",
              border: "1px solid #4ADE80",
            }}
            onClick={() => {
              const ids = getRouteIds();
              if (onFlash) onFlash(ids);
            }}
            disabled={getRouteIds().length === 0}
          >
            ✨
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: "#4ADE80", fontSize: 14 }}>
            {routeQueries.length > 0
              ? `Count: ${routeQueries.length} EA`
              : "Route 그룹/프레임의 자식 요소를 쿼리로 변환합니다."}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy("route")}
              disabled={routeQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Route Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy("spot")}
              disabled={spotQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Spot Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy("all")}
              disabled={routeQueries.length === 0 && spotQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              All Copy
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <pre
              style={{
                background: "#18181B",
                color: "#fff",
                borderRadius: 10,
                padding: "18px 16px 16px 16px",
                fontSize: 13,
                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                minHeight: 80,
                margin: 0,
                overflowX: "auto",
                position: "relative",
              }}
            >
              {routeQueries.length > 0 || spotQueries.length > 0
                ? [...routeQueries, ...spotQueries].join("\n")
                : "-- 여기에 쿼리가 표시됩니다."}
            </pre>
            {copied && (
              <div
                style={{
                  position: "absolute",
                  top: -28,
                  right: 10,
                  background: "#23232A",
                  color: "#4ADE80",
                  borderRadius: 6,
                  fontSize: 12,
                  padding: "4px 12px",
                  boxShadow: "0 2px 8px 0 rgba(76,222,128,0.15)",
                  opacity: 0.95,
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                복사되었습니다
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RouteQueryPanel;
