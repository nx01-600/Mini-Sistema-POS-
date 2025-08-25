'use client';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { setDoc, doc, collection } from "firebase/firestore";

// Traducción de errores comunes de Firebase
function getFriendlyError(error) {
  if (!error) return "";
  if (error.includes("auth/email-already-in-use")) return "El correo ya está registrado.";
  if (error.includes("auth/invalid-email")) return "El correo no es válido.";
  if (error.includes("auth/weak-password")) return "La contraseña es demasiado débil (mínimo 6 caracteres).";
  if (error.includes("auth/user-not-found")) return "No existe una cuenta con ese correo.";
  if (error.includes("auth/wrong-password")) return "La contraseña es incorrecta.";
  if (error.includes("auth/popup-closed-by-user")) return "La ventana de Google se cerró antes de iniciar sesión.";
  return "Ocurrió un error. Por favor verifica tus datos.";
}

export default function SignupLogin() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSignupChange = e => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };
  const handleLoginChange = e => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignup = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (signupData.password !== signupData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      await setDoc(
        doc(collection(db, "users"), signupData.email),
        {
          nombre: signupData.name,
          rol: "usuario",
          email: signupData.email
        }
      );
      setSuccess("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
    setLoading(false);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      setSuccess("¡Inicio de sesión exitoso!");
      navigate("/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("¡Inicio de sesión con Google exitoso!");
      navigate("/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center items-start pt-16">
      <div className="container mx-auto px-4 ">
        <div className={`w-full max-w-lg mx-auto bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-500 flex flex-col ${
              tab === "signup" ? "min-h-[600px]" : "min-h-[500px]"
            }`}>

          <div className="text-center py-6 bg-gray-800 text-white rounded-t-lg">
            <h1 className="text-3xl font-bold">Bienvenido</h1>
            <p className="mt-2 text-gray-300">Únete a nuestra comunidad</p>
          </div>
          <div className="p-8 transition-all duration-500 flex-1">
            <div className="flex justify-center mb-6">
              <button
                onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
                className={`px-4 py-2 rounded-l-md focus:outline-none transition-colors duration-300 ${
                  tab === "login"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}
                className={`px-4 py-2 rounded-r-md focus:outline-none transition-colors duration-300 ${
                  tab === "signup"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Registrarse
              </button>
            </div>
            <div className="relative transition-all duration-500">
              {/* Login a la izquierda */}
              <div
                className={`absolute inset-0 w-full transition-all duration-500 ${
                  tab === "login"
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 -translate-x-4 pointer-events-none z-0"
                }`}
              >
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Correo electrónico"
                      required
                    />
                    <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Contraseña"
                      required
                    />
                    <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                      tabIndex={-1}
                      onClick={() => setShowLoginPassword(v => !v)}
                    >
                      <i className={`fas ${showLoginPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Cargando..." : "Iniciar sesión"}
                  </button>
                  {/* Mensaje de error o éxito */}
                  {error && (
                    <p className="mt-2 text-sm text-red-600 font-medium text-center">{error}</p>
                  )}
                  {success && (
                    <p className="mt-2 text-sm text-green-600 font-medium text-center">{success}</p>
                  )}
                </form>
                {/* Sección Google más pegada al formulario */}
                <div className="mt-4">
                  <p className="text-center text-gray-600 mb-2">O continúa con</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition flex items-center"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <i className="fab fa-google mr-2"></i> Google
                    </button>
                  </div>
                </div>
              </div>
              {/* Signup a la derecha */}
              <div
                className={`absolute inset-0 w-full transition-all duration-500 ${
                  tab === "signup"
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 translate-x-4 pointer-events-none z-0"
                }`}
              >
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Nombre completo"
                      required
                    />
                    <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Correo electrónico"
                      required
                    />
                    <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Contraseña"
                      required
                    />
                    <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                      tabIndex={-1}
                      onClick={() => setShowSignupPassword(v => !v)}
                    >
                      <i className={`fas ${showSignupPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignupConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 pl-10 text-gray-800 bg-gray-50"
                      placeholder="Confirmar contraseña"
                      required
                    />
                    <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                      tabIndex={-1}
                      onClick={() => setShowSignupConfirm(v => !v)}
                    >
                      <i className={`fas ${showSignupConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Cargando..." : "Registrarse"}
                  </button>
                  {/* Mensaje de error o éxito */}
                  {error && (
                    <p className="mt-2 text-sm text-red-600 font-medium text-center">{error}</p>
                  )}
                  {success && (
                    <p className="mt-2 text-sm text-green-600 font-medium text-center">{success}</p>
                  )}
                </form>
                {/* Sección Google más pegada al formulario */}
                <div className="mt-4">
                  <p className="text-center text-gray-600 mb-2">O continúa con</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition flex items-center"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <i className="fab fa-google mr-2"></i> Google
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        body {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
}