import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  handleLogout: () => void;
  onPhotoUploadSuccess: () => void;
  selectedFilterTags: string[];
  onFilterTagsChange: (tags: string[]) => void;
  tagsRefreshKey: number;
}

const ProtectedRoute = ({ children, isLoggedIn, handleLogout, onPhotoUploadSuccess, selectedFilterTags, onFilterTagsChange, tagsRefreshKey }: ProtectedRouteProps) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Layout handleLogout={handleLogout} onPhotoUploadSuccess={onPhotoUploadSuccess} selectedFilterTags={selectedFilterTags} onFilterTagsChange={onFilterTagsChange} tagsRefreshKey={tagsRefreshKey}>{children}</Layout>;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize isLoggedIn from localStorage
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return storedIsLoggedIn === 'true';
  });
  const [homeKey, setHomeKey] = useState(0);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [tagsRefreshKey, setTagsRefreshKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Clear login state from localStorage
    setIsLoggedIn(false);
    // navigate('/login'); // Navigation is handled by ProtectedRoute now
  };

  const handlePhotoUploadSuccess = () => {
    setHomeKey(prevKey => prevKey + 1);
    setTagsRefreshKey(prevKey => prevKey + 1);
  };

  const handleFilterTagsChange = (tags: string[]) => {
    setSelectedFilterTags(tags);
  };

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                handleLogout={handleLogout}
                onPhotoUploadSuccess={handlePhotoUploadSuccess}
                selectedFilterTags={selectedFilterTags}
                onFilterTagsChange={handleFilterTagsChange}
                tagsRefreshKey={tagsRefreshKey}
              >
                <Home key={homeKey} selectedFilterTags={selectedFilterTags} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
