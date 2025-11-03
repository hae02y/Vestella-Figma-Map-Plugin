import React, { useState } from 'react';
import VerifiedIcon from '../pages/VerifiedIcon.js';
import styles from '../styles/SecondPage.module.css';
import { FigmaNode } from './SlotsQueryPanel.js';

interface RoutePathsQueryPanelProps {
  selected: FigmaNode | null;
  onFlash?: (ids: string[]) => void;
}

const RoutePathsQueryPanel = ({ selected, onFlash }: RoutePathsQueryPanelProps) => {
  // RoutePaths id 리스트 추출
  const getRoutePathsIds = () => {
    if (!selected || !selected.children) return [];
    const routePathsGroup = selected.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'RoutePaths',
    );
    if (!routePathsGroup || !routePathsGroup.children) return [];
    return routePathsGroup.children.map((child) => child.id);
  };

  // 입력값 상태
  const [_routePathSeqPrefix, setRoutePathSeqPrefix] = useState('RTP241230');
  const [_pklSeq, setPklSeq] = useState('');
  const [_pkfSeq, setPkfSeq] = useState('');
  const [maxRoutePathSeqQuery, setMaxRoutePathSeqQuery] = useState('');
  const [routePathQueries, setRoutePathQueries] = useState<string[]>([]);
  const [queried, setQueried] = useState(false);
  const [copied, setCopied] = useState(false);

  // 쿼리 생성 함수
  const makeRoutePathQueries = (node: FigmaNode | null) => {
    if (!node || !node.children) return [];
    const routePathsGroup = node.children.find(
      (child) => (child.type === 'FRAME' || child.type === 'GROUP') && child.name === 'RoutePaths',
    );
    if (!routePathsGroup || !routePathsGroup.children || routePathsGroup.children.length === 0) return [];
    return [
      `INSERT INTO tb_svp_route_path (rtp_seq, pkl_seq, pkf_seq, rtp_st, rtp_fl, rtp_st_updated)\n        SELECT CONCAT('${_routePathSeqPrefix}', LPAD(next_seq, 7, '0')), '${_pklSeq}', '${_pkfSeq}', 'NORM', 'AUTO', NOW()\n        FROM (${maxRoutePathSeqQuery}) AS temp;`,
    ];
  };

  // 쿼리 추출 버튼 클릭 시 쿼리 생성
  const handleExtract = () => {
    if (!selected) return;
    const result = makeRoutePathQueries(selected);
    setRoutePathQueries(result);
    setQueried(true);
  };

  // 복사 핸들러
  const handleCopy = () => {
    const text = routePathQueries.join('\n');
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
              htmlFor="routePathSeqPrefix"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              routePathSeqPrefix
              {_routePathSeqPrefix.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="routePathSeqPrefix"
              className={styles.inputBox}
              value={_routePathSeqPrefix}
              onChange={(e) => setRoutePathSeqPrefix(e.target.value)}
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
              pklSeq
              {_pklSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pklSeq"
              className={styles.inputBox}
              value={_pklSeq}
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
              pkfSeq
              {_pkfSeq.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="pkfSeq"
              className={styles.inputBox}
              value={_pkfSeq}
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
              htmlFor="maxRoutePathSeqQuery"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              maxRoutePathSeqQuery
              {maxRoutePathSeqQuery.trim() && <VerifiedIcon size={16} />}
            </label>
            <input
              id="maxRoutePathSeqQuery"
              className={styles.inputBox}
              value={maxRoutePathSeqQuery}
              onChange={(e) => setMaxRoutePathSeqQuery(e.target.value)}
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
            onClick={() => onFlash && onFlash(getRoutePathsIds())}
            disabled={getRoutePathsIds().length === 0}
          >
            ✨
          </button>
        </div>
      </div>
      {queried && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#4ADE80', fontSize: 14 }}>
            {routePathQueries.length > 0
              ? `Count: ${routePathQueries.length} EA`
              : 'RoutePaths 그룹/프레임의 자식 요소를 쿼리로 변환합니다.'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={styles.copyButton}
              onClick={handleCopy}
              disabled={routePathQueries.length === 0}
              style={{ fontSize: 11 }}
            >
              RoutePaths Copy
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
              {routePathQueries.length > 0 ? routePathQueries.join('\n') : '-- 여기에 쿼리가 표시됩니다.'}
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

export default RoutePathsQueryPanel;
