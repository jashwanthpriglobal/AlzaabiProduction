// ProtectedRoute.js
import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // While Auth0 is still checking user status, just show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, log in and tell Auth0 which route to come back to
  if (!isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }
    });
    return null; // Or a spinner, if you want
  }

  // If authenticated, render whatever's protected
  return children;
};

export default ProtectedRoute;
