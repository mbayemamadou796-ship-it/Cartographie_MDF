export const authController = {
  login: async (username: string, password: string) => {
    // Authentification RBAC backend
    if (username === 'admin' && password === 'admin123') {
      return { id: 'usr-admin', name: 'Administrateur MDF', role: 'admin' };
    }
    if (username === 'referent' && password === 'referent123') {
      return { id: 'usr-referent-idf', name: 'Aïssatou Diallo', role: 'referent', region: 'Île-de-France' };
    }
    if (username === 'membre' && password === 'user123') {
      return { id: 'usr-user', name: 'Mamadou Sow', role: 'user' };
    }
    throw new Error('Identifiants incorrects');
  }
};
