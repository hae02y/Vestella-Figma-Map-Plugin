import React, { useState } from "react";
import VerifiedIcon from "../pages/VerifiedIcon.js";
// import styles from "../styles/SecondPage.module.css";

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

interface PillarsQueryPanelProps {
  selected?: FigmaNode | null;
  onFlash?: (ids: string[]) => void;
}

const todayPrefix = (() => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
})();

const PillarsQueryPanel = ({ selected, onFlash }: PillarsQueryPanelProps) => {
  // 입력값 상태
  const [spgSeq, setSpgSeq] = useState(`SPG${todayPrefix}`);
  const [prefix, setPrefix] = useState(`PLL${todayPrefix}`);
  const [startNo, setStartNo] = useState(1);
  const [type, setType] = useState("PLL");
  const [pklSeq, setPklSeq] = useState(`PKL${todayPrefix}`);
  const [pkfSeq, setPkfSeq] = useState(`PKF${todayPrefix}`);
  const [pllDock, setPllDock] = useState("cc");
  const [pllConner, setPllConner] = useState("N");
  // 쿼리 결과 상태
  const [pillarQueries, setPillarQueries] = useState<string[]>([]);
  const [spotQueries, setSpotQueries] = useState<string[]>([]);
  const [queried, setQueried] = useState(false);
  const [copied, setCopied] = useState(false);

  // 쿼리 생성 함수 (실제 Figma 데이터 기반)
  const makePillarQueries = (node: FigmaNode | null) => {
    if (!node || !node.children) return { pillar: [], spot: [] };
    // Pillars 그룹 찾기
    const pillarsGroup = node.children.find(
      (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Pillars",
    );
    if (!pillarsGroup || !pillarsGroup.children) return { pillar: [], spot: [] };
    const rects = pillarsGroup.children;
    let counter = startNo;
    const pillar: string[] = [];
    const spot: string[] = [];
    const parentX = node.x ?? 0;
    const parentY = node.y ?? 0;
    rects.forEach((element) => {
      const number = String(counter).padStart(7, "0");
      const seq = prefix + number;
      counter++;
      const pll_nm = element.name ?? "noname";
      // 중점 좌표 계산
      const ex = element.x ?? 0;
      const ey = element.y ?? 0;
      const ew = element.width ?? 0;
      const eh = element.height ?? 0;
      const cx = parentX + ex + ew / 2;
      const cy = parentY + ey + eh / 2;
      // tb_msv_spot 쿼리 (비콘/슬롯/라우트와 동일하게 컬럼명 명시)
      spot.push(
        `INSERT INTO tb_msv_spot (spt_seq, spg_seq, ref_seq, spt_tp, spt_st, spt_w, spt_h, spt_rt, spt_pt, spt_ph, spt_pg, created, updated) VALUES ('${seq.replace("PLL", "SPT")}', '${spgSeq}', '${seq}', '${type}', '01', 6, 6, 0, GEOMFROMTEXT('POINT(${cx} ${cy})'), NULL, NULL, NOW(), NOW());`,
      );
      // tb_svp_parking_pillar 쿼리 (컬럼명 명시, pll_nm 문자열 처리)
      pillar.push(
        `INSERT INTO tb_svp_parking_pillar (pll_seq, pkl_seq, pkf_seq, pll_nm, pll_dock, pll_conner) VALUES ('${seq}','${pklSeq}','${pkfSeq}','${pll_nm}','${pllDock}','${pllConner}');`,
      );
    });
    return { pillar, spot };
  };

  // 쿼리 추출 버튼 클릭 시 쿼리 생성
  const handleExtract = () => {
    const result = makePillarQueries(selected ?? null);
    setPillarQueries(result.pillar);
    setSpotQueries(result.spot);
    setQueried(true);
  };

  // 복사 핸들러
  const handleCopy = (type: "pillar" | "spot" | "all") => {
    let text = "";
    if (type === "pillar") text = pillarQueries.join("\n");
    else if (type === "spot") text = spotQueries.join("\n");
    else text = [...pillarQueries, ...spotQueries].join("\n");
    if (!text) return;
    const tryClipboard = async () => {
      try {
        setCopied(true);
        await navigator.clipboard.writeText(text);
        setTimeout(() => setCopied(false), 1200);
        return;
      } catch (e) {
        // fallback
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

  // Pillars rect id 리스트 추출
  const getPillarIds = () => {
    if (!selected || !selected.children) return [];
    const pillarsGroup = selected.children.find(
      (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Pillars",
    );
    if (!pillarsGroup || !pillarsGroup.children) return [];
    return pillarsGroup.children.map((child) => child.id);
  };

  // 하이라이트 버튼 (실제 Figma canvas에 전달)
  const handleHighlight = () => {
    if (onFlash) {
      const ids = getPillarIds();
      if (ids.length > 0) {
        onFlash(ids);
      }
    } else {
      alert("기둥 하이라이트 (플러그인 연동 필요)");
    }
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
            <label htmlFor="spgSeq" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              SPG_SEQ
              {spgSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="spgSeq"
              value={spgSeq}
              onChange={(e) => setSpgSeq(e.target.value)}
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
            <label htmlFor="prefix" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Prefix
              {prefix.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="prefix"
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
            <label htmlFor="startNo" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Start No.
              {startNo > 0 && <VerifiedIcon size={16} />}
            </label>
            <input
              id="startNo"
              type="number"
              value={startNo}
              min={1}
              onChange={(e) => setStartNo(Number(e.target.value))}
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
            <label htmlFor="type" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Type
              {type.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
          {/* Counter 입력란 제거, Start No. 입력란은 위에서 추가됨 */}
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
            <label htmlFor="pklSeq" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              PKL_SEQ
              {pklSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pklSeq"
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
            <label htmlFor="pkfSeq" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              PKF_SEQ
              {pkfSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pkfSeq"
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
            <label htmlFor="pllDock" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Dock
              {pllDock.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pllDock"
              value={pllDock}
              onChange={(e) => setPllDock(e.target.value)}
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
            <label htmlFor="pllConner" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              Conner
              {pllConner.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pllConner"
              value={pllConner}
              onChange={(e) => setPllConner(e.target.value)}
              style={{ minWidth: 0, width: "100%", maxWidth: 110, height: 28, fontSize: 13, padding: "2px 8px" }}
            />
          </div>
        </div>
        <div style={{ marginTop: 18, textAlign: "right", display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={handleExtract}
            style={{
              fontSize: 15,
              padding: "8px 28px",
              background: "#4ADE80",
              color: "#23232A",
              borderRadius: 6,
              border: "none",
            }}
          >
            Query
          </button>
          <button
            style={{
              fontSize: 15,
              padding: "8px 18px",
              background: "#23232A",
              color: "#4ADE80",
              border: "1px solid #4ADE80",
              borderRadius: 6,
            }}
            onClick={handleHighlight}
          >
            ✨
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: "#4ADE80", fontSize: 14 }}>
            {pillarQueries.length > 0
              ? `Count: ${pillarQueries.length} EA`
              : "Pillars rect 더미 데이터를 쿼리로 변환합니다."}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => handleCopy("pillar")}
              disabled={pillarQueries.length === 0}
              style={{
                fontSize: 11,
                background: "#23232A",
                color: "#4ADE80",
                border: "1px solid #4ADE80",
                borderRadius: 6,
                padding: "4px 12px",
              }}
            >
              Pillar Copy
            </button>
            <button
              onClick={() => handleCopy("spot")}
              disabled={pillarQueries.length === 0}
              style={{
                fontSize: 11,
                background: "#23232A",
                color: "#4ADE80",
                border: "1px solid #4ADE80",
                borderRadius: 6,
                padding: "4px 12px",
              }}
            >
              Geo Copy
            </button>
            <button
              onClick={() => handleCopy("all")}
              disabled={pillarQueries.length === 0}
              style={{
                fontSize: 11,
                background: "#23232A",
                color: "#4ADE80",
                border: "1px solid #4ADE80",
                borderRadius: 6,
                padding: "4px 12px",
              }}
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
              {pillarQueries.length > 0
                ? [...pillarQueries, ...spotQueries].join("\n")
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

export default PillarsQueryPanel;
