import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getFolders, 
  getSongsInFolder, 
  getAllUniqueSongs, 
  saveSong 
} from '../data/songsLoader';
import { 
  Folder, 
  Music, 
  Search, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  ListMusic, 
  X
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const [folders, setFolders] = useState([]);
  const [activeTab, setActiveTab] = useState('folders'); // 'folders' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [selectedSongForVersions, setSelectedSongForVersions] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newKey, setNewKey] = useState('');
  const [targetFolder, setTargetFolder] = useState('');

  // Refresh lists
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loaded = getFolders();
    setFolders(loaded);
    if (loaded.length > 0 && !targetFolder) {
      setTargetFolder(loaded[0].name);
    }
  }, [refreshKey]);

  // All unique songs
  const allUniqueSongs = getAllUniqueSongs().filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
  });

  // Count songs in folder
  const getFolderSongCount = (folderName) => {
    return getSongsInFolder(folderName).length;
  };

  // Create new song
  const handleCreateSong = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const folderToUse = targetFolder || folders[0]?.name || 'Složka 1';
    const baseId = newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `song-${Date.now()}`;

    const newSong = {
      id: baseId,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Neznámý autor',
      key: newKey.trim() || 'C dur',
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'Sloka 1',
          lyrics: '[C]První řádek [G]nové písně\n[Ami]a druhý [F]řádek',
          arrangement: {
            'Kytara': { lineStyle: 'solid', comment: 'Doprovod' }
          }
        }
      ]
    };

    saveSong(folderToUse, newSong);
    setNewTitle('');
    setNewAuthor('');
    setNewKey('');
    setIsNewSongModalOpen(false);
    setRefreshKey(prev => prev + 1);

    navigate(`/song/${newSong.id}?folder=${encodeURIComponent(folderToUse)}`);
  };

  return (
    <div>
      {/* App Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: '#60a5fa' }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Repertoár a Zpěvník
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Databáze písní, akordů a přehledné aranže pro kapelu
        </p>
      </header>

      {/* Main Nav Tabs: Složky vs Všechny písně */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="view-nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'folders' ? 'active' : ''}`}
            onClick={() => setActiveTab('folders')}
          >
            <Folder size={18} /> Složky
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <ListMusic size={18} /> Všechny písně ({allUniqueSongs.length})
          </button>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsNewSongModalOpen(true)}
        >
          <Plus size={18} /> Přidat novou píseň
        </button>
      </div>

      {/* ================= TAB 1: SLOŽKY ================= */}
      {activeTab === 'folders' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600' }}>Výběr složky</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {folders.length} složky celkem
            </span>
          </div>

          <div className="folders-grid">
            {folders.map((folder) => {
              const count = getFolderSongCount(folder.name);
              return (
                <Link
                  key={folder.id}
                  to={`/folder/${encodeURIComponent(folder.name)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="folder-card">
                    <div>
                      <div className="folder-header">
                        <div className="folder-icon-wrapper">
                          <Folder size={24} />
                        </div>
                        <span className="folder-badge">
                          {count} {count === 1 ? 'píseň' : count >= 2 && count <= 4 ? 'písně' : 'písní'}
                        </span>
                      </div>

                      <div className="folder-title">{folder.name}</div>
                      <div className="folder-desc">{folder.description}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '1.5rem', color: '#60a5fa', fontSize: '0.875rem', fontWeight: '600', gap: '0.25rem' }}>
                      Otevřít složku <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: VŠECHNY PÍSNĚ ================= */}
      {activeTab === 'all' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Všechny písně</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Unikátní seznam písní spojených podle jejich ID. Kliknutím vyberete konkrétní verzi / složku.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="search-input-wrapper">
              <Search size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Hledat podle názvu, autora nebo ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List of unique songs */}
          {allUniqueSongs.length > 0 ? (
            <div className="songs-list">
              {allUniqueSongs.map(item => {
                return (
                  <div 
                    key={item.id} 
                    className="song-card-item"
                    onClick={() => {
                      if (item.versions.length === 1) {
                        navigate(`/song/${item.id}?folder=${encodeURIComponent(item.versions[0].folder)}`);
                      } else {
                        setSelectedSongForVersions(item);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                      }}>
                        <Music size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {item.author} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>({item.id})</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {item.versions.map(v => (
                        <span 
                          key={v.folder}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#93c5fd',
                            border: '1px solid rgba(59, 130, 246, 0.25)'
                          }}
                        >
                          {v.folder} {v.key && `(${v.key})`}
                        </span>
                      ))}

                      <span style={{ fontSize: '0.85rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        {item.versions.length > 1 ? 'Vybrat složku' : 'Otevřít'} <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nebyly nalezeny žádné písně.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: VERSION PICKER ================= */}
      {selectedSongForVersions && (
        <div className="modal-overlay" onClick={() => setSelectedSongForVersions(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>{selectedSongForVersions.title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedSongForVersions.author}</div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedSongForVersions(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Tato skladba existuje ve více složkách. Ve které složce ji chcete otevřít?
            </p>

            {selectedSongForVersions.versions.map(v => (
              <div 
                key={v.folder}
                className="version-picker-option"
                onClick={() => {
                  navigate(`/song/${selectedSongForVersions.id}?folder=${encodeURIComponent(v.folder)}`);
                  setSelectedSongForVersions(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Folder size={20} color="#60a5fa" />
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {v.folder}
                      {v.key && <span className="badge-key">{v.key}</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Nástroje: {v.instruments.length > 0 ? v.instruments.join(', ') : 'Zatím bez aranže'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color="#64748b" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE SONG ================= */}
      {isNewSongModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewSongModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Nová píseň
            </h3>
            <form onSubmit={handleCreateSong}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Vyberte složku pro píseň *
                </label>
                <select 
                  className="edit-input" 
                  value={targetFolder} 
                  onChange={e => setTargetFolder(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-hover)' }}
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Název písně *
                </label>
                <input
                  className="edit-input"
                  style={{ width: '100%' }}
                  type="text"
                  placeholder="např. Bedna od whisky"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Autor / Interpret
                </label>
                <input
                  className="edit-input"
                  style={{ width: '100%' }}
                  type="text"
                  placeholder="např. Miki Ryvola"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Tónina pro tuto složku
                </label>
                <input
                  className="edit-input"
                  style={{ width: '100%' }}
                  type="text"
                  placeholder="např. G dur, D moll"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsNewSongModalOpen(false)}>
                  Zrušit
                </button>
                <button type="submit" className="btn btn-primary">
                  Vytvořit a otevřít
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
