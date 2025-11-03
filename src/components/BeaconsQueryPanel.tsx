// SVG 도면 내부 상대 중심점 좌표 계산 (부모(층) 기준 0,0 ~ width,height 범위)
function getRelativeCenter(node: FigmaNode): { x: number; y: number } {
  return {
    x: (node.x ?? 0) + (node.width ?? 0) / 2,
    y: (node.y ?? 0) + (node.height ?? 0) / 2,
  };
}
import React, { useState } from 'react';
import VerifiedIcon from '../pages/VerifiedIcon.js';
import styles from '../styles/SecondPage.module.css';

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

interface BeaconsQueryPanelProps {
  selected: FigmaNode | null;
  onFlash?: (ids: string[]) => void;
}

const BeaconsQueryPanel = ({ selected, onFlash }: BeaconsQueryPanelProps) => {
  // 비콘 id 리스트 추출
  const getBeaconIds = () => {
    if (!selected || !selected.children) return [];
    const beaconsGroup = selected.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'Beacons',
    );
    if (!beaconsGroup || !beaconsGroup.children) return [];
    return beaconsGroup.children.map((child) => child.id);
  };

  // 오늘 날짜 기반 prefix (예: BCN250925)
  const today = (() => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  })();
  // 비콘데이터 입력값 상태
  const [prefix, setPrefix] = useState(`BCN${today}`);
  const [startCounter, setStartCounter] = useState(1);
  const [pklSeq, setPklSeq] = useState(`PKL${today}`);
  const [pkfSeq, setPkfSeq] = useState(`PKF${today}`);
  const [spgSeq, setSpgSeq] = useState(`SPG${today}`);
  const [bcnBattery, setBcnBattery] = useState(100);
  const [posFl, setPosFl] = useState('Y');
  const [bcnTp, setBcnTp] = useState('01');
  const [sptW, setSptW] = useState('64');
  const [sptH, setSptH] = useState('64');
  // 쿼리 결과 상태
  const [beaconQueries, setBeaconQueries] = useState<string[]>([]);
  const [spotQueries, setSpotQueries] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [queried, setQueried] = useState(false);

  // 쿼리 생성 함수: 컴포넌트 외부로 이동
  function makeBeaconQueries(
    node: FigmaNode | null,
    prefix: string,
    startCounter: number,
    pklSeq: string,
    pkfSeq: string,
    spgSeq: string,
    bcnBattery: number,
    posFl: string,
    bcnTp: string,
    sptW: string,
    sptH: string,
  ): { beacon: string[]; spot: string[] } {
    if (!node || !node.children) return { beacon: [], spot: [] };
    const beaconsGroup = node.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'Beacons',
    );
    if (!beaconsGroup || !beaconsGroup.children) return { beacon: [], spot: [] };
    let counter = startCounter;
    const beacon: string[] = [];
    const spot: string[] = [];
    // 최상단 부모(층) 기준
    const topParent = node;
    beaconsGroup.children.forEach((child) => {
      // id 파싱 (예: major-minor)
      const str = child.name.split(' ');
      const number = String(counter).padStart(7, '0');
      const id = prefix + number;
      counter++;
      // beacon 쿼리
      const bcn_seq = id;
      const bcn_major = str[1];
      const bcn_minor = str[2];
      beacon.push(
        `INSERT INTO tb_svp_beacon (bcn_seq, pkl_seq, pkf_seq, bcn_nm, bcn_ext_cd, bcn_major, bcn_minor, bcn_mac, bcn_uuid, bcn_battery, pos_fl, bcn_tp, bcn_st_updated) VALUES ('${bcn_seq}', '${pklSeq}', '${pkfSeq}', NULL, NULL, '${bcn_major}', '${bcn_minor}', NULL, NULL, ${bcnBattery}, '${posFl}', '${bcnTp}', NOW());`,
      );
      // spot 쿼리 (스키마 순서, 타입 맞춤)
      const ref_seq = id;
      const spt_tp = 'BCN';
      const spt_st = '01';
      const spt_w = Number(sptW);
      const spt_h = Number(sptH);
      const spg_seq = spgSeq;
      const spt_rt = 0;
      // 중심점 계산 (SVG 내부 상대좌표)
      const { x: cx, y: cy } = getRelativeCenter(child);
      spot.push(
        `INSERT INTO tb_msv_spot (spt_seq, spg_seq, ref_seq, spt_tp, spt_st, spt_w, spt_h, spt_rt, spt_pt, spt_ph, spt_pg, created, updated) VALUES (fn_sys_sequence('SPT'), '${spg_seq}', '${ref_seq}', '${spt_tp}', '${spt_st}', ${spt_w}, ${spt_h}, ${spt_rt}, GEOMFROMTEXT('POINT(${cx} ${cy})'), NULL, NULL, NOW(), NOW());`,
      );
    });
    return { beacon, spot };
  }
  // 복사 핸들러
  // Query 버튼 클릭 시 쿼리 생성
  const handleExtract = () => {
    const result = makeBeaconQueries(
      selected,
      prefix,
      startCounter,
      pklSeq,
      pkfSeq,
      spgSeq,
      bcnBattery,
      posFl,
      bcnTp,
      sptW,
      sptH,
    );
    setBeaconQueries(result.beacon);
    setSpotQueries(result.spot);
    setQueried(true);
  };

  const handleCopy = (type: 'beacon' | 'spot' | 'all') => {
    let text = '';
    if (type === 'beacon') text = beaconQueries.join('\n');
    else if (type === 'spot') text = spotQueries.join('\n');
    else text = [...beaconQueries, ...spotQueries].join('\n');
    if (!text) return;
    const tryClipboard = async () => {
      try {
        setCopied(true);
        await navigator.clipboard.writeText(text);
        setTimeout(() => setCopied(false), 1200);
        return;
      } catch (e) {
        // fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch (err) {
          alert('복사에 실패했습니다. 브라우저 권한을 확인하세요.');
        }
        document.body.removeChild(textarea);
      }
    };
    tryClipboard();
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div
        style={{
          background: '#23232A',
          borderRadius: 12,
          padding: '18px 10px 12px 10px',
          marginBottom: 14,
          boxShadow: '0 2px 8px 0 rgba(76,222,128,0.08)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px 12px',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="prefix"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Prefix
              {prefix.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="prefix"
              className={styles.inputBox}
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="startCounter"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
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
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="pklSeq"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              PKL Code.
              {pklSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pklSeq"
              className={styles.inputBox}
              value={pklSeq}
              onChange={(e) => setPklSeq(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="pkfSeq"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              PKF Code.
              {pkfSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pkfSeq"
              className={styles.inputBox}
              value={pkfSeq}
              onChange={(e) => setPkfSeq(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="spgSeq"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              SPG Code.
              {spgSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="spgSeq"
              className={styles.inputBox}
              value={spgSeq}
              onChange={(e) => setSpgSeq(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px 12px',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="bcnBattery"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              배터리
              {bcnBattery > 0 && <VerifiedIcon size={16} />}
            </label>
            <input
              id="bcnBattery"
              className={styles.inputBox}
              type="number"
              value={bcnBattery}
              onChange={(e) => setBcnBattery(Number(e.target.value))}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="posFl"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              POS_FL
              {posFl.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="posFl"
              className={styles.inputBox}
              value={posFl}
              onChange={(e) => setPosFl(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="bcnTp"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              BCN_TP
              {bcnTp.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="bcnTp"
              className={styles.inputBox}
              value={bcnTp}
              onChange={(e) => setBcnTp(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="sptW"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              SPOT W{sptW.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="sptW"
              className={styles.inputBox}
              value={sptW}
              onChange={(e) => setSptW(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
          <div
            style={{
              background: '#23232A',
              borderRadius: 8,
              padding: '7px 8px',
              boxShadow: '0 1px 2px 0 rgba(76,222,128,0.05)',
              maxWidth: 180,
              margin: '0 auto',
            }}
          >
            <label
              className={styles.inputLabel}
              htmlFor="sptH"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              SPOT H{sptH.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="sptH"
              className={styles.inputBox}
              value={sptH}
              onChange={(e) => setSptH(e.target.value)}
              style={{ minWidth: 0, width: '100%', maxWidth: 110, height: 28, fontSize: 13, padding: '2px 8px' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 18, textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className={styles.nextButton} onClick={handleExtract} style={{ fontSize: 15, padding: '8px 28px' }}>
            Query
          </button>
          <button
            className={styles.nextButton}
            style={{
              fontSize: 15,
              padding: '8px 18px',
              background: '#23232A',
              color: '#4ADE80',
              border: '1px solid #4ADE80',
            }}
            onClick={() => {
              const ids = getBeaconIds();
              if (onFlash) onFlash(ids);
            }}
            disabled={getBeaconIds().length === 0}
          >
            ✨
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#4ADE80', fontSize: 14 }}>
            {beaconQueries.length > 0
              ? `Count: ${beaconQueries.length} EA`
              : 'Beacons 그룹/프레임의 자식 요소를 쿼리로 변환합니다.'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('beacon')}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Beacon Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('spot')}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Geo Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('all')}
              disabled={beaconQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              All Copy
            </button>
          </div>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <pre
              style={{
                background: '#18181B',
                color: '#fff',
                borderRadius: 10,
                padding: '18px 16px 16px 16px',
                fontSize: 13,
                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                minHeight: 80,
                margin: 0,
                overflowX: 'auto',
                position: 'relative',
              }}
            >
              {beaconQueries.length > 0
                ? [...beaconQueries, ...spotQueries].join('\n')
                : '-- 여기에 쿼리가 표시됩니다.'}
            </pre>
            {copied && (
              <div
                style={{
                  position: 'absolute',
                  top: -28,
                  right: 10,
                  background: '#23232A',
                  color: '#4ADE80',
                  borderRadius: 6,
                  fontSize: 12,
                  padding: '4px 12px',
                  boxShadow: '0 2px 8px 0 rgba(76,222,128,0.15)',
                  opacity: 0.95,
                  pointerEvents: 'none',
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
