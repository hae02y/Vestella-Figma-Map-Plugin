import React, { useState } from 'react';
import VerifiedIcon from '../pages/VerifiedIcon.js';
import styles from '../styles/SecondPage.module.css';
import { centerFrom } from '../utils/calculate.js';

// FigmaNode 타입 재사용
export type FigmaNode = {
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

interface SlotsQueryPanelProps {
  selected: FigmaNode | null;
  onFlash?: (ids: string[]) => void;
}

const todayPrefix = (() => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
})();

const SlotsQueryPanel = ({ selected, onFlash }: SlotsQueryPanelProps) => {
  // 슬롯 id 리스트 추출
  const getSlotIds = () => {
    if (!selected || !selected.children) return [];
    const slotsGroup = selected.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'Slots',
    );
    if (!slotsGroup || !slotsGroup.children) return [];
    return slotsGroup.children.map((child) => child.id);
  };

  // 입력값 상태
  // 실제 요구에 맞는 입력값 구조
  const [prefix, setPrefix] = useState(`PKS${todayPrefix}`);
  const [startCounter, setStartCounter] = useState(1);
  const [pklSeq, setPklSeq] = useState(`PKL${todayPrefix}`);
  const [pkfSeq, setPkfSeq] = useState(`PKF${todayPrefix}`);
  const [spgSeq, setSpgSeq] = useState(`SPG${todayPrefix}`);
  // 쿼리 결과 상태
  const [slotQueries, setSlotQueries] = useState<string[]>([]);
  const [spotQueries, setSpotQueries] = useState<string[]>([]);
  const [queried, setQueried] = useState(false);
  const [copied, setCopied] = useState(false);

  // 쿼리 생성 함수 (주차 슬롯/스팟)
  const makeSlotQueries = (node: FigmaNode | null) => {
    if (!node || !node.children) return { slot: [], spot: [] };
    const slotsGroup = node.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'Slots',
    );
    if (!slotsGroup || !slotsGroup.children) return { slot: [], spot: [] };
    let counter = startCounter;
    const slot: string[] = [];
    const spot: string[] = [];
    slotsGroup.children.forEach((child) => {
      const number = String(counter).padStart(7, '0');
      const id = prefix + number;
      counter++;
      // tb_svp_parking_slot 쿼리 (DB 스키마 순서/타입/NULL 반영)
      slot.push(
        `INSERT INTO tb_svp_parking_slot (pks_seq, pkl_seq, pkf_seq, pkg_seq, pks_nm, pks_ext_cd1, pks_ext_cd2, pks_tp, pks_st, pks_fl, pks_theme, pks_car_num, pks_st_updated) VALUES ('${id}', '${pklSeq}', '${pkfSeq}', NULL, NULL, NULL, NULL, '01', 'NORM', 'AUTO', NULL, NULL, NOW());`,
      );
      // tb_msv_spot 쿼리 (비콘과 동일)
      const width = child.width ?? 0;
      const height = child.height ?? 0;
      const centerX = (child.x ?? 0) + width / 2;
      const centerY = (child.y ?? 0) + height / 2;

      const { cx, cy, w, h } = centerFrom(child as SceneNode);
      spot.push(
        `INSERT INTO tb_msv_spot (spt_seq, spg_seq, ref_seq, spt_tp, spt_st, spt_w, spt_h, spt_rt, spt_pt, spt_ph, spt_pg, created, updated) VALUES ('${id.replace('PKS', 'SPT')}', '${spgSeq || pkfSeq}', '${id}', 'SLT', '01', ${w}, ${h}, 0, GEOMFROMTEXT('POINT(${cx} ${cy})'), NULL, NULL, NOW(), NOW());`,
      );
    });
    return { slot, spot };
  };

  // 쿼리 추출 버튼 클릭 시 쿼리 생성
  const handleExtract = () => {
    if (!selected) return;
    const result = makeSlotQueries(selected);
    setSlotQueries(result.slot);
    setSpotQueries(result.spot);
    setQueried(true);
  };

  // 복사 핸들러
  const handleCopy = (type: 'slot' | 'spot' | 'all') => {
    let text = '';
    if (type === 'slot') text = slotQueries.join('\n');
    else if (type === 'spot') text = spotQueries.join('\n');
    else text = [...slotQueries, ...spotQueries].join('\n');
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
              PKL_SEQ
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
              PKF_SEQ
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
              SPG_SEQ
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
              const ids = getSlotIds();
              if (onFlash) onFlash(ids);
            }}
            disabled={getSlotIds().length === 0}
          >
            ✨
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#4ADE80', fontSize: 14 }}>
            {slotQueries.length > 0
              ? `Count: ${slotQueries.length} EA`
              : 'Slots 그룹/프레임의 자식 요소를 쿼리로 변환합니다.'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('slot')}
              disabled={slotQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Slot Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('spot')}
              disabled={spotQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              Spot Copy
            </button>
            <button
              className={styles.copyButton}
              onClick={() => handleCopy('all')}
              disabled={slotQueries.length === 0 && spotQueries.length === 0}
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
              {slotQueries.length > 0 || spotQueries.length > 0
                ? [...slotQueries, ...spotQueries].join('\n')
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

export default SlotsQueryPanel;
