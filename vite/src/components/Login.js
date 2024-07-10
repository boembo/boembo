// src/components/Login.js
import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
    const {login} = useContext(AuthContext);

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
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
            <div>
                <h2>Login Page</h2>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                            console.log('Login Failed');
                        }}
                    />
            </div>
            );
};

export default Login;
