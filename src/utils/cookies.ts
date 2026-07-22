import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
  Cookies.set(name, value, { secure: true, sameSite: 'strict', ...options });
};

export const getCookie = (name: string) => {
  return Cookies.get(name);
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
  Cookies.remove(name, options);
};
