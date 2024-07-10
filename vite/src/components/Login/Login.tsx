// src/components/Login.js
import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";


const Login = () => {
    const {login} = useContext(AuthContext);
  const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        console.log("handleSuccess");
        try {
            const response = await axios.post('http://localhost:3000/api/auth/google', {
                token: credentialResponse.credential,
            });
            const {token, userData} = response.data;

            console.log("doLogin");
            console.log(userData);
            console.log(token);
            login(userData, token);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

const clientId = '868808932730-mce503fm76m3j4t11nvfjd5p0mll94dd.apps.googleusercontent.com';


    return (
            <div>
                <h2>Login Page</h2>
<GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                            console.log('Login Failed');
                        }}
                    />
</GoogleOAuthProvider>
            </div>
            );
};

export default Login;
