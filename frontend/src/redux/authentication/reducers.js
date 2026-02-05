import Cookies from 'js-cookie';
import actions from './actions';

const { LOGIN_BEGIN, LOGIN_SUCCESS, LOGIN_ERR, LOGOUT_BEGIN, LOGOUT_SUCCESS, LOGOUT_ERR } = actions;

// Initialize state from localStorage if available (for persistence across reloads)
let initialLoginState = Cookies.get('logedIn') || false;
if (typeof window !== 'undefined') {
  try {
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth === 'true') {
      initialLoginState = true;
      // Optionally restore full user data if stored
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          initialLoginState = JSON.parse(storedUser);
        } catch (e) {
          // If parsing fails, just use boolean
        }
      }
    }
  } catch (e) {
    // localStorage might not be available (SSR)
  }
}

const initState = {
  login: initialLoginState,
  loading: false,
  error: null,
};

/**
 *
 * @todo impure state mutation/explaination
 */
const AuthReducer = (state = initState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        login: data,
        loading: false,
      };
    case LOGIN_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case LOGOUT_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        login: data,
        loading: false,
      };
    case LOGOUT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
};
export default AuthReducer;
