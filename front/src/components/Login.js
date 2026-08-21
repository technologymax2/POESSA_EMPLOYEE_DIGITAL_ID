import React from "react";
import { Link } from "react-router-dom";

function Login({
  authMode,
  authForm,
  handleAuthChange,
  handleAuthSubmit,
  authStatus,
  logoImg,
}) {
  // Safety protection in case authForm is ever missing
  const safeAuthForm = authForm || {
    name: "",
    email: "",
    password: "",
  };

  const isLogin = authMode === "login";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md mx-auto">

      {/* Logo */}
      <div className="text-center mb-8">
        {logoImg && (
          <img
            src={logoImg}
            alt="POESSA Logo"
            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow-md border-2 border-blue-500"
          />
        )}

        <h2 className="text-2xl font-bold text-gray-800">
          {isLogin
            ? "እንኳን ደህና መጡ!"
            : "አዲስ አካውንት ይፍጠሩ"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {isLogin
            ? "ለመቀጠል መረጃዎትን ያስገቡ"
            : "መረጃዎትን በመሙላት ይመዝገቡ"}
        </p>
      </div>

      {/* Status */}
      {authStatus && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-medium text-center ${
            authStatus.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {authStatus}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4">

        {/* Name - Signup only */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              ሙሉ ስም
            </label>

            <input
              type="text"
              name="name"
              required
              placeholder="እባክዎ ሙሉ ስምዎትን ያስገቡ"
              value={safeAuthForm.name}
              onChange={handleAuthChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            ኢሜይል / ዩዘርኔም
          </label>

          <input
            type="text"
            name="email"
            required
            autoComplete="username"
            placeholder="example@mail.com"
            value={safeAuthForm.email}
            onChange={handleAuthChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            ፓስወርድ
          </label>

          <input
            type="password"
            name="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
            value={safeAuthForm.password}
            onChange={handleAuthChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition duration-200 text-sm mt-2"
        >
          {isLogin
            ? "ግባ (Login)"
            : "ተመዝገብ (Sign Up)"}
        </button>
      </form>

      {/* Switch Login / Signup */}
      <div className="mt-6 text-center text-sm text-gray-600">

        {isLogin ? (
          <p>
            አካውንት የለዎትም?{" "}

            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              ተመዝገብ
            </Link>
          </p>
        ) : (
          <p>
            ቀድሞ አካውንት አለዎት?{" "}

            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              ግባ
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;
