import React, { useState, useEffect, useCallback } from "react";
import Footer from "./Footer";

function AdminDashboard({
  user,
  handleLogout,
  newAdminForm,
  handleNewAdminChange,
  handleAddAdminSubmit,
  adminAddStatus,
  API_BASE_URL,
}) {
  const [adminList, setAdminList] = useState([]);
  const [hrList, setHrList] = useState([]);
 
  const [activeTab, setActiveTab] = useState("admins");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordReset, setPasswordReset] = useState({ id: "", newPassword: "" });

  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) {
      console.error("አድሚኖችን ማምጣት አልተቻለም");
    }
  }, [API_BASE_URL]);

  const fetchHrs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`);
      const data = await res.json();
      if (data.success) setHrList(data.hrs);
    } catch (err) {
      console.error("HR ማምጣት አልተቻለም");
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchAdmins();
    fetchHrs();
  }, [fetchAdmins, fetchHrs]);

  const handleAddHRSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hrForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("HR በስኬት ተመዝግቧል!");
        setHrForm({ name: "", email: "", password: "" });
        fetchHrs();
      } else {
        alert(data.error || "HR መመዝገብ አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    }
  };

  const handleDeleteHR = async (id) => {
    if (!window.confirm("ይህንን HR ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("HR ተሰርዟል!");
        fetchHrs();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  const handleResetHRPassword = async (id) => {
    const newPassword = prompt("ለዚህ HR አዲስ ፓስወርድ ያስገቡ:");
    if (!newPassword) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/hrs/reset-password/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert("የ HR ፓስወርድ ተቀይሯል!");
      } else {
        alert(data.error || "ፓስወርድ መቀየር አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት አጋጥሟል");
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/update/${editingAdmin}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );
      if (res.ok) {
        alert("አድሚን መረጃ ተስተካክሏል!");
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      alert("ማስተካከሉ አልተሳካም");
    }
  };

  const handleResetPassword = async (id) => {
    if (!passwordReset.newPassword || passwordReset.id !== id)
      return alert("እባክዎ ትክክለኛ ፓስወርድ ይጻፉ!");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/reset-password/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: passwordReset.newPassword }),
        }
      );
      if (res.ok) {
        alert("አድሚኑ ፓስወርድ ተቀይሯል!");
        setPasswordReset({ id: "", newPassword: "" });
      }
    } catch (err) {
      alert("ፓስወርድ መቀየር አልተቻለም");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("እርግጠኛ ነዎት አድሚኑን ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("አድሚኑ ተሰርዟል!");
        fetchAdmins();
      }
    } catch (err) {
      alert("ማጥፋት አልተቻለም");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 box-border relative text-white bg-[#0d0f12] min-h-screen">
      
      <div className="flex flex-wrap justify-between items-center gap-3 py-3 px-2 border-b border-[#30363d] mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-yellow-400 text-gray-900 border-none p-2 px-3 rounded-md text-lg cursor-pointer font-bold hover:bg-yellow-500 transition"
            title="ምናሌ ክፈት"
          >
            ☰
          </button>
          <h2 className="text-lg sm:text-xl font-bold m-0 text-white">👑 ዋናው መቆጣጠሪያ</h2>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition">
          ውጣ (Logout)
        </button>
      </div>

      <div className="flex relative gap-4">
        
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          ></div>
        )}

        <div 
          className={`fixed md:relative top-0 left-0 h-full md:h-auto w-64 bg-[#161b22] border-r md:border border-[#30363d] rounded-none md:rounded-xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-between items-center mb-2 md:hidden">
            <span className="text-sm font-bold text-gray-400">ምናሌዎች (Menu)</span>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="bg-transparent border-none text-white text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>
         
          <button
            onClick={() => { setActiveTab("admins"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "admins" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            👑 አድሚኖች
          </button>
          <button
            onClick={() => { setActiveTab("hrs"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "hrs" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            👥 የሰው ሃብት (HR)
          </button>
        </div>

        <div className="flex-1 min-w-0">

          {activeTab === "admins" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">➕ አዲስ አድሚን ይፍጠሩ</h3>
                <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="flex flex-col gap-3">
                  <input type="text" name="name" placeholder="የአድሚን ስም" value={newAdminForm.name} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="text" name="email" placeholder="የአድሚን ኢሜይል" value={newAdminForm.email} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" name="password" placeholder="የሚስጥር ቃል" value={newAdminForm.password} onChange={handleNewAdminChange} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition">አድሚኑን መዝግብ</button>
                </form>
                {adminAddStatus && <p className="text-sm text-yellow-400 mt-2">{adminAddStatus}</p>}
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">📋 ያሉ አድሚኖች ዝርዝር</h3>
                <div className="flex flex-col gap-3">
                  {adminList.map((adm) => (
                    <div key={adm._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2">
                      <div><strong>ስም:</strong> {adm.name}</div>
                      <div><strong>ኢሜይል:</strong> {adm.email}</div>
                      <div className="flex gap-2 mt-1">
                        <input type="text" placeholder="አዲስ ፓስወርድ" value={passwordReset.id === adm._id ? passwordReset.newPassword : ""} onChange={(e) => setPasswordReset({ id: adm._id, newPassword: e.target.value })} className="bg-[#161b22] border border-[#30363d] text-white p-1.5 rounded text-xs flex-1" />
                        <button onClick={() => handleResetPassword(adm._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs">ቀይር</button>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => { setEditingAdmin(adm._id); setEditForm({ name: adm.name, email: adm.email }); }} className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded text-xs">✏️ አስተካክል</button>
                        <button onClick={() => handleDeleteAdmin(adm._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">🗑️ አጥፋ</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "hrs" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">👥 አዲስ HR ባለሙያ መመዝገቢያ</h3>
                <form onSubmit={handleAddHRSubmit} className="flex flex-col gap-3">
                  <input type="text" placeholder="የሰራተኛው ስም" value={hrForm.name} onChange={(e) => setHrForm({ ...hrForm, name: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="email" placeholder="ኢሜይል አድራሻ" value={hrForm.email} onChange={(e) => setHrForm({ ...hrForm, email: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" placeholder="ፓስወርድ" value={hrForm.password} onChange={(e) => setHrForm({ ...hrForm, password: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2.5 rounded-lg transition">HR መዝግብ</button>
                </form>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">📋 የተመዘገቡ HR ባለሙያዎች ዝርዝር</h3>
                <div className="flex flex-col gap-3">
                  {hrList.map((hr) => (
                    <div key={hr._id} className="bg-[#0d0f12] border border-[#30363d] p-3 rounded-lg flex flex-col gap-2">
                      <div><strong>ስም:</strong> {hr.name}</div>
                      <div><strong>ኢሜይል:</strong> {hr.email}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleResetHRPassword(hr._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs">ፓስወርድ ቀይር</button>
                        <button onClick={() => handleDeleteHR(hr._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs">🗑️ አጥፋ</button>
                      </div>
                    </div>
                  ))}
                  {hrList.length === 0 && <p className="text-gray-400 text-sm">ምንም HR ባለሙያ አልተመዘገበም</p>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {editingAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-base font-bold mb-4">✏️ አድሚን ማስተካከያ</h3>
            <form onSubmit={handleUpdateAdmin} className="flex flex-col gap-3">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
              <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-2 rounded-lg text-sm">አስተካክል</button>
                <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm">ሰርዝ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminDashboard;
