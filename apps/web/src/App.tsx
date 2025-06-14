import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  handleLogout: () => void;
  onPhotoUploadSuccess: () => void;
  selectedFilterTags: string[];
  onFilterTagsChange: (tags: string[]) => void;
  tagsRefreshKey: number;
  userId?: number;
}

const ProtectedRoute = ({ 
  children, 
  isLoggedIn, 
  handleLogout, 
  onPhotoUploadSuccess, 
  selectedFilterTags, 
  onFilterTagsChange, 
  tagsRefreshKey,
  userId 
}: ProtectedRouteProps) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout 
      handleLogout={handleLogout} 
      onPhotoUploadSuccess={onPhotoUploadSuccess} 
      selectedFilterTags={selectedFilterTags} 
      onFilterTagsChange={onFilterTagsChange} 
      tagsRefreshKey={tagsRefreshKey}
    >
      {children}
    </Layout>
  );
};

function AppContent() {
  const { isAuthenticated, userId, logout } = useAuth();
  const [homeKey, setHomeKey] = useState(0);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [tagsRefreshKey, setTagsRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
  };

  const handlePhotoUploadSuccess = () => {
    setHomeKey(prevKey => prevKey + 1);
    setTagsRefreshKey(prevKey => prevKey + 1);
  };

  const handleFilterTagsChange = (tags: string[]) => {
    setSelectedFilterTags(tags);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute 
              isLoggedIn={isAuthenticated} 
              handleLogout={handleLogout}
              onPhotoUploadSuccess={handlePhotoUploadSuccess}
              selectedFilterTags={selectedFilterTags}
              onFilterTagsChange={handleFilterTagsChange}
              tagsRefreshKey={tagsRefreshKey}
              userId={userId}
            >
              <Home 
                key={homeKey} 
                selectedFilterTags={selectedFilterTags}
                currentUserId={userId}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ChakraProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GoogleOAuthProvider>
    </ChakraProvider>
  );
}

export default App;
