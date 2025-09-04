import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from '../assets/logo_2.png';
import model from '../assets/gpt-4.1.png';
import './styles/Header.css';

function Header({ toggleTheme, theme, isLoading }) {
    const navigate = useNavigate(); 

    const handleBackToDashboard = () => {
        navigate('/dashboard'); 
    };

    return (
        <header className="site-header">
            <img src={logo} alt="Logo" className="site-logo" />
            {/* <div className="header-text">
                <h2>Al Zaabi Group AI Advisor</h2>
                
            </div>
            <div>
            <img src={model} alt="Model" className="model-icon" />
            </div> */}
            <div className="header-center">
                <h2>Al Zaabi Group AI Advisor</h2>
                <img src={model} alt="Model" className="model-icon" />
            </div>

            <div className="header-buttons">
                <button
                    className="back-to-dashboard-button"
                    onClick={handleBackToDashboard}
                    disabled={isLoading}
                >
                    Back to Dashboard
                </button>
                <div className="theme-toggle" onClick={toggleTheme}>
                    <div className={`theme-toggle-switch ${theme}`} />
                </div>
            </div>
        </header>
    );
}

export default Header;
