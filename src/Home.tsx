import KnightLogo from '/logo.png'
import './Home.css'
import React, {useState} from 'react';
import './background.scss';

function Home() {

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [pType, setPopupType] = useState('');
  
  const showPopup = (type: React.SetStateAction<string>) => {
    setPopupType(type);
    setPopupVisible(true);
  };
  
  const closePopup = () => {
    setPopupVisible(false);
    setPopupType('');
  };

  return (
    <>
      <div id="stars-container">
        <div id='stars'></div>
        <div id='stars2'></div>
        <div id='stars3'></div>
      </div>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={KnightLogo} className="logo" alt="Vite logo" />
        </a>
      </div>

      {/* header and slogan */}
      <h1 style={{userSelect: 'none', fontSize: 70}}>KnightTrack</h1>
      <div className="card">

        <p style={{userSelect: 'none', fontSize: 20}}>
          Track your nutrition the Knight way.
        </p>

      </div>

      {/* login and sign-up buttons div */}
      <div className="ls-pair">
        <div className="PopUpButton">
          <button onClick={() => showPopup('login')}>Log In</button>
          <button onClick={() => showPopup('sign-up')}>Sign Up</button>

          {isPopupVisible && (
            <div className="overlay">
              <div className="popup" onClick={e => e.stopPropagation()}>
                <div className="x" onClick={closePopup}>&times;</div>
                {pType === 'login' && (
                  <>
                    <h2>Login</h2>
                    <p>This is the login!</p>
                    <input type="text" placeholder="Email" className="circular-input" />
                    <input type="password" placeholder="Password" className="circular-input" />
                    <div style={{ display: 'block', textAlign: 'center' }}>
                      <a href="https://www.linkedin.com/in/jaksec" target='_blank' style={{ display: 'inline-block', marginTop: '10px' }}>
                        <p style={{ margin: 0 }}>Forgot Password?</p>
                      </a>
                      <button style={{ display: 'block', margin: '0 auto', marginTop: '30px' }}>Log in</button>
                    </div>
                  </>
                )}
                {pType === 'sign-up' && (
                  <>
                    <h2>Sign Up</h2>
                    <p>This is the sign-up!</p>
                    <input type="text" placeholder="First Name" className="circular-input" />
                    <input type="text" placeholder="Last Name" className="circular-input" />
                    <input type="text" placeholder="Email" className="circular-input" />
                    <input type="password" placeholder="Password" className="circular-input" />
                    <input type="password" placeholder="Re-enter Password" className="circular-input" />
                    <button style={{ display: 'block', margin: '0 auto', marginTop: '30px' }}>Sign Up</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* learn more and about us hyperlinks */}
      <div className="more">
        <a href="https://github.com/jaksec/poosd-large" target="_blank" rel="noopener noreferrer">
          About Us
        </a>
        <a href="https://github.com/jaksec/poosd-large" target="_blank" rel="noopener noreferrer">
          Learn More
        </a>
      </div>

    </>
  )
}

export default Home