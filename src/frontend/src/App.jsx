import { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import LandingPage from './LandingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div>
      {currentPage === 'landing' ? (
        <LandingPage onLogin={() => setCurrentPage('admin')} />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}

export default App;