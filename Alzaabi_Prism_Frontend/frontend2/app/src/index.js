import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      //domain="dev-vzzznisc33kfkaxm.us.auth0.com"
      domain = "alzaabiprism.us.auth0.com"
      clientId="eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf"
      useRefreshTokens={true}
      cacheLocation="localstorage"
      authorizationParams={{
        audience: "eZ06DTHAOF9fi9tHqb1K5QntJvYhvySf",  // Same as API_IDENTIFIER in FastAPI
        scope: "openid profile email",
        redirect_uri: window.location.origin
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
 
reportWebVitals();
 