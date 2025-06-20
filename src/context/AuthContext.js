// client/src/context/AuthContext.js
import React, { createContext, useReducer, useContext, useEffect } from 'react';

// 1. Define action types
const LOGIN_SUCCESS      = 'LOGIN_SUCCESS';
const LOGOUT             = 'LOGOUT';
const START_VERIFICATION = 'START_VERIFICATION';
const VERIFY_SUCCESS     = 'VERIFY_SUCCESS';

// 2. Initial state
const initialState = {
  isAuthenticated: false,
  needsVerification: false,
  user: null,       // { email, name? }
  token: null,
};

// 3. Reducer
function authReducer(state, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        needsVerification: false,
        user: action.payload.user,
        token: action.payload.token,
      };
    case START_VERIFICATION:
      return {
        ...state,
        isAuthenticated: false,
        needsVerification: true,
        user: action.payload.user,
        token: null,
      };
    case VERIFY_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        needsVerification: false,
        token: action.payload.token,
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}

// 4. Create Context
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

// 5. Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, try to read token & user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      dispatch({ type: LOGIN_SUCCESS, payload: { user, token } });
    }
  }, []);

  // Persist token & user on login
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
    }
    if (!state.isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.isAuthenticated, state.token, state.user]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// 6. Custom hooks for easy access
export function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error('useAuthState must be used within AuthProvider');
  return ctx;
}

export function useAuthDispatch() {
  const ctx = useContext(AuthDispatchContext);
  if (!ctx) throw new Error('useAuthDispatch must be used within AuthProvider');
  return ctx;
}

// 7. Action creators
export function loginSuccess(dispatch, user, token) {
  dispatch({ type: LOGIN_SUCCESS, payload: { user, token } });
}

export function startVerification(dispatch, user) {
  dispatch({ type: START_VERIFICATION, payload: { user } });
}

export function verifySuccess(dispatch, token) {
  dispatch({ type: VERIFY_SUCCESS, payload: { token } });
}

export function logout(dispatch) {
  dispatch({ type: LOGOUT });
}
