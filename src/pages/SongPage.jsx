import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  getSong, 
  saveSong, 
  getAllSongsWithFolders 
} from '../data/songsLoader';
import { 
  ArrowLeft, 
  Edit2, 
  Check, 
  Plus, 
  Trash2,
  FileText,
  Music,
  SlidersHorizontal,
  Copy
} from 'lucide-react';
import LyricsView from '../components/LyricsView';
import ArrangementLine from '../components/ArrangementLine';
import ArrangementCellModal from '../components/ArrangementCellModal';
import { getBlockColorClass, INSTRUMENT_COLORS, getInstrumentColor } from '../utils/songConstants';

export default function SongPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const folderParam = searchParams.get('folder');

  const [song, setSong] = useState(null);
  const [activeFolder, setActiveFolder] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeCellModal, setActiveCellModal] = useState(null);
  const [activeColorPickerInst, setActiveColorPickerInst] = useState(null);
  
  // 3 independent toggles
  const [showLyrics, setShowLyrics] = useState(true);
  const [showChords, setShowChords] = useState(true);
  const [showInstruments, setShowInstruments] = useState(true);

  // Load song
  useEffect(() => {
    const all = getAllSongsWithFolders();
    const matchingVersions = all.filter(item => item.song.id === id);

    if (matchingVersions.length === 0) {
      setSong(null);
      return;
    }

    let currentItem = matchingVersions.find(item => item.folder === folderParam);
    if (!currentItem) {
      currentItem = matchingVersions[0];
      setSearchParams({ folder: currentItem.folder }, { replace: true });
    }

    setSong(JSON.parse(JSON.stringify(currentItem.song)));
    setActiveFolder(currentItem.folder);
  }, [id, folderParam]);

  if (!song) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Píseň nenalezena</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
          Skladba s ID <code>{id}</code> nebyla nalezena.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={18} /> Zpět na hlavní stránku
        </Link>
      </div>
    );
  }

  // Get instruments for this song version
  const instruments = Array.from(
    new Set((song.blocks || []).flatMap(b => Object.keys(b.arrangement || {})))
  );

  // Line style cycle
  const lineStyles = ['empty', 'solid', 'dashed', 'dotted'];
  const cycleLineStyle = (current) => {
    const idx = lineStyles.indexOf(current);
    return lineStyles[(idx + 1) % lineStyles.length];
  };

  // Save changes
  const handleSave = (updated) => {
    setSong(updated);
    saveSong(activeFolder, updated);
  };

  // Block updates
  const handleUpdateBlock = (blockIndex, newBlock) => {
    const newBlocks = [...(song.blocks || [])];
    newBlocks[blockIndex] = newBlock;
    handleSave({ ...song, blocks: newBlocks });
  };

  const handleDeleteBlock = (blockIndex) => {
    if (song.blocks.length <= 1) {
      alert('Píseň musí mít alespoň jednu část.');
      return;
    }
    const newBlocks = song.blocks.filter((_, i) => i !== blockIndex);
    handleSave({ ...song, blocks: newBlocks });
  };

  const handleAddBlock = (kind = 'verse') => {
    let typeName = 'Sloka 1';
    let colorKey = 'gray';

    if (kind === 'chorus') {
      typeName = 'Refrén';
      colorKey = 'yellow';
    } else if (kind === 'bridge') {
      typeName = 'Bridge';
      colorKey = 'blue';
    } else {
      // Verse
      const verseCount = (song.blocks || []).filter(b => {
        const t = (b.type || '').toLowerCase();
        return t.includes('sloka') || t.includes('verse');
      }).length;
      typeName = `Sloka ${verseCount + 1}`;
      colorKey = 'gray';
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      type: typeName,
      color: colorKey,
      lyrics: '',
      chords: '',
      arrangement: {}
    };
    instruments.forEach(inst => {
      newBlock.arrangement[inst] = { lineStyle: 'empty', comment: '' };
    });
    handleSave({ ...song, blocks: [...(song.blocks || []), newBlock] });
  };

  const handleAddInstrument = () => {
    const instName = prompt('Zadejte jméno nástroje nebo člena kapely:');
    if (!instName || instruments.includes(instName)) return;

    const newBlocks = (song.blocks || []).map(b => ({
      ...b,
      arrangement: {
        ...(b.arrangement || {}),
        [instName]: { lineStyle: 'empty', comment: '' }
      }
    }));
    handleSave({ ...song, blocks: newBlocks });
  };

  const BASIC_CYCLE = ['empty', 'solid', 'dashed', 'dotted'];

  const handleCellQuickCycle = (blockIndex, block, inst) => {
    if (!isEditing) return;
    const arr = block.arrangement?.[inst] || { lineStyle: 'empty', comment: '' };
    const currentIndex = BASIC_CYCLE.indexOf(arr.lineStyle);
    const nextStyle = currentIndex === -1 ? 'solid' : BASIC_CYCLE[(currentIndex + 1) % BASIC_CYCLE.length];

    const updatedArr = {
      ...arr,
      lineStyle: nextStyle
    };
    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: updatedArr
      }
    };
    handleUpdateBlock(blockIndex, newBlock);
  };

  const handleCellCommentChange = (blockIndex, block, inst, text) => {
    const arr = block.arrangement?.[inst] || { lineStyle: 'empty', comment: '' };
    const updatedArr = {
      ...arr,
      commentMid: text,
      comment: text
    };
    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: updatedArr
      }
    };
    handleUpdateBlock(blockIndex, newBlock);
  };

  const handleCopyFromPrevious = (blockIndex, block, inst) => {
    if (!isEditing || blockIndex <= 0) return;
    const prevBlock = song?.blocks?.[blockIndex - 1];
    if (!prevBlock) return;
    const prevArr = prevBlock.arrangement?.[inst] || { lineStyle: 'empty' };
    const currentArr = block.arrangement?.[inst] || {};

    const updatedArr = {
      ...currentArr,
      lineStyle: prevArr.lineStyle || 'empty',
      segmentMode: prevArr.segmentMode || 'full',
      dotStart: Boolean(prevArr.dotStart),
      dotEnd: Boolean(prevArr.dotEnd)
      // Comments are preserved as requested (not copied)
    };

    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: updatedArr
      }
    };
    handleUpdateBlock(blockIndex, newBlock);
  };

  const handleSetInstrumentColor = (instName, colorHex) => {
    const updatedColors = {
      ...(song.instrumentColors || {}),
      [instName]: colorHex
    };
    handleSave({ ...song, instrumentColors: updatedColors });
    setActiveColorPickerInst(null);
  };

  const openCellModal = (blockIndex, block, inst) => {
    if (!isEditing) return;
    const arr = block.arrangement?.[inst] || { lineStyle: 'empty', comment: '' };
    setActiveCellModal({ blockIndex, block, inst, arrData: arr });
  };

  const handleModalSave = (updatedArrData) => {
    if (!activeCellModal) return;
    const { blockIndex, block, inst } = activeCellModal;
    const newBlock = {
      ...block,
      arrangement: {
        ...(block.arrangement || {}),
        [inst]: updatedArrData
      }
    };
    handleUpdateBlock(blockIndex, newBlock);
    setActiveCellModal(null);
  };

  const isInstrumentsOnly = !showLyrics && !showChords && showInstruments;

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link 
          to={activeFolder ? `/folder/${encodeURIComponent(activeFolder)}` : "/"} 
          className="btn btn-outline" 
          style={{ gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> {activeFolder ? `Zpět do ${activeFolder}` : 'Zpět do zpěvníku'}
        </Link>

        {/* Right side: Key indicator, View toggles & Edit button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Key indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'rgba(15, 23, 42, 0.6)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            padding: '0.35rem 0.75rem' 
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tónina:</span>
            {isEditing ? (
              <input 
                className="edit-input" 
                style={{ width: '80px', padding: '0.2rem 0.4rem', margin: 0, fontSize: '0.85rem' }}
                value={song.key || ''}
                onChange={e => handleSave({ ...song, key: e.target.value })}
                placeholder="např. D dur"
              />
            ) : (
              <span className="badge-key" style={{ margin: 0 }}>{song.key || 'Neurčeno'}</span>
            )}
          </div>

          {/* Independent View Toggles */}
          <div className="view-toggle-group">
            <button 
              className={`toggle-chip ${showLyrics ? 'active' : ''}`}
              onClick={() => setShowLyrics(prev => !prev)}
              title="Zobrazit / skrýt text písně"
            >
              <FileText size={14} /> Text
            </button>
            <button 
              className={`toggle-chip ${showChords ? 'active' : ''}`}
              onClick={() => setShowChords(prev => !prev)}
              title="Zobrazit / skrýt akordy"
            >
              <Music size={14} /> Akordy
            </button>
            <button 
              className={`toggle-chip ${showInstruments ? 'active' : ''}`}
              onClick={() => setShowInstruments(prev => !prev)}
              title="Zobrazit / skrýt nástroje a linky aranžmá"
            >
              <SlidersHorizontal size={14} /> Nástroje
            </button>
          </div>

          {/* Edit button */}
          <button 
            className={`btn ${isEditing ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <><Check size={18} /> Hotovo</> : <><Edit2 size={18} /> Upravit</>}
          </button>
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Top Header Row: Title on Left + Instruments on Right */}
        <div className={`song-top-grid ${isInstrumentsOnly ? 'instruments-only' : ''}`} style={{ marginBottom: isInstrumentsOnly ? '1.5rem' : '2.5rem' }}>
          {/* Left: Song Title & Author */}
          <div className="song-title-col">
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px' }}>
                <input 
                  className="edit-input" 
                  style={{ fontSize: '2rem', fontWeight: '800' }}
                  value={song.title}
                  onChange={e => handleSave({ ...song, title: e.target.value })}
                  placeholder="Název písně"
                />
                <input 
                  className="edit-input" 
                  style={{ fontSize: '1.1rem' }}
                  value={song.author}
                  onChange={e => handleSave({ ...song, author: e.target.value })}
                  placeholder="Autor / Interpret"
                />
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: '2.6rem', fontWeight: '800', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                  {song.title}
                </h1>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1.15rem' }}>
                  {song.author}
                </div>
              </div>
            )}
          </div>

          {/* Right: Instrument Headers */}
          {showInstruments && (
            <div className={`song-instruments-col ${isInstrumentsOnly ? 'instruments-only' : ''}`}>
              <div className="arr-header-row" style={{ margin: 0 }}>
                {isInstrumentsOnly && (
                  <div className="arr-spine-header-spacer" />
                )}
                {instruments.map(inst => {
                  const instColor = getInstrumentColor(song, inst);
                  return (
                    <div key={inst} className="arr-instrument-header" style={{ color: instColor }}>
                      <div className="arr-instrument-title-row">
                        <span className="arr-instrument-name">{inst}</span>
                        {isEditing && (
                          <div className="inst-color-picker-wrapper">
                            <button 
                              type="button"
                              className="inst-color-dot-btn"
                              style={{ backgroundColor: instColor }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColorPickerInst(activeColorPickerInst === inst ? null : inst);
                              }}
                              title={`Změnit barvu nástroje a stop (${inst})`}
                            />
                            {activeColorPickerInst === inst && (
                              <div className="inst-color-palette" onClick={e => e.stopPropagation()}>
                                {INSTRUMENT_COLORS.map(c => (
                                  <button
                                    key={c.key}
                                    type="button"
                                    className={`inst-color-palette-item ${instColor === c.color ? 'selected' : ''}`}
                                    style={{ backgroundColor: c.color }}
                                    onClick={() => handleSetInstrumentColor(inst, c.color)}
                                    title={c.label}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isEditing && (
                  <button className="btn btn-icon" onClick={handleAddInstrument} style={{ marginLeft: '0.5rem' }} title="Přidat další nástroj">
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty State when all 3 toggles are OFF */}
        {!showLyrics && !showChords && !showInstruments && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f1f5f9', fontWeight: 600 }}>Všechna zobrazení jsou vypnuta</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pro zobrazení obsahu zapněte nahoře <strong>Text</strong>, <strong>Akordy</strong> nebo <strong>Nástroje</strong>.</p>
          </div>
        )}

        {/* Synchronous Block Rows */}
        {(showLyrics || showChords || showInstruments) && (
          <div className={`song-blocks-container ${isInstrumentsOnly ? 'instruments-only' : ''} ${isEditing ? 'is-editing' : ''}`}>
            {(song.blocks || []).map((block, i) => (
              <div key={block.id || i} className={`song-block-row ${isInstrumentsOnly ? 'instruments-only' : ''} ${isEditing ? 'is-editing' : ''}`}>
                {/* When NOT instruments-only, we show the lyrics/chords column */}
                {!isInstrumentsOnly && (
                  <div className={`block-lyrics-side ${!showInstruments ? 'full-width' : ''} ${isEditing ? 'is-editing' : ''}`}>
                    {isEditing && (
                      <button 
                        className="btn-icon delete-block-btn" 
                        onClick={() => handleDeleteBlock(i)}
                        title="Smazat tuto část"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <LyricsView 
                      block={block} 
                      isEditing={isEditing}
                      showLyrics={showLyrics}
                      showChords={showChords}
                      onChange={(newBlock) => handleUpdateBlock(i, newBlock)} 
                    />
                  </div>
                )}

                {/* When instrumentsOnly, we show the vertical spine directly next to the instruments */}
                {isInstrumentsOnly && (
                  <div className="instruments-only-spine-col">
                    {isEditing && (
                      <button 
                        className="btn-icon delete-block-btn" 
                        onClick={() => handleDeleteBlock(i)}
                        title="Smazat tuto část"
                        style={{ top: '0.4rem', left: '-1.5rem', right: 'auto' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <div className={`block-spine ${getBlockColorClass(block)}`}>
                      <div className="block-vertical-label">
                        {block.type || 'Část'}
                      </div>
                      <div className="block-vertical-line"></div>
                    </div>
                  </div>
                )}

                {/* Right Column: Arrangement Lines Stretching across the full block height */}
                {showInstruments && (
                  <div className={`block-arr-side ${isInstrumentsOnly ? 'instruments-only' : ''}`}>
                    {instruments.map(inst => {
                      const arr = block.arrangement?.[inst] || { lineStyle: 'empty', comment: '' };
                      const instColor = getInstrumentColor(song, inst);
                      const hasComment = Boolean(arr.commentMid || arr.comment);
                      return (
                        <div 
                          key={inst} 
                          className={`arr-cell ${isEditing ? 'is-editing' : ''}`}
                          onClick={() => handleCellQuickCycle(i, block, inst)}
                          title={isEditing ? 'Kliknutím přepneš styl čáry (žádná / plná / čárkovaná / tečkovaná)' : ''}
                        >
                          {/* Svislá linka vybraného stylu s případnými puntíky v barvě nástroje */}
                          <ArrangementLine 
                            style={arr.lineStyle || 'empty'} 
                            segmentMode={arr.segmentMode || 'full'}
                            dotStart={Boolean(arr.dotStart)} 
                            dotEnd={Boolean(arr.dotEnd)} 
                            color={instColor}
                          />

                          {/* Akční tlačítka stopy v editačním módu: Zkopírovat z předchozího + Nastavení */}
                          {isEditing && (
                            <div className="arr-cell-actions" onClick={e => e.stopPropagation()}>
                              {i > 0 && (
                                <button
                                  type="button"
                                  className="arr-cell-action-btn"
                                  onClick={() => handleCopyFromPrevious(i, block, inst)}
                                  title={`Zkopírovat čáru z předchozí části (${song?.blocks?.[i - 1]?.type || 'Předchozí'})`}
                                >
                                  <Copy size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="arr-cell-action-btn"
                                onClick={() => openCellModal(i, block, inst)}
                                title={`Pokročilé nastavení stopy (${inst})`}
                              >
                                <SlidersHorizontal size={13} />
                              </button>
                            </div>
                          )}

                          {/* Poznámka nahoře (začátek) */}
                          {arr.commentStart && (
                            <div className="arr-comment-wrapper arr-comment-start">
                              <div className={`arr-comment ${arr.commentAccent ? 'is-accent' : ''}`}>
                                {arr.commentStart}
                              </div>
                            </div>
                          )}

                          {/* Poznámka uprostřed (střed) - v editaci výrazný štítek s inputem */}
                          {isEditing ? (
                            <div 
                              className="arr-comment-wrapper arr-comment-mid is-editing-input"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                className={`arr-inline-comment-input ${hasComment ? 'has-value' : 'is-empty'} ${arr.commentAccent ? 'is-accent' : ''}`}
                                value={arr.commentMid ?? arr.comment ?? ''}
                                onChange={e => handleCellCommentChange(i, block, inst, e.target.value)}
                                placeholder={hasComment ? '' : '+ poznámka'}
                                title="Rychlá poznámka ke stopě"
                              />
                            </div>
                          ) : (
                            (arr.commentMid || arr.comment) && (
                              <div className="arr-comment-wrapper arr-comment-mid">
                                <div className={`arr-comment ${arr.commentAccent ? 'is-accent' : ''}`}>
                                  {arr.commentMid || arr.comment}
                                </div>
                              </div>
                            )
                          )}

                          {/* Poznámka dole (konec) */}
                          {arr.commentEnd && (
                            <div className="arr-comment-wrapper arr-comment-end">
                              <div className={`arr-comment ${arr.commentAccent ? 'is-accent' : ''}`}>
                                {arr.commentEnd}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isEditing && <div style={{ width: '34px', marginLeft: '0.5rem' }}></div>}
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <div className="add-block-buttons-row">
                <button 
                  type="button"
                  className="btn-add-block block-btn-verse" 
                  onClick={() => handleAddBlock('verse')}
                  title="Přidat další sloku s šedou barvou"
                >
                  <Plus size={16} /> Přidat sloku
                </button>
                <button 
                  type="button"
                  className="btn-add-block block-btn-chorus" 
                  onClick={() => handleAddBlock('chorus')}
                  title="Přidat refrén se žlutou barvou"
                >
                  <Plus size={16} /> Přidat refrén
                </button>
                <button 
                  type="button"
                  className="btn-add-block block-btn-bridge" 
                  onClick={() => handleAddBlock('bridge')}
                  title="Přidat bridge s modrou barvou"
                >
                  <Plus size={16} /> Přidat bridge
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Arrangement Cell Inspector Modal */}
      {activeCellModal && (
        <ArrangementCellModal 
          isOpen={Boolean(activeCellModal)}
          block={activeCellModal.block}
          inst={activeCellModal.inst}
          arrData={activeCellModal.arrData}
          color={getInstrumentColor(song, activeCellModal.inst)}
          onSave={handleModalSave}
          onClose={() => setActiveCellModal(null)}
        />
      )}
    </div>
  );
}
