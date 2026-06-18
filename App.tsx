import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Analytics from './pages/Analytics';
import InterviewPrep from './pages/InterviewPrep';
import Network from './pages/Network';
import Documents from './pages/Documents';
import JobScanner from './pages/JobScanner';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="prep" element={<InterviewPrep />} />
          <Route path="network" element={<Network />} />
          <Route path="documents" element={<Documents />} />
          <Route path="scanner" element={<JobScanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
