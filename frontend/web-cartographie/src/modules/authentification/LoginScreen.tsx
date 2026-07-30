import React, { useState } from 'react';
import { LogoMbok } from '../parametres/LogoMbok';
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

        {/* Footer info */}
        <p className="mt-5 text-[11px] text-center text-slate-400">
          Système sécurisé Mbok de France • v1.0 MVP
        </p>

      </div>
    </div>
  );
};
