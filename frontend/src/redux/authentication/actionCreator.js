import Cookies from 'js-cookie';
import actions from './actions';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

/**
 * Login action - stores user data in Redux and localStorage
 * Client-side authentication (no JWT/middleware sessions)
 */
const login = (userData) => {
  return async (dispatch) => {
    try {
      dispatch(loginBegin());
      
      // Store in localStorage for persistence across page reloads
      if (typeof window !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
      }
      
      // Set cookie for backward compatibility
      Cookies.set('logedIn', true);
      
      // Store user data in Redux state
      dispatch(loginSuccess(userData || true));
    } catch (err) {
      dispatch(loginErr(err));
    }
  };
};

/**
 * Logout action - clears Redux state, localStorage, and cookies
 * Pure client-side logout (no server session to clear)
 */
const logOut = () => {
  return async (dispatch) => {
    try {
      dispatch(logoutBegin());
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('access_token');
      }
      
      // Remove cookies - try with and without path to ensure they're cleared
      Cookies.remove('logedIn', { path: '/' });
      Cookies.remove('logedIn'); // Also try without path option
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('access_token');
      
      dispatch(logoutSuccess(null));
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

const hydrateAuthFromStorage = () => {
  return async (dispatch) => {
    try {
      if (typeof window === 'undefined') return;

      const storedAuth = localStorage.getItem('isLoggedIn');
      const cookieLoggedIn = Cookies.get('logedIn');

      if (storedAuth === 'true') {
        const storedUser = localStorage.getItem('authUser');
        let userData = true;
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
          } catch {
            userData = true;
          }
        }
        Cookies.set('logedIn', true);
        dispatch(loginSuccess(userData || true));
        return;
      }

      if (cookieLoggedIn) {
        dispatch(loginSuccess(true));
      }
    } catch {
      // ignore hydration errors
    }
  };
};

export { login, logOut, hydrateAuthFromStorage };
