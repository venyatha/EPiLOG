import Cookies from 'js-cookie';

const TOKEN_KEY = 'epilog_token';

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}
