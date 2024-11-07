import React from 'react';
import KnightLogo from '/logo.png';
import './background.scss';
import './Landing.css';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {

    return (
        <>
            <div id="stars-container">
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>
            </div>

            <div>
                <Link to="/">
                    <img src={KnightLogo} className="logo" alt="Vite logo" />
                </Link>
            </div>

            <div className='title_landing'>
                Welcome to the landing page! :P
            </div>
        </>
    );
}

export default Landing;