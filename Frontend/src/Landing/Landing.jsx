import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, BarChart as ChartBar, FileText, History, Building2 as Hospital, X, Menu, ArrowRight, CheckCircle2, Shield, Zap, Users, Clock, Stethoscope, HeartPulse, Activity, Brain, Mail, Phone, MapPin, Check, Play, Send } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const navLinks = [
    { name: 'Solutions', href: '#solutions' },
    { name: 'Entreprise', href: '#enterprise' },
    { name: 'Contact', href: '#contact' },
  ];

  const features = [
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Gestion Centralisée",
      description: "Plateforme unifiée pour la gestion complète de votre parc d'équipements médicaux"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Conformité & Sécurité",
      description: "Respect des normes ISO 13485 et des réglementations internationales"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Intelligence Prédictive",
      description: "Algorithmes avancés pour anticiper les besoins de maintenance et optimiser les coûts"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support Dédié",
      description: "Équipe d'experts disponible 24/7 pour un accompagnement personnalisé"
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      setMousePosition({ x, y });
    };

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const handleScroll = (e, href) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically send the form data to your backend
    console.log('Formulaire soumis:', formData);
      
      // Clear form and show success message
    setFormData({ name: '', email: '', message: '' });
      alert('Message envoyé avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 text-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_rgba(59,130,246,0.15)_0,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_rgba(59,130,246,0.15)_0,_transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjEgMS43OSA0IDQgNHM0LTEuNzkgNC00LTEuNzktNC00LTQtNCAxLjc5LTQgNHoiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNMTIgMjJjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6IiBmaWxsPSIjZWVlIi8+PC9nPjwvc3ZnPg==')] opacity-5"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-500/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group relative">
              <div className="relative z-10">
                <Hospital className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-2 bg-blue-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight relative z-10">
                Medi<span className="text-blue-500">Tech</span>
              </span>
              <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/10 rounded-xl transition-colors duration-300 -z-0"></div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className="text-gray-600 hover:text-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-50/50 relative group overflow-hidden"
                >
                  <span className="relative z-10">{link.name}</span>
                  <div className="absolute inset-0 h-full w-full bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/auth/login"
                className="relative px-4 py-2 text-gray-600 hover:text-blue-500 text-sm font-medium transition-all duration-300 group"
              >
                <span className="relative z-10">Se connecter</span>
                <div className="absolute inset-0 h-full w-full bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/auth/signup"
                className="relative px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Commencer</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            <button
              className="lg:hidden relative p-2 rounded-lg text-gray-600 hover:text-blue-500 focus:outline-none transition-colors duration-300 group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6 relative z-10" /> : <Menu className="h-6 w-6 relative z-10" />}
              <div className="absolute inset-0 h-full w-full bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-blue-500/10 shadow-lg"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                    className="block px-4 py-2.5 text-gray-600 hover:text-blue-500 text-base font-medium transition-all duration-300 rounded-lg hover:bg-blue-50/50 relative group"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <div className="absolute inset-0 h-full w-full bg-blue-500/0 group-hover:bg-blue-500/5 rounded-lg transition-colors duration-300"></div>
                  </a>
                ))}
                <div className="pt-4 border-t border-blue-500/10">
                  <Link
                    to="/auth/login"
                    className="block px-4 py-2.5 text-gray-600 hover:text-blue-500 text-base font-medium transition-all duration-300 rounded-lg hover:bg-blue-50/50"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="block mt-2 mx-2 px-4 py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 text-base font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left relative"
            >
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-300/10 rounded-full blur-3xl"></div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  Excellence Opérationnelle
                </span>
                <br />
                <span className="text-gray-900">en Santé</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Solution enterprise de pointe pour la gestion des équipements médicaux. 
                Optimisez vos opérations, assurez la conformité et réduisez vos coûts.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link
                  to="/demo"
                  className="group relative px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Demander une démo
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/contact"
                  className="group relative px-8 py-4 border-2 border-blue-500 text-blue-500 rounded-xl hover:bg-blue-50 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Contacter un expert
                    <Phone className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
              <div className="mt-16 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-white flex items-center justify-center shadow-md">
                      <Hospital className="w-6 h-6 text-blue-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1000+</p>
                  <p className="text-gray-600">Établissements de santé partenaires</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                <div className="absolute inset-0.5 bg-white/10 backdrop-blur-3xl rounded-[1.4rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="p-8 h-full flex flex-col items-center justify-center text-white text-center"
                    >
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl">
                        {features[activeFeature].icon}
                      </div>
                      <h3 className="text-2xl font-bold mt-6">{features[activeFeature].title}</h3>
                      <p className="mt-4 text-white/90 leading-relaxed">{features[activeFeature].description}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer">
                <span className="text-2xl font-bold text-white">New</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipment Showcase Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Équipements
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"> Médicaux</span>
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gérez efficacement vos équipements de pointe avec notre solution innovante
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  alt="IRM Medical Equipment"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Imagerie par Résonance Magnétique</h3>
                <p className="text-gray-600">Systèmes IRM de dernière génération avec maintenance prédictive intégrée</p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  alt="Monitoring Equipment"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Moniteurs de Surveillance</h3>
                <p className="text-gray-600">Équipements de surveillance connectés pour un suivi en temps réel</p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  alt="Laboratory Equipment"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Équipements de Laboratoire</h3>
                <p className="text-gray-600">Instruments de précision avec traçabilité complète</p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-500 rounded-xl border-2 border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <span>Voir tous les équipements</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="solutions" className="py-32 scroll-mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Fonctionnalités{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Principales
              </span>
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez comment notre solution peut transformer votre gestion d'équipements
              avec des fonctionnalités innovantes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-8 h-8 text-blue-500">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section id="enterprise" className="py-24 bg-gradient-to-r from-blue-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute inset-0 bg-blue-600/20"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <StatCard icon={<Users className="w-8 h-8" />} number="500+" label="Clients Satisfaits" />
            <StatCard icon={<Monitor className="w-8 h-8" />} number="10k+" label="Équipements Gérés" />
            <StatCard icon={<CheckCircle2 className="w-8 h-8" />} number="99.9%" label="Disponibilité" />
            <StatCard icon={<Clock className="w-8 h-8" />} number="24/7" label="Support Client" />
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-32 scroll-mt-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-100 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Contactez{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Nous
              </span>
            </motion.h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Une question ? N'hésitez pas à nous contacter. Notre équipe est là pour vous aider
              et répondre à toutes vos questions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
              <div className="relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                      placeholder="Votre message..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                  >
                    <span>Envoyer le message</span>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:pt-8"
            >
              <div className="space-y-8">
                <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600 hover:text-blue-500 transition-colors duration-300">contact@meditech.com</p>
                    <p className="text-gray-600 hover:text-blue-500 transition-colors duration-300">support@meditech.com</p>
                  </div>
                </div>

                <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Téléphone</h3>
                    <p className="text-gray-600">+216 88 888 888</p>
                    <p className="text-gray-600">Lun - Ven, 9h - 18h</p>
                  </div>
                </div>

                <div className="group flex items-start gap-6 p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Adresse</h3>
                    <p className="text-gray-600">Tunisia Mahdia</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100/50 shadow-lg">
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Horaires d'ouverture</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Lundi - Vendredi</span>
                    <span className="px-4 py-1 bg-blue-100/50 rounded-full text-blue-600">9h - 18h</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Samedi</span>
                    <span className="px-4 py-1 bg-blue-100/50 rounded-full text-blue-600">10h - 15h</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Dimanche</span>
                    <span className="px-4 py-1 bg-red-100/50 rounded-full text-red-600">Fermé</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <Hospital className="h-10 w-10 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-2 bg-blue-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  Medi<span className="text-blue-500">Tech</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Optimisez la gestion de vos équipements avec notre solution intelligente
                et innovante.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </a>
                <a href="#" className="group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                </a>
                <a href="#" className="group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all duration-300">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-6">Produit</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#solutions" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Fonctionnalités</span>
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Tarifs</span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-6">Entreprise</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>À propos</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Blog</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Carrières</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-sm font-semibold mb-6">Mentions légales</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Politique de confidentialité</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Conditions d'utilisation</span>
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span>Cookies</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-500/10">
            <div className="text-center text-sm text-gray-600">
              <p>© {new Date().getFullYear()} MediTech. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, number, label }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center text-white group"
  >
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
      {number}
    </div>
    <div className="text-blue-100 font-medium">{label}</div>
  </motion.div>
);

export default Landing;
