// Logout.js
import React from 'react';
import userManager from './oidc-client';

const Logout = () => {
    const handleLogout = () => {
        userManager.signoutRedirect();
    };

    return (
            <div>
                <button onClick={handleLogout}>Logout</button>
            </div>
            );
};

export default Logout;
