import KnightLogo from '/logo.png'
import './Home.css'
import React, {useState} from 'react';
import './background.scss';
import { useNavigate } from 'react-router-dom';

function Home() {

  const navigate = useNavigate();

  const [isPopupVisible, setPopupVisible] = useState(false);
  const [pType, setPopupType] = useState('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setregPassword] = useState<string>('');
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [logUsername, setlogUsername] = useState<string>('');
  const [logPassword, setlogPassword] = useState<string>('');
  const [regUsername, setregUsername] = useState<string>('');
  const [dupPassword, setdupPassword] = useState<string>('');
  const [error, seterror] = useState<string | null>(null);
  const [forgoremail, setforgoremail] = useState<string>('');
  
  const showPopup = (type: React.SetStateAction<string>) => {
    setPopupType(type);
    setPopupVisible(true);
  };
  
  const closePopup = () => {
    setPopupVisible(false);
    setPopupType('');
    setRegEmail('');
    setregPassword('');
    setFirstname('');
    setLastname('');
    setlogUsername('');
    setlogPassword('');
    setregUsername('');
    setdupPassword('');
    seterror(null);
    setforgoremail('');
  };


  {/*This function will try to log user in without checking the inputs*/}
  const login = async () => {
  {/*this will package the data in the format specified by api*/ }
    const data = { 
      login: logUsername,
      password: logPassword, 
    };

    
    try {
      const response = await fetch('http://146.190.71.194:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(data) 
      });

      if(response.ok) { {/*If the user sucessfully logs in we need to send the user to the landing page */}
        console.log('login successful');
        const info = await response.json();

        // Save cookies
        document.cookie = `authToken=${info.token}; path=/;`;
        document.cookie = `firstName=${info.firstName}; path=/;`;
        document.cookie = `lastName=${info.lastName}; path=/;`;

        console.log(info);
        navigate('/landing');
        {/*loadLogin(info); This line will pass the info gathered on login to homepage */}
      }
      else if(response.status == 400) {
        seterror("Please fill out the missing field.");
      }
      else if(response.status == 401) {
        seterror("Username and Password combination does not exist.");
      }
      else if(response.status == 403) {
        seterror("Please verify your email before logging in.");
      }
      else {
        
        const errorData = await response.json();
        console.error('failed login', errorData.message);

      }

      
    } catch (error) {
      console.error('Error during Login:', error);
    } 
    
  }

  const register = async () => {
    seterror(null);
    
    if(regPassword != dupPassword)
    {
      seterror("Passwords do not match!");
      return;
    }

    const regData = {
      login: regUsername,
      password: regPassword,
      firstName: firstname,
      lastName: lastname,
      email: regEmail,
    };

    try {
      const response1 = await fetch('http://146.190.71.194:5000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regData), 
      });
      
      if(response1.ok) {

        console.log('sucessful registration');
        const info = await response1.json();

        console.log(info);
        navigate('/landing');

        {/*loadLogin(info); this line will hopefully pass information to homepage */}
      }
      else if (response1.status == 400) {
        console.log("duplicate email")
        seterror("There is already an account with this email");
      }
      else if (response1.status == 399) {
        console.log("All fields not filled out")
        seterror("Please fill out all fields")
      }
      else
        console.log("registration failed")
    } 
    catch(err)
    {
      console.log("error sending the register packets");
    }

  }  

  const forgotpass = async () => {

    console.log(forgoremail);
    
    const emaildata = {
      email: forgoremail, 
    };

    try {
      const response2 = await fetch('http://146.190.71.194:5000/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emaildata), 
      });

      if(response2.ok) {

        console.log("Email should be sent")
        const info = await response2.json;
        console.log(info);
        navigate("/home");
        
      }
      else if (response2.status == 339){
        seterror("Please enter an email");
      }
      else if (response2.status == 338){
        seterror("An account with that email does not exist");
      }
      else if (response2.status == 400) {
        seterror("You need to verify your email first")
      }
      else if (response2.status == 500) {
        seterror("There has been an error");
      }
      



    } catch (err) {seterror("there has been an unexpected error")}

  }
  
  {/*Helper Functions for loading user inputs*/}
  const handleregEmailChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setRegEmail(e.target.value)
  )
  const handleregPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setregPassword(e.target.value)
  )
  const handlelogPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setlogPassword(e.target.value)
  )
  const handleFirstnameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setFirstname(e.target.value)
  )
  const handleLastnameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setLastname(e.target.value)
  )
  const handlelogUsernameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setlogUsername(e.target.value)
  )
  const handleregUsernameChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setregUsername(e.target.value)
  )
  const handledupPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
    setdupPassword(e.target.value)
  )
  const handleforgoremail=(e : React.ChangeEvent<HTMLInputElement>) => (
    setforgoremail(e.target.value)
  )



  return (
    <>
      <div id="stars-container">
        <div id='stars'></div>
        <div id='stars2'></div>
        <div id='stars3'></div>
      </div>

      <div>
        <a target="_blank">
          <img src={KnightLogo} className="logo" alt="Vite logo" />
        </a>
      </div>

      {/* header and slogan */}
      <h1 className='title' style={{userSelect: 'none', fontSize: 70}}>KnighTracks</h1>
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

          {isPopupVisible && pType === 'login' && (
            <div className="overlay">
              <div className="popup" onClick={e => e.stopPropagation()}>
                <div className="x" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
                {/* Creates login popup*/}
                    <h2 style={{ color: "#ffff" }}>Login</h2>
                    <p style={{ color: "#ffff" }}>This is the login!</p>
                    {error && <p style={{ color: "#ff0000" }} className="error-message">{error}</p>}
                    <input type="text" id="username" name="username" value={logUsername} onChange={handlelogUsernameChange} placeholder="Username" className="circular-input" />
                    <input type="password" id="password" name="password" value={logPassword} onChange={handlelogPasswordChange} placeholder="Password" className="circular-input" />
                    <div style={{ display: 'block', textAlign: 'center' }}>
                      <button className='forgot-password' onClick={() => showPopup('forgot-password')}>Forgot Password?</button> 
                      <button onClick={login} style={{ display: 'block', margin: '0 auto', marginTop: '30px' }}
                      
                      >Log in</button>
                </div>
              </div>
            </div>
          )}

          {isPopupVisible && pType === 'sign-up' && (
            <div className="overlay">
              <div className="popup-signup" onClick={e => e.stopPropagation()}>
                <div className="x" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
                    <h2 style={{ color: "#ffff" }}>Sign Up</h2>
                    <p style={{ color: "#ffff" }}>This is the sign-up!</p>
                    {error && <p style={{ color: "#ff0000" }} className="error-message">{error}</p>}
                    <input type="text" value={regUsername} onChange={handleregUsernameChange} placeholder="Username" className="circular-input" />
                    <input type="text" value={firstname} onChange={handleFirstnameChange} placeholder="First Name" className="circular-input" />
                    <input type="text" value={lastname} onChange={handleLastnameChange} placeholder="Last Name" className="circular-input" />
                    <input type="text" value={regEmail} onChange={handleregEmailChange} placeholder="Email" className="circular-input" />
                    <input type="password" value={regPassword} onChange={handleregPasswordChange} placeholder="Password" className="circular-input" />
                    <input type="password" value={dupPassword} onChange={handledupPasswordChange} placeholder="Re-enter Password" className="circular-input" />
                    <button onClick={register} style={{ display: 'block', margin: '0 auto', marginTop: '25px' }}>Sign Up</button>
              </div>
            </div>
          )}

          {isPopupVisible && pType === 'forgot-password' && (
            <div className="fpoverlay">
              <div className="fppopup" onClick={e => e.stopPropagation()}>
                <div className="x" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
                  <h2 style={{ color: "#ffff"}}>Forgot Password</h2>
                  <p style={{ color: "#ffff"}}>Please enter your email!</p>
                  {error && <p style={{ color: "#ff0000" }} className="error-message">{error}</p>}
                  <input type="text" value={forgoremail} onChange={handleforgoremail} placeholder="Email" className="circular-input" />
                  <button onClick={forgotpass} style={{ display: 'block', margin: '0 auto', marginTop: '25px' }}>Reset</button>
              </div>
            </div>
          )}
      </div>


      {/* learn more and about us hyperlinks */}
      <div className="more">
        <a style={{ cursor: 'pointer' }} onClick={() => showPopup('about-us')}>About Us</a>

          {isPopupVisible && pType === 'about-us' && (
            <div className="AbusOverlay">
              <div className="Abuspopup" onClick={e => e.stopPropagation()}>
                <div className="x-about" onClick={closePopup}>&times;</div> {/* creates the x out button*/}
                  <h2 style={{color: "#ffff" }}>About Us</h2>
                  <div className="grid-container">
                    <div className="box">
                      <img src="JamesLove.jpg" alt="jamesimg"></img>
                      <div className="devname">
                        <p>James Love</p> 
                        Front-End Developer
                      </div>
                    </div>
                    <div className="box">
                      <img src="NathanChery.jpg" alt="jamesimg"></img>
                      <div className="devname">
                        <p>Nathan Chery</p>
                        API Developer
                        </div>
                    </div>
                    <div className="box">
                      <img src="JamesLove.jpg" alt="jamesimg"></img>
                      <div className="devname">
                        <p>Ning Dim</p> 
                        API Devleoper
                      </div>
                    </div>
                    <div className="box">
                      <img src="ChrisJaksec.jpg" alt="jamesimg"></img>
                      <div className="devname">                      
                        <p>Chris Jaksec</p>
                        Front-End Developer
                      </div>
                    </div>
                    <div className="box">
                      <img src="JamesLove.jpg" alt="jamesimg"></img>
                      <div className="devname">  
                        <p>Michael Miletic</p>
                        Project Lead/Mobile Developer
                      </div>
                    </div>
                    <div className="box">
                      <img src="JamesLove.jpg" alt="jamesimg"></img>
                      <div className="devname">
                        <p>Brandon Ramlagan</p>
                        Database/Mobile Developer
                      </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          <a href="https://github.com/jaksec/poosd-large" target="_blank" rel="noopener noreferrer">
            Learn More
          </a>
          

        </div>
      </div>

    </>
  )}

export default Home