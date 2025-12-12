import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, User, ArrowRight, ScanFace } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const { isAuthenticated, loading: authLoading } = useAuth(); // Destructure isAuthenticated and loading

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Prevent flashing login form while checking auth status
  if (authLoading) return null;
  if (isAuthenticated) return null; // Double check to prevent form render before redirect logic kicks in

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Simulate smoother entry feel
    setTimeout(async () => {
      const result = await login(username, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setErrorMsg(result.message);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-500 bg-[url('https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-900/90 before:to-slate-900/90 dark:before:from-slate-900/95 dark:before:to-black/90">
      <div className="relative w-full max-w-md perspective-1000">
        {/* Glass Card */}
        <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-3xl shadow-2xl shadow-blue-500/20 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
              <img
                src="/logo_dinas.png"
                alt="Logo Dinas Pendidikan"
                className="relative w-full h-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Dinas Pendidikan
            </h2>
            <p className="text-blue-100/80 mt-2 text-sm font-medium">
              Kabupaten Cirebon
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start animate-in slide-in-from-top-2">
              <ScanFace className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div
              className={`relative transition-all duration-300 ${
                focusedInput === "username" ? "scale-[1.02]" : ""
              }`}
            >
              <label className="block text-xs font-bold text-blue-100 mb-1.5 uppercase tracking-wider ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 transition-colors ${
                      focusedInput === "username"
                        ? "text-blue-400"
                        : "text-blue-200/50"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200/30 outline-none transition-all"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedInput("username")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>

            <div
              className={`relative transition-all duration-300 ${
                focusedInput === "password" ? "scale-[1.02]" : ""
              }`}
            >
              <label className="block text-xs font-bold text-blue-100 mb-1.5 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 transition-colors ${
                      focusedInput === "password"
                        ? "text-blue-400"
                        : "text-blue-200/50"
                    }`}
                  />
                </div>
                <input
                  type="password"
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-blue-200/30 outline-none transition-all"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] mt-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-blue-300 group-hover:to-indigo-300 transition-colors"></div>
              <div className="relative bg-black/20 backdrop-blur-sm group-hover:bg-transparent transition-all w-full h-full rounded-2xl py-3.5 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center gap-2 text-white font-bold">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-white font-bold tracking-wide">
                    Masuk Sistem{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-blue-200/40">
              &copy; {new Date().getFullYear()} Dinas Pendidikan Kab. Cirebon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
