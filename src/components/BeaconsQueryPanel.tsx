import React, { useState } from "react";
import styles from "../pages/styles/SecondPage.module.css";

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

const BeaconsQueryPanel = ({ selected }: { selected: FigmaNode | null }) => {
  // 입력값 상태
  const [prefix, setPrefix] = useState("BCN25");
  const [startCounter, setStartCounter] = useState(1);
  const [pklSeq, setPklSeq] = useState("");
  const [pkfSeq, setPkfSeq] = useState("");
  const [spgSeq, setSpgSeq] = useState("");
  const [bcnBattery, setBcnBattery] = useState(100);
  const [posFl, setPosFl] = useState("Y");
  const [bcnTp, setBcnTp] = useState("01");
  const [sptW, setSptW] = useState("64");
  const [sptH, setSptH] = useState("64");
  // 쿼리 결과 상태
  const [beaconQueries, setBeaconQueries] = useState<string[]>([]);
  const [spotQueries, setSpotQueries] = useState<string[]>([]);
  const [queried, setQueried] = useState(false);
  const [copied, setCopied] = useState(false);

  // 쿼리 생성 함수
  const makeBeaconQueries = (node: FigmaNode | null) => {
    if (!node || !node.children) return { beacon: [], spot: [] };
    const beaconsGroup = node.children.find(
      (child) => (child.type === "FRAME" || child.type === "GROUP") && child.name === "Beacons",
    );
    if (!beaconsGroup || !beaconsGroup.children) return { beacon: [], spot: [] };
    let counter = startCounter;
    const beacon: string[] = [];
    const spot: string[] = [];
    beaconsGroup.children.forEach((child) => {
      // id 파싱 (예: major-minor)
      const str = (child.id || "-").split("-");
      const number = String(counter).padStart(7, "0");
      const id = prefix + number;
      counter++;
      // beacon 쿼리
      const bcn_seq = id;
      const bcn_major = str[0];
      const bcn_minor = str[1];
      beacon.push(
        `INSERT INTO tb_svp_beacon VALUES ('${bcn_seq}','${pklSeq}','${pkfSeq}',NULL,NULL,'${bcn_major}','${bcn_minor}',NULL,NULL,'${bcnBattery}','${posFl}','${bcnTp}',NULL );`,
      );
      // spot 쿼리
      const ref_seq = id;
      const spt_tp = "BCN";
      const spt_st = "01";
      const spt_w = sptW;
      const spt_h = sptH;
      const spg_seq = spgSeq;
      // 중심점 계산
      const x = child.x ?? 0;
      const y = child.y ?? 0;
      spot.push(
        `INSERT INTO tb_msv_spot VALUES ('${ref_seq.replace(spt_tp, "SPT")}', '${spg_seq}', '${ref_seq}', '${spt_tp}', '${spt_st}', "${spt_w}", "${spt_h}", 0, GEOMFROMTEXT('POINT(${x} ${y})'),NULL ,NULL, now(), now());`,
      );
    });
    return { beacon, spot };
  };

  // 쿼리 추출 버튼 클릭 시 쿼리 생성
  const handleExtract = () => {
    if (!selected) return;
    const result = makeBeaconQueries(selected);
    setBeaconQueries(result.beacon);
    setSpotQueries(result.spot);
    setQueried(true);
  };

  // 복사 핸들러
  const handleCopy = (type: "beacon" | "spot" | "all") => {
    let text = "";
    if (type === "beacon") text = beaconQueries.join("\n");
    else if (type === "spot") text = spotQueries.join("\n");
    else text = [...beaconQueries, ...spotQueries].join("\n");
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div
        style={{
          background: "#23232A",
          borderRadius: 12,
          padding: 20,
          marginBottom: 18,
          boxShadow: "0 2px 8px 0 rgba(76,222,128,0.08)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <div style={{ minWidth: 120 }}>
            <label className={styles.inputLabel}>
              Prefix
              <input className={styles.inputBox} value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 100 }}>
            <label className={styles.inputLabel}>
              Start No.
              <input
                className={styles.inputBox}
                type="number"
                value={startCounter}
                min={1}
                onChange={(e) => setStartCounter(Number(e.target.value))}
              />
            </label>
          </div>
          <div style={{ minWidth: 180 }}>
            <label className={styles.inputLabel}>
              PKL_SEQ
              <input className={styles.inputBox} value={pklSeq} onChange={(e) => setPklSeq(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 180 }}>
            <label className={styles.inputLabel}>
              PKF_SEQ
              <input className={styles.inputBox} value={pkfSeq} onChange={(e) => setPkfSeq(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 180 }}>
            <label className={styles.inputLabel}>
              SPG_SEQ
              <input className={styles.inputBox} value={spgSeq} onChange={(e) => setSpgSeq(e.target.value)} />
            </label>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 16 }}>
          <div style={{ minWidth: 100 }}>
            <label className={styles.inputLabel}>
              배터리
              <input
                className={styles.inputBox}
                type="number"
                value={bcnBattery}
                onChange={(e) => setBcnBattery(Number(e.target.value))}
              />
            </label>
          </div>
          <div style={{ minWidth: 80 }}>
            <label className={styles.inputLabel}>
              POS_FL
              <input className={styles.inputBox} value={posFl} onChange={(e) => setPosFl(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 80 }}>
            <label className={styles.inputLabel}>
              BCN_TP
              <input className={styles.inputBox} value={bcnTp} onChange={(e) => setBcnTp(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 80 }}>
            <label className={styles.inputLabel}>
              SPOT W
              <input className={styles.inputBox} value={sptW} onChange={(e) => setSptW(e.target.value)} />
            </label>
          </div>
          <div style={{ minWidth: 80 }}>
            <label className={styles.inputLabel}>
              SPOT H
              <input className={styles.inputBox} value={sptH} onChange={(e) => setSptH(e.target.value)} />
            </label>
          </div>
        </div>
        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button className={styles.nextButton} onClick={handleExtract} style={{ fontSize: 15, padding: "8px 28px" }}>
            쿼리 추출
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: "#4ADE80", fontSize: 14 }}>
            {beaconQueries.length > 0
              ? `총 ${beaconQueries.length}개`
              : "Beacons 그룹/프레임의 자식 요소를 쿼리로 변환합니다."}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              className={styles.nextButton}
              onClick={() => handleCopy("beacon")}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 13 }}
            >
              비콘 쿼리 복사
            </button>
            <button
              className={styles.nextButton}
              onClick={() => handleCopy("spot")}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 13 }}
            >
              좌표 쿼리 복사
            </button>
            <button
              className={styles.nextButton}
              onClick={() => handleCopy("all")}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 13 }}
            >
              전체 복사
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
              {beaconQueries.length > 0
                ? [...beaconQueries, ...spotQueries].join("\n")
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

export default BeaconsQueryPanel;
