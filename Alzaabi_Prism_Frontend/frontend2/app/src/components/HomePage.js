import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import './styles/HomePage.css';
import Logo from '../assets/pri_logo.png';
import LogoAlzaabi from '../assets/alzaabigroup_logo.png';

function HomePage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);


  useEffect(() => {
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    const success = searchParams.get('success');
    const message = searchParams.get('message');

    if (
      success === 'true' &&
      message?.toLowerCase().includes('your email was verified')
    ) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setSearchParams({});
      }, 1000);
    }


    // Show popup if email verification is required
    if (
      error === 'access_denied' &&
      errorDesc?.toLowerCase().includes('verify your email')
    ) {
      setShowVerifyModal(true);

      // Clean up URL after showing modal
      setTimeout(() => {
        setSearchParams({});
      }, 1000);
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, searchParams, setSearchParams]);

  return (
    <div className="home-page">
      <video autoPlay loop muted playsInline className="video-background">
        <source
          src="https://44973281.fs1.hubspotusercontent-na1.net/hubfs/44973281/Talent-as-a-Service-Hero-1.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <header className="header">
        <div className="admin-button-container">
          <a
            href="https://manage.auth0.com/dashboard/us/alzaabiprism/users"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-access-button"
          >
            Admin Login
          </a>
        </div>
        <div className="logo-container">
          <img src={LogoAlzaabi} alt="Alzaabi Group" className="home-logo" />
          {/* <img src={Logo} alt="PRI Global" className="home-logo" /> */}
        </div>
      </header>

      <div className="form-container">
        {!isAuthenticated && (
          <button
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                prompt: 'login', 
              },
            })
          }
          className="next-button"
        >
            Get Started
          </button>
        )}
      </div>

      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Email Verification Required</h2>
            <p>Please check your inbox and verify your email before logging in.</p>
            <button onClick={() => setShowVerifyModal(false)} className="next-button">
              OK
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🎉 Email Verified!</h2>
            <p>Welcome! Your email has been successfully verified.</p>
            <button onClick={() => setShowSuccessModal(false)} className="next-button">
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;
