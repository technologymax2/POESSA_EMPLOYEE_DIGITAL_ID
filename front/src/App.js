// App.js
// የተሟላ እና የተስተካከለ App.js

import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

// ==========================================
// COMPONENT IMPORTS
// ==========================================
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import HrDashboard from "./components/HrDashboard";
import HRPrintCartPage from "./components/HRPrintCartPage";
import Footer from "./components/Footer";
import PensionData from "./components/PensionData";

import logoImg from "./logo.jpg";

// ==========================================
// APP COMPONENT
// ==========================================
function App() {
  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://poessa-employee-digital-id.onrender.com";

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // AUTH STATE
  // ==========================================
  const [user, setUser] = useState(null);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [authStatus, setAuthStatus] = useState("");

  // ==========================================
  // ADMIN STATE
  // ==========================================
  const [adminMessages, setAdminMessages] = useState([]);

  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [adminAddStatus, setAdminAddStatus] = useState("");

  // ==========================================
  // PROJECT STATE
  // ==========================================
  const [projects, setProjects] = useState([]);

  // ==========================================
  // LOAD SAVED USER
  // ==========================================
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("poessa_user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("poessa_user");
        }
      }
    } catch (error) {
      console.error("Saved user ማንበብ አልተቻለም:", error);
      localStorage.removeItem("poessa_user");
    }
  }, []);

  // ==========================================
  // FETCH ADMIN MESSAGES
  // ==========================================
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/messages`
      );

      if (!response.ok) {
        throw new Error(
          `Messages request failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.messages)) {
        setAdminMessages(data.messages);
      } else {
        setAdminMessages([]);
      }
    } catch (error) {
      console.error(
        "መልእክቶችን ማምጣት አልተቻለም:",
        error
      );

      setAdminMessages([]);
    }
  }, [API_BASE_URL]);

  // ==========================================
  // LOAD ADMIN MESSAGES WHEN ADMIN LOGS IN
  // ==========================================
  useEffect(() => {
    if (user?.role === "admin") {
      fetchMessages();
    }
  }, [user, fetchMessages]);

  // ==========================================
  // FETCH PROJECTS
  // ==========================================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/projects`
        );

        if (!response.ok) {
          throw new Error(
            `Projects request failed: ${response.status}`
          );
        }

        const data = await response.json();

        if (data && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error(
          "ፕሮጀክቶችን ማምጣት አልተቻለም:",
          error
        );

        setProjects([]);
      }
    };

    fetchProjects();
  }, [API_BASE_URL]);

  // ==========================================
  // AUTH INPUT CHANGE
  // ==========================================
  const handleAuthChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (authStatus) {
      setAuthStatus("");
    }
  };

  // ==========================================
  // LOGIN / SIGNUP
  // ==========================================
  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const isLogin = location.pathname === "/login";

    const url = isLogin
      ? "/api/auth/login"
      : "/api/auth/signup";

    setAuthStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authForm),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // ==========================================
      // SUCCESS
      // ==========================================
      if (response.ok && data.success) {
        // ------------------------------------------
        // LOGIN
        // ------------------------------------------
        if (isLogin) {
          if (!data.user || typeof data.user !== "object") {
            setAuthStatus(
              "የመግቢያ መረጃው ትክክል አይደለም።"
            );
            return;
          }

          // Make sure user has a valid role
          const loggedInUser = {
            ...data.user,
            role: data.user.role || "hr",
          };

          setUser(loggedInUser);

          // Save user so refresh does not immediately lose it
          localStorage.setItem(
            "poessa_user",
            JSON.stringify(loggedInUser)
          );

          // ------------------------------------------
          // ROLE-BASED REDIRECT
          // ------------------------------------------
          if (loggedInUser.role === "admin") {
            navigate("/admin-dashboard");
          } else if (loggedInUser.role === "hr") {
            navigate("/hr-dashboard");
          } else {
            // Unknown role
            setAuthStatus(
              "የተጠቃሚው የስራ ድርሻ (role) አይታወቅም።"
            );

            setUser(null);
            localStorage.removeItem("poessa_user");
          }
        }

        // ------------------------------------------
        // SIGNUP
        // ------------------------------------------
        else {
          setAuthStatus(
            "✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።"
          );

          setAuthForm({
            name: "",
            email: "",
            password: "",
          });

          navigate("/login");
        }
      }

      // ==========================================
      // SERVER ERROR / AUTH ERROR
      // ==========================================
      else {
        setAuthStatus(
          data?.error ||
            data?.message ||
            "የግንኙነት ስህተት ተፈጥሯል።"
        );
      }
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthStatus(
        "የሰርቨር ስህተት! እባክዎ እንደገና ይሞክሩ።"
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    setUser(null);

    setAuthForm({
      name: "",
      email: "",
      password: "",
    });

    setAuthStatus("");

    localStorage.removeItem("poessa_user");

    navigate("/");
  };

  // ==========================================
  // ADD ADMIN
  // ==========================================
  const handleAddAdminSubmit = async (event) => {
    event.preventDefault();

    setAdminAddStatus("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/add-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAdminForm),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok && data.success) {
        setAdminAddStatus("✅ አድሚን ተፈጥሯል!");

        setNewAdminForm({
          name: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          setAdminAddStatus("");
        }, 3000);
      } else {
        setAdminAddStatus(
          data?.error ||
            data?.message ||
            "አድሚን መፍጠር አልተቻለም።"
        );
      }
    } catch (error) {
      console.error("Add admin error:", error);

      setAdminAddStatus(
        "የሰርቨር ስህተት! አድሚን መፍጠር አልተቻለም።"
      );
    }
  };

  // ==========================================
  // DELETE ADMIN MESSAGE
  // ==========================================
  const handleDeleteMessage = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "ይህን መልእክት ማጥፋት ይፈልጋሉ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/messages/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete failed: ${response.status}`
        );
      }

      await fetchMessages();
    } catch (error) {
      console.error(
        "መልእክት ማጥፋት አልተቻለም:",
        error
      );

      alert(
        "መልእክቱን ማጥፋት አልተቻለም።"
      );
    }
  };

  // ==========================================
  // HR NAVIGATION
  // ==========================================
  const HrNav = ({ current, handleLogout }) => {
    const hrNavigate = useNavigate();

    const getButtonClass = (page) => {
      return `
        px-4 py-2
        rounded-xl
        text-sm
        font-bold
        transition
        whitespace-nowrap
        ${
          current === page
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }
      `;
    };

    return (
      <div
        className="
          bg-gray-800
          px-4
          sm:px-6
          py-3
          flex
          flex-wrap
          items-center
          gap-3
          border-b
          border-gray-700
          print:hidden
        "
      >
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => hrNavigate("/hr-dashboard")}
          className={getButtonClass("dashboard")}
        >
          🏢 ሰራተኛ መመዝገቢያ
        </button>

        {/* Print Cart */}
        <button
          type="button"
          onClick={() => hrNavigate("/hr-print-cart")}
          className={getButtonClass("print-cart")}
        >
          🖨️ መታወቂያ ማተሚያ
        </button>

        {/* Pension Data */}
        <button
          type="button"
          onClick={() => hrNavigate("/pension-data")}
          className={getButtonClass("pension-data")}
        >
          📊 የጡረታ አበል ማሻሻያ
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="
            sm:ml-auto
            px-4
            py-2
            rounded-xl
            text-sm
            font-bold
            bg-red-600
            text-white
            hover:bg-red-700
            transition
            whitespace-nowrap
          "
        >
          🚪 መውጫ
        </button>
      </div>
    );
  };

  // ==========================================
  // ACCESS DENIED COMPONENT
  // ==========================================
  const AccessDenied = ({ message }) => {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">🔒</div>

          <h2 className="text-2xl font-bold text-red-600 mb-3">
            ፈቃድ የለዎትም
          </h2>

          <p className="text-gray-600 mb-6">
            {message ||
              "እባክዎ በትክክለኛው መለያ ይግቡ።"}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              px-6
              py-3
              rounded-xl
              bg-blue-600
              text-white
              font-bold
              hover:bg-blue-700
              transition
            "
          >
            ወደ Login ይመለሱ
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* ========================================
          MAIN NAVIGATION
      ======================================== */}
      <nav
        className="
          w-full
          bg-white
          shadow-sm
          px-4
          sm:px-6
          py-4
          flex
          justify-between
          items-center
          sticky
          top-0
          z-50
        "
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src={logoImg}
            alt="POESSA Logo"
            className="
              w-10
              h-10
              rounded-full
              object-cover
              shadow
            "
          />

          <span className="text-xl font-bold text-blue-600">
            POESSA
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User name */}
              <span className="hidden sm:block text-sm text-gray-600">
                {user?.name || user?.email || "User"}
              </span>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-600
                  border
                  border-red-600
                  rounded-lg
                  hover:bg-red-50
                  transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className={`
                  px-4
                  py-2
                  text-sm
                  font-medium
                  rounded-lg
                  transition
                  ${
                    location.pathname === "/login"
                      ? "bg-blue-50 text-blue-700"
                      : "text-blue-600 border border-blue-600 hover:bg-blue-50"
                  }
                `}
              >
                Login
              </Link>

              {/* Signup */}
              <Link
                to="/signup"
                className={`
                  px-4
                  py-2
                  text-sm
                  font-medium
                  rounded-lg
                  transition
                  ${
                    location.pathname === "/signup"
                      ? "bg-blue-700 text-white"
                      : "text-white bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}
      <main className="flex-grow">
        <Routes>

          {/* ======================================
              HOME
          ====================================== */}
          <Route
            path="/"
            element={
              <>
                <header className="max-w-4xl mx-auto px-6 py-16 text-center">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                    ወደ{" "}
                    <span className="text-blue-600">
                      የ/ግ/ድ/ሰ/ማ/ዋ/አ
                    </span>{" "}
                    እንኳን በሰላም መጡ!
                  </h1>

                  <p className="text-lg text-gray-600">
                    የሰራተኞች ዲጂታል መታወቂያ እና
                    ማስተዋቂያ ሰሌዳ ማስተዳደሪያ ስርዓት
                  </p>
                </header>

                <div className="max-w-7xl mx-auto px-6 py-10 w-full">
                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    መለክቶች
                  </h2>

                  {projects.length === 0 ? (
                    <p className="text-center text-gray-500">
                      ምንም መረጃ የለም
                    </p>
                  ) : (
                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-8
                      "
                    >
                      {projects.map((project, index) => (
                        <div
                          key={
                            project?._id ||
                            project?.id ||
                            index
                          }
                          className="
                            bg-white
                            rounded-2xl
                            shadow-md
                            overflow-hidden
                            hover:shadow-xl
                            transition
                            border
                            border-gray-100
                            flex
                            flex-col
                          "
                        >
                          {/* Project Image */}
                          {project?.imageUrl ? (
                            <a
                              href={
                                project?.link || "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="overflow-hidden block"
                            >
                              <img
                                src={project.imageUrl}
                                alt={
                                  project?.title ||
                                  "Project"
                                }
                                className="
                                  w-full
                                  h-48
                                  object-cover
                                  hover:scale-105
                                  transition
                                  duration-300
                                "
                              />
                            </a>
                          ) : (
                            <div
                              className="
                                w-full
                                h-48
                                bg-gray-100
                                flex
                                items-center
                                justify-center
                                text-gray-400
                              "
                            >
                              No Image
                            </div>
                          )}

                          {/* Project Title */}
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800">
                              {project?.title ||
                                "Untitled Project"}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            }
          />

          {/* ======================================
              LOGIN
          ====================================== */}
          <Route
            path="/login"
            element={
              <div className="flex-grow flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                  <Login
                    authMode="login"
                    handleAuthChange={handleAuthChange}
                    handleAuthSubmit={handleAuthSubmit}
                    authStatus={authStatus}
                    logoImg={logoImg}
                  />
                </div>
              </div>
            }
          />

          {/* ======================================
              SIGNUP
          ====================================== */}
          <Route
            path="/signup"
            element={
              <div className="flex-grow flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                  <Login
                    authMode="signup"
                    handleAuthChange={handleAuthChange}
                    handleAuthSubmit={handleAuthSubmit}
                    authStatus={authStatus}
                    logoImg={logoImg}
                  />
                </div>
              </div>
            }
          />

          {/* ======================================
              ADMIN DASHBOARD
          ====================================== */}
          <Route
            path="/admin-dashboard"
            element={
              user?.role === "admin" ? (
                <AdminDashboard
                  user={user}
                  handleLogout={handleLogout}
                  adminMessages={adminMessages}
                  fetchMessages={fetchMessages}
                  newAdminForm={newAdminForm}
                  handleNewAdminChange={(event) => {
                    const {
                      name,
                      value,
                    } = event.target;

                    setNewAdminForm(
                      (previous) => ({
                        ...previous,
                        [name]: value,
                      })
                    );
                  }}
                  handleAddAdminSubmit={
                    handleAddAdminSubmit
                  }
                  adminAddStatus={
                    adminAddStatus
                  }
                  API_BASE_URL={
                    API_BASE_URL
                  }
                  handleDeleteMessage={
                    handleDeleteMessage
                  }
                  projects={projects}
                  setProjects={
                    setProjects
                  }
                />
              ) : (
                <AccessDenied />
              )
            }
          />

          {/* ======================================
              HR DASHBOARD
          ====================================== */}
          <Route
            path="/hr-dashboard"
            element={
              user?.role === "hr" ? (
                <div className="flex flex-col min-h-screen bg-gray-900">
                  <HrNav
                    current="dashboard"
                    handleLogout={
                      handleLogout
                    }
                  />

                  <div className="flex-grow">
                    <HrDashboard
                      user={user}
                      handleLogout={
                        handleLogout
                      }
                      API_BASE_URL={
                        API_BASE_URL
                      }
                    />
                  </div>
                </div>
              ) : (
                <AccessDenied />
              )
            }
          />

          {/* ======================================
              HR PRINT CART
          ====================================== */}
          <Route
            path="/hr-print-cart"
            element={
              user?.role === "hr" ? (
                <div className="flex flex-col min-h-screen bg-gray-900">
                  <HrNav
                    current="print-cart"
                    handleLogout={
                      handleLogout
                    }
                  />

                  <div className="flex-grow">
                    <HRPrintCartPage
                      user={user}
                      handleLogout={
                        handleLogout
                      }
                      API_BASE_URL={
                        API_BASE_URL
                      }
                    />
                  </div>
                </div>
              ) : (
                <AccessDenied />
              )
            }
          />

          {/* ======================================
              PENSION DATA
              
              IMPORTANT FIX:
              PensionData now receives:
              - user
              - handleLogout
              - API_BASE_URL

              And only HR can access it.
          ====================================== */}
          <Route
            path="/pension-data"
            element={
              user?.role === "hr" ? (
                <div className="flex flex-col min-h-screen bg-gray-900">
                  <HrNav
                    current="pension-data"
                    handleLogout={
                      handleLogout
                    }
                  />

                  <div className="flex-grow">
                    <PensionData
                      user={user}
                      handleLogout={
                        handleLogout
                      }
                      API_BASE_URL={
                        API_BASE_URL
                      }
                    />
                  </div>
                </div>
              ) : (
                <AccessDenied />
              )
            }
          />

          {/* ======================================
              VERIFY
              
              Kept compatible with your previous
              public verification behavior.
          ====================================== */}
          <Route
            path="/verify/:id"
            element={
              <HrDashboard
                user={{
                  role: "hr",
                  name: "Guest Verifier",
                  email: "",
                }}
                handleLogout={() =>
                  navigate("/")
                }
                API_BASE_URL={
                  API_BASE_URL
                }
              />
            }
          />

          {/* ======================================
              404
          ====================================== */}
          <Route
            path="*"
            element={
              <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                  <div className="text-7xl mb-4">
                    404
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-3">
                    ገጹ አልተገኘም
                  </h1>

                  <p className="text-gray-500 mb-6">
                    የጠየቁት ገጽ አይገኝም።
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/")
                    }
                    className="
                      px-6
                      py-3
                      bg-blue-600
                      text-white
                      rounded-xl
                      font-bold
                      hover:bg-blue-700
                      transition
                    "
                  >
                    🏠 ወደ መነሻ ገጽ
                  </button>
                </div>
              </div>
            }
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
