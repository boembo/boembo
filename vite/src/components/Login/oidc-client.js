import { UserManager, WebStorageStateStore } from 'oidc-client';
        const settings = {
        authority: 'https://accounts.google.com',
                client_id: '868808932730-mce503fm76m3j4t11nvfjd5p0mll94dd.apps.googleusercontent.com',
                redirect_uri: 'http://localhost:3000/auth/callback', // Adjust based on your setup
                response_type: 'code',
                scope: 'openid profile email', // Adjust as needed
                post_logout_redirect_uri: 'http://localhost:3000/', // Adjust as needed
                };
        const userManager = new UserManager({
        ...settings,
                userStore: new WebStorageStateStore({ store: window.localStorage }),
                });
export default userManager;
