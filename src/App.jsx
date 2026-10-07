import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FolderPage from './pages/FolderPage';
import SongPage from './pages/SongPage';

function App() {
  return (
    <div className="app-container">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/folder/:folderId" element={<FolderPage />} />
          <Route path="/song/:id" element={<SongPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
