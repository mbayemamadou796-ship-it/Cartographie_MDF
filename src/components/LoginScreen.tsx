import React, { useState } from 'react';
import { LogoMbok } from './LogoMbok';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, Shield, Check } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
  logoUrl?: string;
  associationName?: string;
  tagline?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  logoUrl,
  associationName = 'Mbok de France',
  tagline = 'au service de la fraternité !'
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Veuillez remplir l\'identifiant et le mot de passe.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(username.trim(), password.trim());
      if (!success) {
        setError('Identifiant ou mot de passe incorrect.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <LogoMbok
            size="lg"
            showText={false}
            logoUrl={logoUrl}
            associationName={associationName}
            tagline={tagline}
            className="mb-3"
          />
          <h1 className="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
            Cartographie <span className="text-emerald-600">MDF</span>
          </h1>
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 mt-1.5">
            {associationName} - {tagline}
          </p>
        </div>

        {/* Title & Introduction */}
        <div className="mb-6 text-center">
          <h2 className="text-base font-bold text-slate-800">
            Espace d'Authentification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Connectez-vous pour accéder à la cartographie et l'annuaire des membres
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Identifiant Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Identifiant <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin ou utilisateur"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Mot de passe Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mot de passe <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] hover:brightness-105 active:scale-[0.99] text-emerald-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">
            Comptes de Démonstration (Accès Rapide)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold transition-colors border border-emerald-200/60 flex flex-col items-center cursor-pointer"
            >
              <span className="font-black text-emerald-900">Admin</span>
              <span className="text-[9px] text-emerald-700 font-mono">admin123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('referent', 'referent123')}
              className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-[11px] font-bold transition-colors border border-blue-200/60 flex flex-col items-center cursor-pointer"
            >
              <span className="font-black text-blue-900">Référent</span>
              <span className="text-[9px] text-blue-700 font-mono">referent123</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('membre', 'user123')}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold transition-colors border border-slate-200 flex flex-col items-center cursor-pointer"
            >
              <span className="font-black text-slate-900">Membre</span>
              <span className="text-[9px] text-slate-600 font-mono">user123</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-5 text-[11px] text-center text-slate-400">
          Système sécurisé Mbok de France • v1.0 MVP
        </p>

      </div>
    </div>
  );
};
