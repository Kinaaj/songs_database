import { Plus } from 'lucide-react';

export default function ArrangementView({ blocks, instruments = [], isEditing, onAddInstrument, onChangeBlock }) {
  
  const lineStyles = ['empty', 'solid', 'dashed', 'dotted'];
  
  const cycleLineStyle = (current) => {
    const idx = lineStyles.indexOf(current);
    return lineStyles[(idx + 1) % lineStyles.length];
  };

  const handleCellClick = (blockIndex, block, inst) => {
    if (!isEditing) return;
    const current = block.arrangement?.[inst]?.lineStyle || 'empty';
    const nextStyle = cycleLineStyle(current);
    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: {
          ...(block.arrangement?.[inst] || {}),
          lineStyle: nextStyle
        }
      }
    };
    onChangeBlock(blockIndex, newBlock);
  };

  const handleCommentChange = (blockIndex, block, inst, newComment) => {
    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: {
          ...(block.arrangement?.[inst] || {}),
          comment: newComment
        }
      }
    };
    onChangeBlock(blockIndex, newBlock);
  };

  if (instruments.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        border: '1px dashed var(--border-color)', 
        borderRadius: '12px',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Zatím zde nejsou žádné nástroje pro tuto složku.</p>
        {isEditing ? (
          <button className="btn btn-outline" onClick={onAddInstrument}>
            <Plus size={16} /> Přidat první nástroj
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem' }}>Přepněte do režimu "Upravit" pro přidání nástrojů.</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hlavička nástrojů - zarovnaná nahoru */}
      <div className="arr-header-row">
        {instruments.map(inst => (
          <div key={inst} className="arr-instrument-header">{inst}</div>
        ))}
        {isEditing && (
          <button className="btn btn-icon" onClick={onAddInstrument} style={{ marginLeft: '0.5rem' }} title="Přidat další nástroj">
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Řádky aranžmá pro každý blok písně */}
      {blocks.map((block, i) => (
        <div key={block.id || i} className="arr-block-row">
          {instruments.map(inst => {
            const arr = block.arrangement?.[inst] || { lineStyle: 'empty', comment: '' };
            return (
              <div 
                key={inst} 
                className="arr-cell"
                onClick={() => handleCellClick(i, block, inst)}
                title={isEditing ? 'Kliknutím změníš čáru (plná / čárkovaná / tečkovaná / prázdná)' : ''}
              >
                {/* Čára probíhající přes celý blok */}
                <div className="arr-line-wrapper">
                  <div className={`arr-line ${arr.lineStyle}`}></div>
                </div>
                
                {arr.comment && !isEditing && (
                  <div className="arr-comment">{arr.comment}</div>
                )}
                
                {isEditing && (
                  <div style={{ position: 'relative', zIndex: 10 }} onClick={e => e.stopPropagation()}>
                    <input 
                      className="edit-input" 
                      style={{ fontSize: '0.75rem', padding: '3px 6px', width: '75px', textAlign: 'center', margin: 0 }}
                      value={arr.comment || ''}
                      onChange={e => handleCommentChange(i, block, inst, e.target.value)}
                      placeholder="Poznámka"
                    />
                  </div>
                )}
              </div>
            );
          })}
          {isEditing && <div style={{ width: '34px', marginLeft: '0.5rem' }}></div>}
        </div>
      ))}
    </div>
  );
}
