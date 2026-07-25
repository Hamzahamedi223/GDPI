import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UserService from "../UserService";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastShownRef = useRef(false);

  const formRef = useRef(null);
  const panelRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) verifyEmail(token);

    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
    gsap.fromTo(panelRef.current, { x: -28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.12 });
    gsap.fromTo(formRef.current, { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.16 });
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setIsVerifying(true);
    try {
      await UserService.verifyEmail(token);
      setVerificationStatus("success");
      toast.success("Email verified successfully!");
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (error) {
      setVerificationStatus("error");
      toast.error("Email verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = "Le prenom est requis.";
    if (!formData.lastname) newErrors.lastname = "Le nom est requis.";
    if (!formData.username) {
      newErrors.username = "Le nom d'utilisateur est requis.";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caracteres.";
    }
    if (!formData.email) {
      newErrors.email = "L'adresse email est requise.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide.";
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caracteres.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const { confirmPassword, ...signupData } = formData;

    try {
      await UserService.signup(signupData);
      if (!toastShownRef.current) {
        toast.success("Inscription reussie ! Veuillez verifier votre email pour activer votre compte.");
        toastShownRef.current = true;
      }
      navigate("/auth/login");
    } catch (error) {
      if (error.response?.data?.field) {
        setErrors((prev) => ({ ...prev, [error.response.data.field]: error.response.data.message }));
      } else {
        toast.error(error.response?.data?.message || "Echec de l'inscription ! Veuillez reessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return <StatusCard title="Verification en cours" text="Verification de votre email..." loading />;
  }

  if (verificationStatus === "success") {
    return <StatusCard title="Email verifie avec succes" text="Vous allez etre redirige vers la page de connexion." success />;
  }

  if (verificationStatus === "error") {
    return <StatusCard title="Echec de la verification" text="Le lien de verification est invalide ou a expire." action={() => navigate("/auth/login")} />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f7f8f4] px-4 py-8 text-[#172018]">
      <Toaster />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section ref={panelRef} className="hidden overflow-hidden rounded-2xl bg-[#22351f] text-white shadow-2xl shadow-[#22351f]/20 lg:block">
          <div className="relative min-h-[760px] p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(216,231,202,0.16),transparent_44%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.22))]" />
            <div className="relative z-10 flex h-full min-h-[680px] flex-col justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#22351f]">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xl font-black">GDPI Command</p>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">User enrollment</p>
                </div>
              </Link>

              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-[#d8e7ca]">Equipe operationnelle</p>
                <h1 className="max-w-xl text-5xl font-black leading-tight">Creez un acces propre pour chaque utilisateur.</h1>
                <p className="mt-6 max-w-md text-base leading-7 text-white/72">
                  Structurez les comptes, les identites et les permissions avant d'entrer dans le dashboard.
                </p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/8 p-5">
                <p className="text-sm font-bold text-[#d8e7ca]">Standard compte</p>
                <p className="mt-2 text-sm text-white/70">Nom, email, identifiant et mot de passe sont valides avant creation.</p>
              </div>
            </div>
          </div>
        </section>

        <section ref={formRef} className="mx-auto w-full max-w-lg rounded-2xl border border-[#d7ddcf] bg-white p-7 shadow-xl shadow-[#22351f]/8 sm:p-9">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#22351f] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-lg font-black">GDPI Command</span>
          </Link>

          <div className="mb-7">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#6f7f35]">Inscription</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Creer un compte</h2>
            <p className="mt-2 text-sm text-[#5b6656]">Ajoutez vos informations pour rejoindre la plateforme.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="firstname" name="firstname" label="Prenom" placeholder="Votre prenom" value={formData.firstname} onChange={handleChange} error={errors.firstname} icon={User} />
              <TextField id="lastname" name="lastname" label="Nom" placeholder="Votre nom" value={formData.lastname} onChange={handleChange} error={errors.lastname} icon={User} />
            </div>
            <TextField id="username" name="username" label="Nom d'utilisateur" placeholder="Votre nom d'utilisateur" value={formData.username} onChange={handleChange} error={errors.username} icon={User} />
            <TextField id="email" name="email" type="email" label="Adresse Email" placeholder="exemple@domaine.com" value={formData.email} onChange={handleChange} error={errors.email} icon={Mail} />
            <PasswordField id="password" name="password" label="Mot de passe" value={formData.password} onChange={handleChange} error={errors.password} show={showPassword} setShow={setShowPassword} />
            <PasswordField id="confirmPassword" name="confirmPassword" label="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} show={showConfirmPassword} setShow={setShowConfirmPassword} />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22351f] px-4 py-3 text-sm font-black text-white transition hover:bg-[#314a2d] disabled:opacity-70"
            >
              {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>
                <span>S'inscrire</span>
                <ArrowRight className="h-5 w-5" />
              </>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#5b6656]">
            Vous avez deja un compte ? <Link to="/auth/login" className="font-black text-[#22351f] hover:underline">Connectez-vous</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

const inputClass = (error) =>
  `w-full rounded-lg border bg-[#fafbf8] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#6f7f35] focus:ring-2 focus:ring-[#d8e7ca] ${error ? "border-red-500" : "border-[#cbd4c2]"}`;

const TextField = ({ id, name, type = "text", label, placeholder, value, onChange, error, icon: Icon }) => (
  <div>
    <label htmlFor={id} className="text-sm font-bold text-[#34402f]">{label}</label>
    <div className="relative mt-2">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8872]" />
      <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} className={inputClass(error)} />
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const PasswordField = ({ id, name, label, value, onChange, error, show, setShow }) => (
  <div>
    <label htmlFor={id} className="text-sm font-bold text-[#34402f]">{label}</label>
    <div className="relative mt-2">
      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8872]" />
      <input id={id} name={name} type={show ? "text" : "password"} placeholder="********" value={value} onChange={onChange} className={`${inputClass(error)} pr-10`} />
      <button type="button" onClick={() => setShow((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8872] hover:text-[#22351f]">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const StatusCard = ({ title, text, loading, success, action }) => (
  <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
    <div className="w-full max-w-md rounded-2xl border border-[#d7ddcf] bg-white p-8 text-center shadow-xl shadow-[#22351f]/8">
      {loading && <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#22351f] border-t-transparent" />}
      {success && <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#6f7f35]" />}
      <h2 className="text-2xl font-black text-[#172018]">{title}</h2>
      <p className="mt-2 text-sm text-[#5b6656]">{text}</p>
      {action && (
        <button onClick={action} className="mt-6 rounded-lg bg-[#22351f] px-4 py-2 text-sm font-bold text-white hover:bg-[#314a2d]">
          Retour a la connexion
        </button>
      )}
    </div>
  </div>
);

export default Signup;
