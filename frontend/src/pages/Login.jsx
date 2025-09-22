'use client';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { setDoc, doc, collection, getDoc } from "firebase/firestore";

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
  // Captcha tipo checkbox simulado
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const resetCaptcha = () => {
    setCaptchaChecked(false);
    setCaptchaError("");
  };
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
    if (!captchaChecked) {
      setCaptchaError("Por favor confirma que no eres un robot.");
      setLoading(false);
      return;
    }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
        const user = userCredential.user;
        // Guardar el usuario en Firestore con el correo como ID
        await setDoc(
          doc(collection(db, "users"), user.email),
          {
            nombre: signupData.name,
            rol: "usuario",
            email: signupData.email
          }
        );
        setSuccess("¡Cuenta creada exitosamente!");
        setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
        navigate("/compras");
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
    setCaptchaError("");
    if (!captchaChecked) {
      setCaptchaError("Por favor confirma que no eres un robot.");
      setLoading(false);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const user = userCredential.user;
      // Leer el rol desde Firestore
      const userDocRef = doc(collection(db, "users"), user.email);
      const userDocSnap = await getDoc(userDocRef);
      const rol = userDocSnap.exists() ? userDocSnap.data().rol : "usuario";
      setSuccess("¡Inicio de sesión exitoso!");
      resetCaptcha();
      if (rol === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/compras");
      }
    } catch (err) {
      setError(getFriendlyError(err.message));
      resetCaptcha();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        // Solo crea el documento si no existe, para no sobreescribir el rol
        const userDocRef = doc(collection(db, "users"), user.email);
        let rol = "usuario";
        let nombre = user.displayName || "";
        let userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(
            userDocRef,
            {
              nombre,
              rol,
              email: user.email
            }
          );
        } else {
          // Si ya existe, usa el rol y nombre guardados
          const data = userDocSnap.data();
          rol = data.rol || "usuario";
          nombre = data.nombre || nombre;
        }
        setSuccess("¡Inicio de sesión con Google exitoso!");
        setTimeout(() => {
          if (rol === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/compras");
          }
          window.location.reload();
        }, 600);
      }
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center items-start pt-16">
      <div className="container mx-auto px-4 ">
        <div className={`w-full max-w-lg mx-auto bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-500 flex flex-col ${
              tab === "signup" ? "min-h-[700px]" : "min-h-[600px]"
            }`}>

          <div className="text-center py-6 bg-gray-800 text-white rounded-t-lg">
            <h1 className="text-3xl font-bold">Bienvenido</h1>
            <p className="mt-2 text-gray-300">Ingresa al Mini-Sistema POS</p>
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
                  {/* ...existing code... */}
                  {/* Captcha tipo checkbox simulado estilo Google, debajo de los campos de texto */}
                  <div className="w-full flex justify-center">
                    <div className="flex items-center gap-3 mb-2 bg-white border border-gray-300 rounded shadow-sm px-4 py-3" style={{maxWidth:'340px', width:'100%'}}>
                      <input
                        type="checkbox"
                        id="captcha-login"
                        checked={captchaChecked}
                        onChange={e => setCaptchaChecked(e.target.checked)}
                        className="accent-blue-600 w-5 h-5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500"
                        style={{boxShadow:'0 1px 4px rgba(0,0,0,0.10)'}}
                      />
                      <label htmlFor="captcha-login" className="select-none text-base font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-block"><i className="fas fa-robot text-blue-500 mr-1"></i></span>
                        No soy un robot
                      </label>
                      <span className="ml-auto"><img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="Google" className="w-8 h-8" /></span>
                    </div>
                  </div>
                  {captchaError && <div className="text-red-500 text-xs mb-2 text-center">{captchaError}</div>}
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
                      className={`bg-gray-800 text-white px-4 py-2 rounded-md transition flex items-center ${(!captchaChecked || loading) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                      onClick={handleGoogleLogin}
                      disabled={loading || !captchaChecked}
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
                  {/* ...existing code... */}
                  {/* Captcha tipo checkbox simulado estilo Google, debajo de los campos de texto */}
                  <div className="w-full flex justify-center">
                    <div className="flex items-center gap-3 mb-2 bg-white border border-gray-300 rounded shadow-sm px-4 py-3" style={{maxWidth:'340px', width:'100%'}}>
                      <input
                        type="checkbox"
                        id="captcha-signup"
                        checked={captchaChecked}
                        onChange={e => setCaptchaChecked(e.target.checked)}
                        className="accent-blue-600 w-5 h-5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500"
                        style={{boxShadow:'0 1px 4px rgba(0,0,0,0.10)'}}
                      />
                      <label htmlFor="captcha-signup" className="select-none text-base font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-block"><i className="fas fa-robot text-blue-500 mr-1"></i></span>
                        No soy un robot
                      </label>
                      <span className="ml-auto"><img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="Google" className="w-8 h-8" /></span>
                    </div>
                  </div>
                  {captchaError && <div className="text-red-500 text-xs mb-2 text-center">{captchaError}</div>}
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