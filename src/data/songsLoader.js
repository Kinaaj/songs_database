import foldersConfig from './folders.json';

// Automatically import all song files across all folders using Vite's glob import
const songModules = import.meta.glob('./*/*.json', { eager: true });

export function getFolders() {
  const customFolders = JSON.parse(localStorage.getItem('custom_folders') || '[]');
  // Combine foldersConfig and any custom folders
  const all = [...foldersConfig];
  customFolders.forEach(cf => {
    if (!all.some(f => f.name === cf.name)) {
      all.push(cf);
    }
  });
  return all;
}

// Parses all song files from disk
function loadAllFileSystemSongs() {
  const songs = [];
  
  for (const [path, mod] of Object.entries(songModules)) {
    // path is e.g. './Složka 1/stanky.json'
    const parts = path.split('/');
    if (parts.length >= 3) {
      const folderName = decodeURIComponent(parts[1]);
      const songData = mod.default || mod;
      if (songData && songData.id) {
        songs.push({
          folder: folderName,
          song: songData
        });
      }
    }
  }

  return songs;
}

// Merge disk songs with any in-browser edits/additions stored in localStorage
export function getAllSongsWithFolders() {
  const diskSongs = loadAllFileSystemSongs();
  const localOverrides = JSON.parse(localStorage.getItem('local_songs_db') || 'null');

  if (!localOverrides) {
    return diskSongs;
  }

  // localOverrides is an array of { folder, song }
  const result = [...localOverrides];
  
  // ensure any disk songs not in localOverrides are included
  diskSongs.forEach(ds => {
    const exists = result.some(item => item.folder === ds.folder && item.song.id === ds.song.id);
    if (!exists) {
      result.push(ds);
    }
  });

  return result;
}

// Get songs in a specific folder
export function getSongsInFolder(folderName) {
  const all = getAllSongsWithFolders();
  return all.filter(item => item.folder === folderName).map(item => item.song);
}

// Get unique songs across all folders (grouped by song.id)
export function getAllUniqueSongs() {
  const all = getAllSongsWithFolders();
  const map = new Map();

  all.forEach(item => {
    const { folder, song } = item;
    if (!map.has(song.id)) {
      map.set(song.id, {
        id: song.id,
        title: song.title,
        author: song.author,
        versions: []
      });
    }
    const entry = map.get(song.id);
    entry.versions.push({
      folder,
      key: song.key || '',
      instruments: song.blocks?.[0]?.arrangement ? Object.keys(song.blocks[0].arrangement) : [],
      song
    });
  });

  return Array.from(map.values());
}

// Get a single song in a specific folder
export function getSong(folderName, songId) {
  const inFolder = getSongsInFolder(folderName);
  return inFolder.find(s => s.id === songId) || null;
}

// Save or update a song in a folder (saves to localStorage for live editing)
export function saveSong(folderName, updatedSong) {
  const all = getAllSongsWithFolders();
  const index = all.findIndex(item => item.folder === folderName && item.song.id === updatedSong.id);

  if (index !== -1) {
    all[index] = { folder: folderName, song: updatedSong };
  } else {
    all.push({ folder: folderName, song: updatedSong });
  }

  localStorage.setItem('local_songs_db', JSON.stringify(all));
}
