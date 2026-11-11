import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authServices';

const ProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    authService.isAuthenticated()
    .then(setAuthenticated)
    .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) return <div>Loading...</div>;

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
