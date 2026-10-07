import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import ArrangementLine, { LINE_STYLE_PAIRS, SEGMENT_PRESETS } from './ArrangementLine';

export default function ArrangementCellModal({
  isOpen,
  block,
  inst,
  arrData,
  color = '#60a5fa',
  onSave,
  onClose
}) {
  if (!isOpen) return null;

  const [style, setStyle] = useState(arrData?.lineStyle || 'empty');
  const [segmentMode, setSegmentMode] = useState(arrData?.segmentMode || 'full');
  const [commentStart, setCommentStart] = useState(arrData?.commentStart || '');
  const [commentMid, setCommentMid] = useState(arrData?.commentMid || arrData?.comment || '');
  const [commentEnd, setCommentEnd] = useState(arrData?.commentEnd || '');
  const [commentAccent, setCommentAccent] = useState(Boolean(arrData?.commentAccent));

  useEffect(() => {
    setStyle(arrData?.lineStyle || 'empty');
    setSegmentMode(arrData?.segmentMode || 'full');
    setCommentStart(arrData?.commentStart || '');
    setCommentMid(arrData?.commentMid || arrData?.comment || '');
    setCommentEnd(arrData?.commentEnd || '');
    setCommentAccent(Boolean(arrData?.commentAccent));
  }, [arrData, isOpen]);

  const handleApply = () => {
    onSave({
      ...arrData,
      lineStyle: style,
      segmentMode,
      commentStart,
      commentMid,
      comment: commentMid, // backward compatibility
      commentEnd,
      commentAccent
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
              Nastavení stopy: <span style={{ color }}>{inst}</span>
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Část: <strong>{block?.type || 'Sloka'}</strong>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} title="Zavřít">
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Line Style Visual Matrix */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Typ čáry (tenká nahoře / tlustá dole)
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Vybráno: <strong>{style === 'empty' ? 'Žádná' : style}</strong>
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            background: 'rgba(15, 23, 42, 0.45)', 
            padding: '0.75rem', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto'
          }}>
            {/* Column 0: None / Empty line */}
            <button
              type="button"
              onClick={() => setStyle('empty')}
              title="Žádná čára (pauza)"
              style={{
                width: '56px',
                minWidth: '56px',
                height: '136px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: style === 'empty' ? '2px solid var(--primary-color)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: style === 'empty' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                boxShadow: style === 'empty' ? '0 0 12px rgba(59, 130, 246, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '24px', height: '100px', position: 'relative' }}>
                <ArrangementLine style="empty" color={color} />
              </div>
            </button>

            {/* Matrix of Columns: Row 1 = Thin / Crescendo, Row 2 = Thick / Decrescendo */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {LINE_STYLE_PAIRS.map(pair => {
                const isThinSelected = style === pair.thin.key;
                const isThickSelected = style === pair.thick.key;

                return (
                  <div key={pair.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Thin / Crescendo Button */}
                    <button
                      type="button"
                      onClick={() => setStyle(pair.thin.key)}
                      title={pair.thin.label}
                      style={{
                        width: '56px',
                        minWidth: '56px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        border: isThinSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isThinSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                        boxShadow: isThinSelected ? '0 0 10px rgba(59, 130, 246, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ width: '24px', height: '48px', position: 'relative' }}>
                        <ArrangementLine style={pair.thin.key} color={color} />
                      </div>
                    </button>

                    {/* Thick / Decrescendo Button */}
                    <button
                      type="button"
                      onClick={() => setStyle(pair.thick.key)}
                      title={pair.thick.label}
                      style={{
                        width: '56px',
                        minWidth: '56px',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        border: isThickSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isThickSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                        boxShadow: isThickSelected ? '0 0 10px rgba(59, 130, 246, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ width: '24px', height: '48px', position: 'relative' }}>
                        <ArrangementLine style={pair.thick.key} color={color} />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Quarter Dots & Segments (Vizuální náhledy) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Puntíky a úseky čáry (v 1/4 a 3/4)
            </label>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              {SEGMENT_PRESETS.find(p => p.key === segmentMode)?.label}
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '0.5rem', 
            background: 'rgba(15, 23, 42, 0.45)', 
            padding: '0.75rem', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            {SEGMENT_PRESETS.map(preset => {
              const isSelected = segmentMode === preset.key;
              const displayStyle = style === 'empty' ? 'solid' : style;

              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setSegmentMode(preset.key)}
                  title={`${preset.label} – ${preset.desc}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '76px',
                    padding: '0.4rem 0.25rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.5)',
                    boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.35)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: '24px', height: '62px', position: 'relative' }}>
                    <ArrangementLine style={displayStyle} segmentMode={preset.key} color={color} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Comments (3 Positions: Start, Mid, End) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Poznámky (rozložené v horní, střední a dolní části)
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.78rem', color: commentAccent ? '#fbbf24' : 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={commentAccent} 
                onChange={e => setCommentAccent(e.target.checked)} 
              />
              <Sparkles size={13} /> Zlatý štítek (výrazně)
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                Začátek (horní část):
              </span>
              <input 
                className="edit-input" 
                value={commentStart} 
                onChange={e => setCommentStart(e.target.value)} 
                placeholder="např. Nástup, Sólo..."
                style={{ margin: 0, fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                Střed (střední část):
              </span>
              <input 
                className="edit-input" 
                value={commentMid} 
                onChange={e => setCommentMid(e.target.value)} 
                placeholder="např. Rytmika, 4/4..."
                style={{ margin: 0, fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                Konec (dolní část):
              </span>
              <input 
                className="edit-input" 
                value={commentEnd} 
                onChange={e => setCommentEnd(e.target.value)} 
                placeholder="např. Break, Stop..."
                style={{ margin: 0, fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Zrušit
          </button>
          <button className="btn btn-primary" onClick={handleApply}>
            <Check size={16} /> Uložit a zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
