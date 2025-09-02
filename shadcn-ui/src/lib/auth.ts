export interface User {
  id: string;
  email: string;
  dailyCalorieGoal: number;
}

export interface AuthData {
  users: Array<{ id: string; email: string; password: string; dailyCalorieGoal: number }>;
  currentUser: User | null;
}

const AUTH_STORAGE_KEY = 'nutrilearn_auth';

export const getAuthData = (): AuthData => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { users: [], currentUser: null };
};

export const saveAuthData = (data: AuthData): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
};

export const signUp = (email: string, password: string, dailyCalorieGoal: number = 2000): boolean => {
  const authData = getAuthData();
  
  // Check if user already exists
  if (authData.users.find(user => user.email === email)) {
    return false;
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    dailyCalorieGoal
  };
  
  authData.users.push(newUser);
  authData.currentUser = { id: newUser.id, email: newUser.email, dailyCalorieGoal: newUser.dailyCalorieGoal };
  saveAuthData(authData);
  
  return true;
};

export const login = (email: string, password: string): boolean => {
  const authData = getAuthData();
  const user = authData.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    authData.currentUser = { id: user.id, email: user.email, dailyCalorieGoal: user.dailyCalorieGoal };
    saveAuthData(authData);
    return true;
  }
  
  return false;
};

export const logout = (): void => {
  const authData = getAuthData();
  authData.currentUser = null;
  saveAuthData(authData);
};

export const getCurrentUser = (): User | null => {
  return getAuthData().currentUser;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};