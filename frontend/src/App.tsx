import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/ui/Sidebar';
import ModalHost from './components/modal/ModalHost';
import Users from './pages/UsersPage';
import Connections from './pages/ConnectionsPage';
import DashboardsPage from './pages/DashboardsPage';

function App() {
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion(v => v + 1);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar refreshKey={version} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<h1>Wybierz pulpit z menu</h1>} />
            <Route path="/users" element={<Users />} />
            <Route path="/connections" element={<Connections version={version} refresh={refresh} />} />
            <Route path="/dashboards/:id" element={<DashboardsPage version={version} refresh={refresh} />} />
          </Routes>
        </main>
        <ModalHost onChanged={refresh} />
      </div>
    </BrowserRouter>
  );
}

export default App;