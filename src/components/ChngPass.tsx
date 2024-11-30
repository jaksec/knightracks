import './ChngPass.css'
import React, {useState} from 'react';
import './background.scss';
import { Link, useNavigate } from 'react-router-dom';
import KnightLogo from '/logo.png'

const ChngPass: React.FC = () => {

  const navigate = useNavigate();
  const getToken = new URLSearchParams(location.search);
  const token = getToken.get('token');

  if (!token) {
    //throw new Error("Token is missing");
  }

  const [newPassword, setnewPassword] = useState<string>('');
  const [dupPassword, setdupPassword] = useState<string>('');


    const [error, seterror] = useState<string | null>(null);


    const handleFnewPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
        setnewPassword(e.target.value)
      )
    const handledupPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
      setdupPassword(e.target.value)
    )

      const resetPassword = async () => {
      {/*this will package the data in the format specified by api*/ }
        if(newPassword != dupPassword)
          {
            seterror("Passwords do not match!");
            return;
          }
        else if(!newPassword) {
          seterror("Please input a password");
          return;
        }

          const reset = {
            password: newPassword,
          };

          try {

            const response = await fetch('http://146.190.71.194:5000/api/user/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify(reset),

            });

            if(response.ok) {
              console.log("Sucessful password reset")
              navigate('/landing');
            }

            if(response.status == 404)
            {
              seterror("Invalid or Expired Token")
            }
            else if(response.status == 401)
            {
              seterror("Please verify your email before resetting your password")
            }
            else if(response.status == 400)
            {
              seterror("You cannot use the same password as you just used")
            }






          } catch (error) { console.log("error has occured")}



      }   
    return (
        <>
            <div id="stars-container">
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>
            </div>
        
            <div>
                <a target="_blank">
                  <Link to="/">
                    <img src={KnightLogo} className="logo" alt="Vite logo" />
                  </Link>
                </a>
            </div>

            <div className="container">
              <div className="RPbox"> 
                <h2 className="RPtitle">Reset Password</h2> 
                <p style={{ color: "#ffff", marginBottom: '1em' }}>Please reset your password!</p>
                <div className="error">
                  <p className={`error-message ${error ? 'show' : ''}`}>{error}</p>
                </div>
                <input type='password' className='password-box' placeholder="Password" onChange={handleFnewPasswordChange} />
                <input type='password' className='password-box' placeholder="Password" onChange={handledupPasswordChange}/>
                <button onClick={resetPassword} >Submit</button>
              </div>
            </div>

        
        </>
    )
  }; 
export default ChngPass;