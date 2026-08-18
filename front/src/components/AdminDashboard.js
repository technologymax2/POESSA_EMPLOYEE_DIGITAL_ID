import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  
  // States for data lists & forms
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

  const [adminList, setAdminList] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminAddStatus, setAdminAddStatus] = useState("");
  const [passwordReset, setPasswordReset] = useState({ id: "", newPassword: "" });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });

  const [hrList, setHrList] = useState([]);
  const [hrForm, setHrForm] = useState({ name: "", email: "", password: "" });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://olinexamcenter.onrender.com';

  // Placeholder fetch functions (ለማስተካከል እንዲመችዎ)
  const fetchAdmins = () => {};
  const handleLogout = () => {};
  const handleেই SendAdminMessage = () => {};
  const handleDeleteMessage = (msgId) => {};
  const handleAddAdminSubmit = (e) => { e.preventDefault(); setNewAdminForm({ name: "", email: "", password: "" }); };
  const handleResetPassword = (id) => { setPasswordReset({ id: "", newPassword: "" }); };
  const handleUpdateAdmin = (e) => { e.preventDefault(); setEditingAdmin(null); };
  const handleDeleteAdmin = (id) => {};
  const handleAddHRSubmit = (e) => { e.preventDefault(); setHrForm({ name: "", email: "", password: "" }); };
  const handleResetHRPassword = (id) => {};
  const handleDeleteHR = (id) => {};

  const filteredMessages = messages.filter(m => m.email === selectedUserEmail);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 box-border relative text-white bg-[#0d0f12] min-h-screen">
      
      {/* 📱 ሄደር (ከሜኑ አዝራር ጋር) */}
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

      {/* ዋናው አካባቢ ከሳይድባር ጋር */}
      <div className="flex relative gap-4">
        
        {/* የሞባይል ዳርክ ባክግራውንድ ማደብዘዣ (Backdrop) */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          ></div>
        )}

        {/* 🗂️ የጎን ምናሌ (Sidebar Menu / Drawer) */}
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
            onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }}
            className={`w-full text-left p-2.5 rounded-lg font-bold transition ${
              activeTab === "messages" ? "bg-yellow-400 text-black" : "text-white hover:bg-gray-800"
            }`}
          >
            💬 መልዕክቶች
          </button>
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

        {/* ዋናው የይዘት ማሳያ አካባቢ */}
        <div className="flex-1 min-w-0">

          {/* 1. መልዕክቶች */}
          {activeTab === "messages" && (
            <>
              <h3 className="text-sm font-bold mb-3">💬 የደንበኞች መልዕክት ዝርዝር</h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-72 bg-[#161b22] border border-[#30363d] rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 mb-2">👥 ተጠቃሚዎች ({uniqueUsers.length})</div>
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
                    {uniqueUsers.map((u) => (
                      <div
                        key={u.email}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                          selectedUserEmail === u.email ? "bg-yellow-400/20 border border-yellow-400" : "hover:bg-gray-800"
                        }`}
                        onClick={() => setSelectedUserEmail(u.email)}
                      >
                        <span>👤</span>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-semibold truncate">{u.name}</h4>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    ))}
                    {uniqueUsers.length === 0 && <p className="text-xs text-gray-400">ምንም ቻት የለም</p>}
                  </div>
                </div>

                <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col min-h-[350px]">
                  {selectedUserEmail ? (
                    <>
                      <div className="p-3 border-b border-[#30363d] text-xs font-bold">
                        💬 ከ <strong className="text-yellow-400">{uniqueUsers.find((u) => u.email === selectedUserEmail)?.name}</strong> ጋር
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                        {filteredMessages.map((msg) => (
                          <div key={msg._id} className="flex flex-col gap-1">
                            {!msg.message.startsWith("[አድሚን መልዕክት]") && (
                              <div className="bg-[#21262d] p-3 rounded-lg max-w-[85%] self-start">
                                <p className="text-sm">{msg.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">🕒 {new Date(msg.date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {msg.reply && (
                              <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 rounded-lg max-w-[85%] self-end">
                                <span className="text-xs font-bold text-yellow-400 block mb-1">አድሚን ምላሽ፦</span>
                                <p className="text-sm">{msg.reply}</p>
                              </div>
                            )}
                            <button onClick={() => handleDeleteMessage(msg._id)} className="text-red-400 text-xs self-start hover:underline mt-1">
                              🗑️ መልዕክቱን አጥፊ
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex gap-2">
                        <input
                          type="text"
                          placeholder="መልዕክትዎ ይጻፉ..."
                          value={replyText["global_admin_chat"] || ""}
                          onChange={(e) => setReplyText({ ...replyText, global_admin_chat: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSendAdminMessage(); }}
                          className="flex-1 bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400 text-sm"
                        />
                        <button onClick={handleSendAdminMessage} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm transition">
                          ላክ
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">
                      <p>እባክዎ ተጠቃሚ ይምረጡ</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 2. አድሚኖች */}
          {activeTab === "admins" && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h3 className="text-base font-bold mb-3">➕ አዲስ አድሚን ይፍጠሩ</h3>
                <form onSubmit={(e) => { handleAddAdminSubmit(e); setTimeout(fetchAdmins, 1000); }} className="flex flex-col gap-3">
                  <input type="text" name="name" placeholder="የአድሚን ስም" value={newAdminForm.name} onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="text" name="email" placeholder="የአድሚን ኢሜይል" value={newAdminForm.email} onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
                  <input type="password" name="password" placeholder="የሚስጥር ቃል" value={newAdminForm.password} onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})} required className="bg-[#0d0f12] border border-[#30363d] text-white p-2.5 rounded-lg outline-none focus:border-yellow-400" />
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

          {/* 3. HR */}
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

    </div>
  );
}

export default AdminDashboard;
