
// src/api/axios.js
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const useAxios = () => {
    const {token} = useContext(AuthContext);

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:3000/api',
    });

    axiosInstance.interceptors.request.use(
            (config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
            (error) => Promise.reject(error)
    );

    return axiosInstance;
};

export default useAxios;
