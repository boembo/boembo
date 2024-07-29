import '@mantine/core/styles.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HeaderTabs } from './components/HeaderTabs/HeaderTabs';
import { DoubleNavbar } from './components/DoubleNavbar/DoubleNavbar';
import { Home } from './components/Home/Home';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import store from './store/configureStore';
import './index.css';
import Login from './components/Login/Login';
import Logout from './components/Login/Logout';

import { AuthProvider } from './context/AuthContext';
import ProjectContent from './components/ProjectContent/ProjectContent';

export default function App() {
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
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/project/:projectId" element={<ProjectContent />} />
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
