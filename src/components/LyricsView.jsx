import { COLOR_OPTIONS, getBlockColorClass } from '../utils/songConstants';

export default function LyricsView({
  block,
  isEditing,
  showLyrics = true,
  showChords = true,
  onChange
}) {
  // When showing lyrics (with or without chords)
  const parseLyrics = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\[[^\]]+\])/g);

      let currentChord = '';
      const elements = [];

      parts.forEach((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const rawChord = part.slice(1, -1).trim();
          currentChord = rawChord.replace(/[|/]+$/, '').trim();
        } else {
          const words = part.split(' ');
          words.forEach((w, wi) => {
            if (wi > 0) elements.push(<span key={`space-${i}-${wi}`}>&nbsp;</span>);
            if (w || (currentChord && showChords)) {
              elements.push(
                <div key={`w-${i}-${wi}`} className="chord-word-group">
                  {showChords && (
                    <div className="chord">
                      {currentChord || '\u00A0'}
                    </div>
                  )}
                  <div className="word">
                    {w || '\u00A0'}
                  </div>
                </div>
              );
              currentChord = '';
            }
          });
        }
      });

      // Handle any trailing chord at the end of the line (e.g. "...nemocen.[G7]")
      if (currentChord && showChords) {
        elements.push(
          <div key={`trailing-${lineIndex}`} className="chord-word-group">
            <div className="chord">{currentChord}</div>
            <div className="word">{'\u00A0'}</div>
          </div>
        );
        currentChord = '';
      }

      return (
        <div key={lineIndex} className="lyrics-line">
          {elements}
        </div>
      );
    });
  };

  // Renders a line of chords and dividers
  const renderChordsLine = (items, key) => (
    <div key={key} className="chords-only-line">
      {items.map((item, idx) => {
        if (item.type === 'bar') {
          return <span key={`bar-${idx}`} className="chord-bar-divider" />;
        }
        return (
          <span key={`chord-${idx}`} className="chord-item-text">
            {item.name}
          </span>
        );
      })}
    </div>
  );

  // Extracts chords from lyrics (ignoring text words, keeping only [chords] and |)
  const parseChordsFromLyrics = (text) => {
    const lines = text.split('\n');
    const renderedLines = [];

    lines.forEach((line, lineIndex) => {
      const regex = /\[([^\]]+)\]|(\|)/g;
      const items = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[1]) {
          const raw = match[1].trim();
          if (raw === '|' || raw === '/') {
            items.push({ type: 'bar' });
          } else if (raw.endsWith('|') || raw.endsWith('/')) {
            const chordName = raw.replace(/[|/]+$/, '').trim();
            if (chordName) items.push({ type: 'chord', name: chordName });
            items.push({ type: 'bar' });
          } else {
            items.push({ type: 'chord', name: raw });
          }
        } else if (match[2]) {
          items.push({ type: 'bar' });
        }
      }

      if (items.length > 0) {
        renderedLines.push(renderChordsLine(items, lineIndex));
      }
    });

    if (renderedLines.length === 0) {
      return (
        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', padding: '0.4rem 0' }}>
          (Bez akordů v této části)
        </div>
      );
    }

    return renderedLines;
  };

  // Parses explicit chords field (e.g. "C | Ami | F | G7" or "C Ami F G7")
  const parseExplicitChords = (chordsText) => {
    const lines = chordsText.split('\n');
    const renderedLines = [];

    lines.forEach((line, lineIndex) => {
      const regex = /\[([^\]]+)\]|([^\s|]+)|(\|)/g;
      const items = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[1]) {
          const raw = match[1].trim();
          if (raw === '|' || raw === '/') {
            items.push({ type: 'bar' });
          } else if (raw.endsWith('|') || raw.endsWith('/')) {
            const chordName = raw.replace(/[|/]+$/, '').trim();
            if (chordName) items.push({ type: 'chord', name: chordName });
            items.push({ type: 'bar' });
          } else {
            items.push({ type: 'chord', name: raw });
          }
        } else if (match[2]) {
          const raw = match[2].trim();
          if (raw.endsWith('|') || raw.endsWith('/')) {
            const chordName = raw.replace(/[|/]+$/, '').trim();
            if (chordName) items.push({ type: 'chord', name: chordName });
            items.push({ type: 'bar' });
          } else {
            items.push({ type: 'chord', name: raw });
          }
        } else if (match[3]) {
          items.push({ type: 'bar' });
        }
      }

      if (items.length > 0) {
        renderedLines.push(renderChordsLine(items, lineIndex));
      }
    });

    if (renderedLines.length === 0) {
      return (
        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', padding: '0.4rem 0' }}>
          (Bez akordů v této části)
        </div>
      );
    }

    return renderedLines;
  };

  const renderChordsOnly = () => {
    if (block.chords && block.chords.trim()) {
      return parseExplicitChords(block.chords);
    }
    return parseChordsFromLyrics(block.lyrics || '');
  };

  const colorClass = getBlockColorClass(block);
  const activeColorKey = block.color || (colorClass.replace('color-', ''));

  return (
    <div className="song-block">
      {/* Vlevo svislý nápis, vedle něho svislá čára, vpravo text/akordy */}
      <div className={`block-spine ${colorClass}`}>
        <div className="block-vertical-label">
          {block.type || 'Část'}
        </div>
        <div className="block-vertical-line"></div>
      </div>

      <div className="song-block-content">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Název části
                </label>
                <input 
                  className="edit-input" 
                  value={block.type || ''} 
                  onChange={e => onChange({ ...block, type: e.target.value })}
                  placeholder="např. Sloka 1, Refrén"
                  style={{ fontWeight: 'bold', margin: 0 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Barva bloku a čáry
                </label>
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', height: '36px' }}>
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => onChange({ ...block, color: c.key })}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: c.color,
                        border: activeColorKey === c.key ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                        transform: activeColorKey === c.key ? 'scale(1.2)' : 'scale(1)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.15s ease'
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Text písně s akordy
              </label>
              <textarea 
                className="edit-input" 
                value={block.lyrics || ''} 
                onChange={e => onChange({ ...block, lyrics: e.target.value })}
                placeholder="[C]Jdu s děravou [Ami]patou..."
                style={{ margin: 0, minHeight: '90px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Akordy
              </label>
              <textarea 
                className="edit-input" 
                value={block.chords || ''} 
                onChange={e => onChange({ ...block, chords: e.target.value })}
                placeholder="[C] | [Ami] | [F] | [G7]"
                style={{ margin: 0, minHeight: '55px' }}
              />
            </div>
          </div>
        ) : (
          showLyrics ? (
            parseLyrics(block.lyrics || '')
          ) : showChords ? (
            renderChordsOnly()
          ) : (
            <div style={{ color: 'var(--text-secondary)', opacity: 0.35, fontStyle: 'italic', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              (Text i akordy skryty)
            </div>
          )
        )}
      </div>
    </div>
  );
}
