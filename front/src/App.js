// App.js - የተሟላ እና ትክክለኛ ኮድ
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom"; 

// ዋና ዋና ገጾች - ሁሉም በትክክል መግባታቸውን ያረጋግጡ
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import HrDashboard from "./components/HrDashboard";
import HRPrintCartPage from "./components/HRPrintCartPage";
import Footer from "./components/Footer";
import PensionData from "./PensionData"; // አዲሱ የጡረታ ገጽ

import logoImg from "./logo.jpg"; // የሎጎ ፋይል መኖር አለበት

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "https://poessa-employee-digital-id.onrender.com";
  const navigate = useNavigate();
  const location = useLocation(); // የትኛዉ ገጽ ላይ እንዳለን ለማወቅ

  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authStatus, setAuthStatus] = useState("");

  // --- Admin Data State ---
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminAddStatus, setAdminAddStatus] = useState("");
  const [projects, setProjects] = useState([]);

  // --- Fetch Functions ---
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) setAdminMessages(data.messages);
    } catch (err) {
      console.error("መልእክቶችን ማምጣት አልተቻለም:", err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (user && user.role === "admin") fetchMessages();
  }, [user, fetchMessages]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.projects)) setProjects(data.projects);
        else if (Array.isArray(data)) setProjects(data);
        else setProjects([]);
      })
      .catch((err) => {
        console.error("ፕሮጀክቶችን ማምጣት አልተቻለም", err);
        setProjects([]);
      });
  }, [API_BASE_URL]);

  // --- Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const isLogin = location.pathname.includes("login");
    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (isLogin) {
          setUser(data.user);
          if (data.user.role === "admin") navigate("/admin-dashboard");
          else navigate("/hr-dashboard");
        } else {
          setAuthStatus("✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።");
          setAuthForm({ name: "", email: "", password: "" });
          navigate("/login");
        }
      } else {
        setAuthStatus(data.error || "የግንኙነት ስህተት ተፈጥሯል");
      }
    } catch (err) {
      setAuthStatus("የሰርቨር ስህተት!");
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  // --- Helper Navigation Component (for HR Dashboard) ---
  const HrNav = ({ current, handleLogout }) => {
    const hrNavigate = useNavigate();
    return (
      <div className="bg-gray-800 px-6 py-3 flex gap-4 border-b border-gray-700 print:hidden">
        <button onClick={() => hrNavigate("/hr-dashboard")} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${current === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}>🏢 ሰራተኛ መመዝገቢያ (Dashboard)</button>
        <button onClick={() => hrNavigate("/hr-print-cart")} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${current === "print-cart" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}>🖨️ መታወቂያ ማተሚያ ጋሪ (Print Cart)</button>
        {/* --- አዲስ አገናኝ ወደ ጡረታ ገጽ --- */}
        <button onClick={() => hrNavigate("/pension-data")} className={`px-4 py-2 rounded-xl text-sm font-bold transition bg-blue-800 text-white hover:bg-blue-900`}>📊 የጡረታ አበል ማሻሻያ</button>

        <button onClick={handleLogout} className="ml-auto px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition">🚪 መውጫ (Logout)</button>
      </div>
    );
  };

  // --- ROUTES ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
      {/* ይህ Nav ለሁሉም ገጽ ይጋራል */}
      <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoImg} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow" />
          <span className="text-xl font-bold text-blue-600">POESSA</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition ${location.pathname === "/login" ? "bg-blue-50 text-blue-700" : "text-blue-600 border border-blue-600 hover:bg-blue-50"}`}>
                Login
              </Link>
              <Link to="/signup" className={`px-4 py-2 text-sm font-medium rounded-lg transition ${location.pathname === "/signup" ? "bg-blue-700 text-white" : "text-white bg-blue-600 hover:bg-blue-700"}`}>
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {/* የገጽ መንገዶች (Routes) */}
        <Routes>
          {/* መነሻ ገጽ (Home) */}
          <Route path="/" element={
            <>
              <header className="max-w-4xl mx-auto px-6 py-16 text-center">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                  ወደ <span className="text-blue-600">የ/ግ/ድ/ሰ/ማ/ዋ/አ</span> እንኳን በሰላም መጡ!
                </h1>
                <p className="text-lg text-gray-600">የሰራተኞች ዲጂታል መታወቂያ እና ማስተዋቂያ ሰሌዳ ማስተዳደሪያ ስርዓት</p>
              </header>
              <div className="max-w-7xl mx-auto px-6 py-10 w-full">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">መለክቶች</h2>
                {projects.length === 0 ? (
                  <p className="text-center text-gray-500">ምንም መረጃ የለም</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((p) => (
                      <div key={p._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition border border-gray-100 flex flex-col">
                        <a href={p.link || "#"} target="_blank" rel="noopener noreferrer" className="overflow-hidden block">
                          <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover hover:scale-105 transition duration-300" />
                        </a>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-800">{p.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          } />

          {/* መግቢያ/ምዝገባ ገጽ */}
          <Route path="/login" element={
            <div className="flex-grow flex items-center justify-center px-4 py-8">
              <div className="w-full max-w-md">
                <Login authMode="login" handleAuthChange={(e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value })} handleAuthSubmit={handleAuthSubmit} authStatus={authStatus} logoImg={logoImg} />
              </div>
            </div>
          } />
          <Route path="/signup" element={
            <div className="flex-grow flex items-center justify-center px-4 py-8">
              <div className="w-full max-w-md">
                <Login authMode="signup" handleAuthChange={(e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value })} handleAuthSubmit={handleAuthSubmit} authStatus={authStatus} logoImg={logoImg} />
              </div>
            </div>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin-dashboard" element={
            user?.role === "admin" ? (
              <AdminDashboard user={user} handleLogout={handleLogout} adminMessages={adminMessages} fetchMessages={fetchMessages} newAdminForm={newAdminForm} handleNewAdminChange={(e) => setNewAdminForm({ ...newAdminForm, [e.target.name]: e.target.value })} handleAddAdminSubmit={async (e) => { e.preventDefault(); const res = await fetch(`${API_BASE_URL}/api/admin/add-admin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newAdminForm), }); const data = await res.json(); if (data.success) { setAdminAddStatus("✅ አድሚን ተፈጥሯል!"); setNewAdminForm({ name: "", email: "", password: "" }); setTimeout(() => setAdminAddStatus(""), 3000); } else setAdminAddStatus(data.error); }} adminAddStatus={adminAddStatus} API_BASE_URL={API_BASE_URL} handleDeleteMessage={async (id) => { if (window.confirm("ማጥፋት ይፈልጋሉ?")) { await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: "DELETE", }); fetchMessages(); } }} projects={projects} setProjects={setProjects} />
            ) : (
              <div className="p-10 text-center text-xl text-red-600">ፈቃድ የለዎትም! እባክዎ ይግቡ።</div>
            )
          } />

          {/* HR Dashboard & Print Cart */}
          <Route path="/hr-dashboard" element={
            user?.role === "hr" ? (
              <div className="flex flex-col min-h-screen bg-gray-900">
                <HrNav current="dashboard" handleLogout={handleLogout} />
                <div className="flex-grow"><HrDashboard user={user} handleLogout={handleLogout} API_BASE_URL={API_BASE_URL} /></div>
              </div>
            ) : <div className="p-10 text-center text-xl text-red-600">ፈቃድ የለዎትም! እባክዎ ይግቡ።</div>
          } />
          <Route path="/hr-print-cart" element={
            user?.role === "hr" ? (
              <div className="flex flex-col min-h-screen bg-gray-900">
                <HrNav current="print-cart" handleLogout={handleLogout} />
                <div className="flex-grow"><HRPrintCartPage handleLogout={handleLogout} API_BASE_URL={API_BASE_URL} /></div>
              </div>
            ) : <div className="p-10 text-center text-xl text-red-600">ፈቃድ የለዎትም! እባክዎ ይግቡ።</div>
          } />

          {/* የቬሪፋይ እይታ */}
          <Route path="/verify/:id" element={
            <HrDashboard user={{ role: "hr", name: "Guest Verifier" }} handleLogout={() => navigate("/")} API_BASE_URL={API_BASE_URL} />
          } />

          {/* --- አዲሱ የጡረታ መረጃ ገጽ --- */}
          <Route path="/pension-data" element={
            <PensionData /> // ይህ ገጽ በPensionData.js ውስጥ መገለጽ አለበት
          } />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
