/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<any>;
    login: (username: string, password: string) => Promise<{
      success: boolean;
      user?: {
        id: number;
        username: string;
        full_name: string;
        role: string;
        gym_id: number;
        gym_name: string;
        gym_type: 'male' | 'female';
      };
      message?: string;
    }>;
    createUser: (userData: {
      username: string;
      password: string;
      full_name: string;
      role: string;
      gym_id: number;
      is_active: boolean;
    }) => Promise<{
      success: boolean;
      result?: any;
      message?: string;
      error?: string;
    }>;
    updateUser: (userId: number, userData: {
      username: string;
      password?: string;
      full_name: string;
      role: string;
      gym_id: number;
      is_active: boolean;
    }) => Promise<{
      success: boolean;
      result?: any;
      message?: string;
      error?: string;
    }>;
    // Database management
    backupDatabase: () => Promise<{ success: boolean; path?: string; error?: string; }>;
    restoreDatabase: () => Promise<{ success: boolean; error?: string; }>;
    repairDatabase: () => Promise<{ success: boolean; error?: string; }>;
    // Debug
    debugUsers: () => Promise<{
      users?: any[];
      gyms?: any[];
      error?: string;
    }>;
    debugPasswords: () => Promise<{
      users?: any[];
      error?: string;
    }>;
    debugLogin: (username: string, password: string) => Promise<{
      success: boolean;
      user?: any;
      message?: string;
      error?: string;
    }>;
    // System info
    platform: string;
    appVersion: () => Promise<string>;
    // Window controls
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    // Dialog
    showMessage: (options: { title: string; message: string; }) => Promise<void>;
    showError: (title: string, message: string) => Promise<void>;
    showConfirm: (options: { title: string; message: string; }) => Promise<boolean>;
  };
}
