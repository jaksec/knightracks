import KnightLogo from '/logo.png'
import './Home.css'
import React, {useState} from 'react';
import './background.scss';

function Home() {

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [pType, setPopupType] = useState('');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');

  
  const showPopup = (type: React.SetStateAction<string>) => {
    setPopupType(type);
    setPopupVisible(true);
  };
  
  const closePopup = () => {
    setPopupVisible(false);
    setPopupType('');
  };


  {/*This function will try to log user in without checking the inputs*/}
  /*const login = () => {
    
    const data = { email, password }
    try {
      const response = await fetch('https://example.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
      });

      if(!response.ok) {
        throw new Error("Did not recieve correct network response");
      }

      const decoded = await response.json();
      
    } catch (error) {} 
    
  }*/
    

  
  
  {/*Helper Functions for loading user inputs*/}
  const handleEmailChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setEmail(e.target.value)
  )
  const handlePasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setPassword(e.target.value)
  )
  const handleFirstnameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setFirstname(e.target.value)
  )
  const handleLastnameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setLastname(e.target.value)
  )



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
      <h1 className='title' style={{userSelect: 'none', fontSize: 70}}>KnightTrack</h1>
      <div className="card">

        <p style={{userSelect: 'none', fontSize: 20}}>
          Track your nutrition the Knight way.
        </p>

      </div>

      {/* login and sign-up buttons div */}
      <div className="ls-pair">
        <div className="PopUpButton">
          <button onClick={() => showPopup('login')}>Log In</button> {/* Creates log in button */}
          <button onClick={() => showPopup('sign-up')}>Sign Up</button> {/*Creates sign up button*/}

          {isPopupVisible && (
            <div className="overlay">
              <div className="popup" onClick={e => e.stopPropagation()}>
                <div className="x" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
                {/* Creates login popup*/}
                {pType === 'login' && ( 
                  <>
                    <h2 style={{ color: "#ffff" }}>Login</h2>
                    <p style={{ color: "#ffff" }}>This is the login!</p>
                    <input type="text" value={email} onChange={handleEmailChange} placeholder="Email" className="circular-input" />
                    <input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" className="circular-input" />
                    <div style={{ display: 'block', textAlign: 'center' }}>
                      <a href="https://www.linkedin.com/in/jaksec" target='_blank' style={{ display: 'inline-block', marginTop: '10px' }}>
                        <p style={{ margin: 0 }}>Forgot Password?</p>
                      </a>
                      <button style={{ display: 'block', margin: '0 auto', marginTop: '30px' }}
                      
                      >Log in</button>
                    </div>
                  </>
                )}
                {pType === 'sign-up' && (
                  <>
                    <h2 style={{ color: "#ffff" }}>Sign Up</h2>
                    <p style={{ color: "#ffff" }}>This is the sign-up!</p>
                    <input type="text" value={firstname} onChange={handleFirstnameChange} placeholder="First Name" className="circular-input" />
                    <input type="text" value={lastname} onChange={handleLastnameChange} placeholder="Last Name" className="circular-input" />
                    <input type="text" value={email} onChange={handleEmailChange} placeholder="Email" className="circular-input" />
                    <input type="password" value={password} onChange={handlePasswordChange} placeholder="Password" className="circular-input" />
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