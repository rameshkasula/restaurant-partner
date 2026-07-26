import { setCookie, getCookie, removeCookie } from './cookies';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setAccessToken = (token: string) => setCookie(ACCESS_TOKEN_KEY, token);
export const getAccessToken = () => getCookie(ACCESS_TOKEN_KEY);
export const removeAccessToken = () => removeCookie(ACCESS_TOKEN_KEY);

export const setRefreshToken = (token: string) => setCookie(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => getCookie(REFRESH_TOKEN_KEY);
export const removeRefreshToken = () => removeCookie(REFRESH_TOKEN_KEY);

export const clearAllAuthData = () => {
  removeAccessToken();
  removeRefreshToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_info');
  }
};
