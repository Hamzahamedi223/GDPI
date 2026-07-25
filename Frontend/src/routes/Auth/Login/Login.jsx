import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UserService from "../UserService";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formRef = useRef(null);
  const panelRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.12 });
    gsap.fromTo(formRef.current, { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.16 });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "L'adresse email est requise.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide.";
    }
    if (!password) newErrors.password = "Le mot de passe est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await UserService.login({ email, password });

      if (response.data.needsVerification) {
        toast.error("Please verify your email before logging in. Check your email for the verification link.");
        return;
      }

      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      toast.success("Connexion reussie !");
      setEmail("");
      setPassword("");
      navigate("/dashboard/dashboard");
    } catch (error) {
      if (error.response?.data?.needsVerification) {
        toast.error("Please verify your email before logging in. Check your email for the verification link.");
      } else {
        toast.error(error.response?.data?.message || "Echec de la connexion ! Verifiez vos identifiants.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f7f8f4] px-4 py-8 text-[#172018]">
      <Toaster />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section ref={panelRef} className="hidden overflow-hidden rounded-2xl bg-[#22351f] text-white shadow-2xl shadow-[#22351f]/20 lg:block">
          <div className="relative min-h-[680px] p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(216,231,202,0.16),transparent_44%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.22))]" />
            <div className="relative z-10 flex h-full min-h-[600px] flex-col justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#22351f]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-black">GDPI Command</p>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Secure access</p>
                </div>
              </Link>

              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#d8e7ca]">Operations console</p>
                <h1 className="max-w-xl text-5xl font-black leading-tight">Reconnectez-vous a votre centre de controle.</h1>
                <p className="mt-6 max-w-md text-base leading-7 text-white/72">
                  Inventaire, pannes, services et utilisateurs restent sous controle dans une interface professionnelle.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["Assets", "Tickets", "Roles"].map((item) => (
                  <div key={item} className="rounded-xl border border-white/15 bg-white/8 p-4">
                    <p className="text-sm font-bold">{item}</p>
                    <p className="mt-1 text-xs text-white/55">Ready</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section ref={formRef} className="mx-auto w-full max-w-md rounded-2xl border border-[#d7ddcf] bg-white p-7 shadow-xl shadow-[#22351f]/8 sm:p-9">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#22351f] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-lg font-black">GDPI Command</span>
          </Link>

          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6f7f35]">Connexion</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Bienvenue</h2>
            <p className="mt-2 text-sm text-[#5b6656]">Accedez a votre tableau de bord securise.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <FieldError message={errors.email}>
              <label htmlFor="email" className="text-sm font-bold text-[#34402f]">Adresse Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8872]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="exemple@domaine.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`w-full rounded-lg border bg-[#fafbf8] py-3 pl-11 pr-3 text-sm outline-none transition focus:border-[#6f7f35] focus:ring-2 focus:ring-[#d8e7ca] ${errors.email ? "border-red-500" : "border-[#cbd4c2]"}`}
                />
              </div>
            </FieldError>

            <FieldError message={errors.password}>
              <label htmlFor="password" className="text-sm font-bold text-[#34402f]">Mot de passe</label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8872]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`w-full rounded-lg border bg-[#fafbf8] py-3 pl-11 pr-11 text-sm outline-none transition focus:border-[#6f7f35] focus:ring-2 focus:ring-[#d8e7ca] ${errors.password ? "border-red-500" : "border-[#cbd4c2]"}`}
                />
                <button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8872] hover:text-[#22351f]">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </FieldError>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22351f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#314a2d] disabled:opacity-70"
            >
              {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>
                <span>Se connecter</span>
                <ArrowRight className="h-5 w-5" />
              </>}
            </button>
          </form>

          <div className="mt-7 space-y-3 text-center text-sm text-[#5b6656]">
            <p>Mot de passe oublie ? <Link to="/auth/Forget" className="font-black text-[#22351f] hover:underline">Reinitialisez-le</Link></p>
            <p>Vous n'avez pas de compte ? <Link to="/auth/signup" className="font-black text-[#22351f] hover:underline">Creez-en un</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
};

const FieldError = ({ children, message }) => (
  <div>
    {children}
    {message && <p className="mt-1 text-xs font-medium text-red-600">{message}</p>}
  </div>
);

export default Login;
