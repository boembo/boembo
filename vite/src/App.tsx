import '@mantine/core/styles.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HeaderTabs } from './components/HeaderTabs/HeaderTabs';
import { DoubleNavbar } from './components/DoubleNavbar/DoubleNavbar';
import { Home } from './components/Home/Home';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import store from './components/Home/store';
import './index.css';
import Login from './components/Login/Login';
import Logout from './components/Login/Logout';
import axios from 'axios';

import { AuthProvider } from './context/AuthContext';
export default function App() {
  const [data, setData] = useState('');

 

  return (
    <Provider store={store}>
<AuthProvider>
      <MantineProvider>
        <Router>
          <div className="flex">
            <div>
              <DoubleNavbar />
            </div>
            <div className="grow">
              <HeaderTabs />
              <Routes>
                <Route path="/" element={<Home data={data} />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </MantineProvider>
</AuthProvider>
    </Provider>
  );
}
