import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSongsInFolder, saveSong } from '../data/songsLoader';
import { 
  FolderOpen, 
  Music, 
  Search, 
  ArrowLeft, 
  Plus, 
  ChevronRight, 
  Folder 
} from 'lucide-react';

export default function FolderPage() {
  const { folderId } = useParams();
  const folderName = decodeURIComponent(folderId || '');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newKey, setNewKey] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const songs = getSongsInFolder(folderName);

  const filteredSongs = songs.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.author.toLowerCase().includes(q);
  });

  const handleCreateSong = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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

    saveSong(folderName, newSong);
    setNewTitle('');
    setNewAuthor('');
    setNewKey('');
    setIsNewSongModalOpen(false);
    setRefreshKey(prev => prev + 1);

    navigate(`/song/${newSong.id}?folder=${encodeURIComponent(folderName)}`);
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Zpět na hlavní stránku
        </Link>

        <button 
          className="btn btn-primary"
          onClick={() => setIsNewSongModalOpen(true)}
        >
          <Plus size={18} /> Přidat píseň do {folderName}
        </button>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Folder Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div className="folder-icon-wrapper" style={{ width: '64px', height: '64px' }}>
            <FolderOpen size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{folderName}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Celkem {songs.length} skladeb ve složce <code>src/data/{folderName}/</code>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="search-input-wrapper">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              placeholder={`Hledat v ${folderName}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Songs List */}
        {filteredSongs.length > 0 ? (
          <div className="songs-list">
            {filteredSongs.map(song => {
              const instruments = song.blocks?.[0]?.arrangement 
                ? Object.keys(song.blocks[0].arrangement) 
                : [];

              return (
                <Link key={song.id} to={`/song/${song.id}?folder=${encodeURIComponent(folderName)}`}>
                  <div className="song-card-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '10px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary-color)'
                      }}>
                        <Music size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                          {song.title}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {song.author}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {song.key && (
                        <span className="badge-key">
                          {song.key}
                        </span>
                      )}
                      {instruments.length > 0 && (
                        <span style={{ 
                          padding: '0.35rem 0.65rem', 
                          background: 'rgba(255, 255, 255, 0.05)', 
                          borderRadius: '6px', 
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {instruments.join(', ')}
                        </span>
                      )}
                      <ChevronRight size={18} color="#64748b" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Folder size={48} className="empty-state-icon" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {searchQuery ? 'Žádná píseň neodpovídá hledání' : 'V této složce zatím nejsou žádné písně'}
            </h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {searchQuery ? 'Zkuste upravit hledaný výraz' : `Přidejte do složky src/data/${folderName}/ soubor .json nebo klikněte na tlačítko níže.`}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => setIsNewSongModalOpen(true)}>
                <Plus size={18} /> Vytvořit píseň pro {folderName}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create Song */}
      {isNewSongModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewSongModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Nová píseň do složky: {folderName}
            </h3>
            <form onSubmit={handleCreateSong}>
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
