import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Processes } from './pages/Processes';
import { Projects } from './pages/Projects';
import { Network } from './pages/Network';
import { News } from './pages/News';
import { Settings } from './pages/Settings';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="processes" element={<Processes />} />
          <Route path="projects" element={<Projects />} />
          <Route path="network" element={<Network />} />
          <Route path="news" element={<News />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
