import './ChngPass.css'
import React, {useState} from 'react';
import './background.scss';
import { useNavigate } from 'react-router-dom';
import KnightLogo from '/logo.png'

const ChngPass: React.FC = () => {

    const [newPassword, setnewPassword] = useState<string>('');
    const [errorMessage, seterrorMessage] = useState<string>('');


    const handleFnewPasswordChange=(e : React.ChangeEvent<HTMLInputElement>) => (
        setnewPassword(e.target.value)
      )
    const handleerrorMessageChange=(e : React.ChangeEvent<HTMLInputElement>) => (
        seterrorMessage(e.target.value)
      )

      const resetPassword = async () => {
        {/*this will package the data in the format specified by api*/ }
          const data = { 
            login: newPassword,
             
          };


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


        
        </>
    )
}