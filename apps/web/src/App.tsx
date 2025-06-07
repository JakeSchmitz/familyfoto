import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  handleLogout: () => void;
}

const ProtectedRoute = ({ children, isLoggedIn, handleLogout }: ProtectedRouteProps) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Layout handleLogout={handleLogout}>{children}</Layout>;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    // In a real app, you would also clear tokens from local storage, etc.
    // navigate('/login'); // Navigation is handled by ProtectedRoute now
  };

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn} handleLogout={handleLogout}>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
