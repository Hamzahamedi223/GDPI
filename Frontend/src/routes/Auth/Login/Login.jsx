import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UserService from "../UserService";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Background animation
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" }
    );

    // Form animation
    gsap.fromTo(
      formRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
    );

    // Image animation
    gsap.fromTo(
      imageRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "L'adresse email est requise.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide.";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const credentials = { email, password };

    try {
      const response = await UserService.login(credentials);
      
      if (response.data.needsVerification) {
        toast.error("Please verify your email before logging in. Check your email for the verification link.");
        return;
      }

      console.log("Full Login Response:", response.data);
      console.log("User Data Structure:", {
        user: response.data.user,
        hasDepartment: !!response.data.user?.department,
        departmentData: response.data.user?.department,
        role: response.data.user?.role
      });
      
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      toast.success("Connexion réussie !");
      setEmail("");
      setPassword("");
      navigate("/dashboard/dashboard");
    } catch (error) {
      if (error.response?.data?.needsVerification) {
        toast.error("Please verify your email before logging in. Check your email for the verification link.");
      } else {
        toast.error(error.response?.data?.message || "Échec de la connexion ! Vérifiez vos identifiants.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <Toaster />
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 relative z-10">
        {/* Image à gauche */}
        <div className="hidden md:block relative overflow-hidden" ref={imageRef}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 mix-blend-overlay" />
          <img
  src="/aa.jpg"
  alt="Medical Technology"
  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
/>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center p-8 bg-black/20 backdrop-blur-sm rounded-2xl max-w-md">
              <h3 className="text-2xl font-bold mb-2">Gestion Intelligente d'Équipements</h3>
              <p className="text-white/90">Optimisez votre parc médical avec notre solution innovante</p>
            </div>
          </div>
        </div>

        {/* Formulaire à droite */}
        <div className="p-8 sm:p-12" ref={formRef}>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Bienvenue</h2>
            <p className="text-gray-600">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
              />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              <input
                id="password"
                  type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200`}
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Mot de passe oublié ?{" "}
              <a href="/auth/Forget" className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200">
                Réinitialisez-le ici
              </a>
            </p>
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <a href="/auth/signup" className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200">
                Créez-en un
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
