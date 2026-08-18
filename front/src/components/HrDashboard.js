import React, { useEffect, useState, useRef, useCallback } from 'react';
import Footer from './Footer';

const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";
const FRONTEND_URL = "https://poessa-employee-digital-id.vercel.app";

function HRDashboard({ user, handleLogout, API_BASE_URL }) {
  const [employeeList, setEmployeeList] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // ሰራተኛን ለማስተካከል የሚያገለግል ID
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  
  const [employeeForm, setEmployeeForm] = useState({
    nameAmh: '',
    nameEng: '',
    age: '',
    faydaNumber: '',
    dateOfIssue: '',
    expireDate: '',
    addressAmh: '',
    addressEng: '',
    zone: '',
    city: '',
    nationality: '',
    phoneNumber: '',
    woreda: '',
    positionAmh: '',
    positionEng: '',
    branchNameAmh: '', // አዲስ የተጨመረ - የቅርንጫፍ ስም በአማርኛ
    branchNameEng: '', // አዲስ የተጨመረ - የቅርንጫፍ ስም በእንግሊዝኛ
    isActive: true     // አዲስ የተጨመረ - ሰራተኛው ስራ ላይ መሆኑን/ለቀቀ መሆኑን ለመቆጣጠር
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [companyLogoUrl, setCompanyLogoUrl] = useState(() => {
    return localStorage.getItem('company_logo_url') || '';
  });
  
  const [companyPhone, setCompanyPhone] = useState(() => {
    return localStorage.getItem('company_phone') || '';
  });

  const [companyEmail, setCompanyEmail] = useState(() => {
    return localStorage.getItem('company_email') || '';
  });

  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [employeeStatus, setEmployeeStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIdCard, setSelectedIdCard] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [printCardType, setPrintCardType] = useState('id-card');
  const [verifiedEmployeeModal, setVerifiedEmployeeModal] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployeeList(data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/verify/")) {
      const idFromUrl = path.split("/").pop();
      if (idFromUrl) {
        fetch(`${API_BASE_URL}/api/hr/verify/${idFromUrl}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setVerifiedEmployeeModal(data.employee);
            }
          })
          .catch(err => console.error("Verify error:", err));
      }
    }
  }, [API_BASE_URL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setEmployeeStatus("");
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const logoData = new FormData();
      logoData.append("image", file);
      const logoRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: logoData,
      });
      const logoResult = await logoRes.json();
      if (logoResult.success) {
        const newUrl = logoResult.data.url;
        setCompanyLogoUrl(newUrl);
        localStorage.setItem('company_logo_url', newUrl);
        alert("የድርጅት ሎጎ በስኬት ተቀምጧል!");
      } else {
        alert("ሎጎውን መጫን አልተቻለም።");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === 'companyPhone') {
      setCompanyPhone(value);
      localStorage.setItem('company_phone', value);
    } else if (name === 'companyEmail') {
      setCompanyEmail(value);
      localStorage.setItem('company_email', value);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let errors = { ...validationErrors };

    if (type === 'checkbox') {
      setEmployeeForm(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "faydaNumber") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 16);
      if (cleanValue.length > 0 && cleanValue.length < 16) {
        errors[name] = `⚠️ የፋይዳ ቁጥር ልክ 16 ዲጂት መሆን አለበት! (አሁን፡ ${cleanValue.length})`;
      } else {
        delete errors[name];
      }
      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === "phoneNumber") {
      let cleanValue = value.replace(/\D/g, "");
      
      if (cleanValue.length > 0 && cleanValue[0] !== "0") {
        errors[name] = "⚠️ ስልክ ቁጥር በ '0' መጀመር አለበት!";
        setValidationErrors(errors);
        return;
      }

      if (cleanValue.length > 10) {
        cleanValue = cleanValue.substring(0, 10);
      }

      if (cleanValue.length > 0 && cleanValue.length < 10) {
        errors[name] = `⚠️ ልክ 10 ዲጂት መሆን አለበት! (አሁን፡ ${cleanValue.length})`;
      } else {
        delete errors[name];
      }

      setEmployeeForm(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === "expireDate" && employeeForm.dateOfIssue && value < employeeForm.dateOfIssue) {
      errors.expireDate = "⚠️ የማብቂያ ቀን ከተሰጠበት ቀን ቀድሞ ሊሆን አይችልም!";
      setValidationErrors(errors);
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    } else {
      if (name === "expireDate") delete errors.expireDate;
      setEmployeeForm(prev => ({ ...prev, [name]: value }));
    }

    setValidationErrors(errors);
  };

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp._id);
    setEmployeeForm({
      nameAmh: emp.nameAmh || '',
      nameEng: emp.nameEng || '',
      age: emp.age || '',
      faydaNumber: emp.faydaNumber || '',
      dateOfIssue: emp.dateOfIssue || '',
      expireDate: emp.expireDate || '',
      addressAmh: emp.addressAmh || '',
      addressEng: emp.addressEng || '',
      zone: emp.zone || '',
      city: emp.city || '',
      nationality: emp.nationality || '',
      phoneNumber: emp.phoneNumber || '',
      woreda: emp.woreda || '',
      positionAmh: emp.positionAmh || '',
      positionEng: emp.positionEng || '',
      branchNameAmh: emp.branchNameAmh || '',
      branchNameEng: emp.branchNameEng || '',
      isActive: emp.isActive !== undefined ? emp.isActive : true
    });
    setImagePreview(emp.imageUrl || null);
    setImage(null);
    setActiveTab('register');
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();

    if (!image && !imagePreview) {
      setEmployeeStatus("⚠️ እባክዎ የሰራተኛውን ፎቶ ይምረጡ!");
      return;
    }

    if (employeeForm.faydaNumber.length !== 16) {
      setEmployeeStatus("❌ ስህተት፡ የፋይዳ ቁጥር በትክክል 16 አሃዝ መሆን አለበት!");
      return;
    }

    if (employeeForm.phoneNumber.length !== 10) {
      setEmployeeStatus("❌ ስህተት፡ ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት!");
      return;
    }

    setLoading(true);
    setEmployeeStatus("⏳ መረጃ በመጫን ላይ...");

    try {
      let finalImageUrl = imagePreview;

      if (image) {
        const imgData = new FormData();
        imgData.append("image", image);
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: imgData,
        });
        const imgResult = await imgRes.json();
        if (!imgResult.success) throw new Error("የሰራተኛውን ፎቶ ወደ ማከማቻ መላክ አልተቻለም");
        finalImageUrl = imgResult.data.url;
      }

      const finalData = {
        ...employeeForm,
        imageUrl: finalImageUrl,
        logoUrl: companyLogoUrl,
        orgPhoneNumber: companyPhone,
        orgEmail: companyEmail,
        status: 'approved',
        approved: true
      };

      let url = `${API_BASE_URL}/api/hr/employees`;
      let method = 'POST';

      if (editingEmployeeId) {
        url = `${API_BASE_URL}/api/hr/employees/${editingEmployeeId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEmployeeStatus(editingEmployeeId ? "✅ ሰራተኛው መረጃ በስኬት ተስተካክሏል!" : "✅ ሰራተኛው በስኬት ተመዝግቧል!");
        setValidationErrors({});
        setEditingEmployeeId(null);
        setEmployeeForm({
          nameAmh: '',
          nameEng: '',
          age: '',
          faydaNumber: '',
          dateOfIssue: '',
          expireDate: '',
          addressAmh: '',
          addressEng: '',
          zone: '',
          city: '',
          nationality: '',
          phoneNumber: '',
          woreda: '',
          positionAmh: '',
          positionEng: '',
          branchNameAmh: '',
          branchNameEng: '',
          isActive: true
        });
        setImage(null);
        setImagePreview(null);
        fetchEmployees();
      } else {
        setEmployeeStatus(data.error || "የሰርቨር ስህተት!");
      }
    } catch (err) {
      setEmployeeStatus(`❌ ስህተት፡ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ከማጥፋት (Delete) ይልቅ የሰራተኛውን ሁኔታ (Active/Left) ወደ መቀየር (Toggle Status) ተቀይሯል
  const handleToggleStatus = async (emp) => {
    const newStatus = !emp.isActive;
    const confirmMsg = newStatus 
      ? `ይህንን ሰራተኛ እንደገና 'ስራ ላይ ያለ' (Active) ማድረግ ይፈልጋሉ?` 
      : `ይህንን ሰራተኛ 'ስራ የለቀቀ' (Left / Inactive) ማድረግ ይፈልጋሉ?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/hr/employees/${emp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, isActive: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(newStatus ? "ሰራተኛው ዳግም ስራ ላይ እንዲሆን ተደርጓል!" : "ሰራተኛው ስራ የለቀቀ (Inactive) ሆኖ ተመዝግቧል!");
        fetchEmployees();
      } else {
        alert("ሁኔታውን መቀየር አልተቻለም");
      }
    } catch (err) {
      alert("ስህተት ተፈጥሯል");
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative print:bg-white print:p-0">
      
      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-yellow-400 text-gray-900 border-none p-2 px-3 rounded-xl text-lg cursor-pointer font-bold hover:bg-yellow-500 transition"
          >
            ☰
          </button>
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            🏢 HR ዳሽቦርድ - እንኳን ደህና መጡ {user?.name || ''}
          </h2>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition shadow text-sm">
          ውጣ (Logout)
        </button>
      </div>

      <div className="flex relative gap-6 items-start flex-1 print:block">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden"></div>
        )}

        <div className={`fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 bg-gray-800 border-r lg:border border-gray-700 rounded-none lg:rounded-2xl p-4 flex flex-col gap-2 z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} print:hidden`}>
          <button onClick={() => { setActiveTab('employees'); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>📋 ሰራተኞች ዝርዝር</button>
          <button onClick={() => { 
            setActiveTab('register'); 
            setEditingEmployeeId(null); 
            setEmployeeForm({ nameAmh: '', nameEng: '', age: '', faydaNumber: '', dateOfIssue: '', expireDate: '', addressAmh: '', addressEng: '', zone: '', city: '', nationality: '', phoneNumber: '', woreda: '', positionAmh: '', positionEng: '', branchNameAmh: '', branchNameEng: '', isActive: true });
            setImagePreview(null);
            setSidebarOpen(false); 
          }} className={`w-full text-left p-3 rounded-xl font-bold transition ${activeTab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>➕ አዲስ ሰራተኛ መመዝገቢያ</button>
        </div>

        <div className="flex-1 w-full min-w-0 print:w-full">
          <div className="grid grid-cols-1 gap-8 print:block">
            
            {(activeTab === 'register' || window.innerWidth >= 1024) && (
              <div className={`bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 ${activeTab !== 'register' ? 'hidden lg:block' : ''} print:hidden`}>
                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  {editingEmployeeId ? "✏️ የሰራተኛ መረጃ ማስተካከያ (Edit Employee)" : "➕ አዲስ ሰራተኛ መመዝገቢያ"}
                </h3>
                
                <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-xl flex flex-col gap-4">
                  <div className="text-sm font-bold text-yellow-400 border-b border-gray-700 pb-2">🏢 የድርጅት ቋሚ መረጃዎች (Company Settings)</div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                        {companyLogoUrl ? (
                          <img src={companyLogoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">LOGO</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-200">የድርጅት ሎጎ</div>
                        <div className="text-[11px] text-gray-400">{companyLogoUrl ? "✅ ተቀምጧል" : "⚠️ አልተጫነም"}</div>
                      </div>
                    </div>
                    <div>
                      <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                      <button 
                        type="button" 
                        onClick={() => logoInputRef.current?.click()} 
                        disabled={uploadingLogo}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-blue-300 text-xs font-bold rounded-lg border border-gray-600 transition"
                      >
                        {uploadingLogo ? "እየጫነ ነው..." : (companyLogoUrl ? "ሎጎ ቀይር" : "ሎጎ ጫን")}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                    <div>
                      <label className="text-[11px] text-gray-400 mb-1 block">የድርጅት ስልክ ቁጥር (Company Phone)</label>
                      <input 
                        type="text" 
                        name="companyPhone" 
                        value={companyPhone} 
                        onChange={handleCompanyInfoChange} 
                        placeholder="ምሳሌ፡ 0111234567" 
                        className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 mb-1 block">የድርጅት ኢሜይል (Company Email)</label>
                      <input 
                        type="email" 
                        name="companyEmail" 
                        value={companyEmail} 
                        onChange={handleCompanyInfoChange} 
                        placeholder="ምሳሌ፡ info@poessa.gov.et" 
                        className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEmployeeSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ስም (በአማርኛ)</label>
                    <input 
                      type="text" 
                      name="nameAmh" 
                      value={employeeForm.nameAmh} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ አበበ ከበደ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ስም (በእንግሊዝኛ)</label>
                    <input 
                      type="text" 
                      name="nameEng" 
                      value={employeeForm.nameEng} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ Abebe Kebede" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* ቅርንጫፍ መስሪያ ቤት (አማርኛ) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ቅርንጫፍ ጽ/ቤት (አማርኛ)</label>
                    <input 
                      type="text" 
                      name="branchNameAmh" 
                      value={employeeForm.branchNameAmh} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ ዋናው ቅርንጫፍ / ቂርቆስ ቅርንጫፍ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* ቅርንጫፍ መስሪያ ቤት (እንግሊዝኛ) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ቅርንጫፍ ጽ/ቤት (እንግሊዝኛ)</label>
                    <input 
                      type="text" 
                      name="branchNameEng" 
                      value={employeeForm.branchNameEng} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ Main Branch / Kirkos Branch" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">እድሜ (Age)</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={employeeForm.age} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ 30" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">የፋይዳ ቁጥር (Fayda Number - 16 Digits)</label>
                    <input 
                      type="text" 
                      name="faydaNumber" 
                      value={employeeForm.faydaNumber} 
                      onChange={handleChange} 
                      required 
                      maxLength="16" 
                      placeholder="16 አሃዝ ቁጥር ያስገቡ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none font-mono"
                    />
                    {validationErrors.faydaNumber && <span className="text-[10px] text-red-400 mt-1 block">{validationErrors.faydaNumber}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">የተሰጠበት ቀን (Date of Issue)</label>
                    <input 
                      type="date" 
                      name="dateOfIssue" 
                      value={employeeForm.dateOfIssue} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">የሚያበቃበት ቀን (Expire Date)</label>
                    <input 
                      type="date" 
                      name="expireDate" 
                      value={employeeForm.expireDate} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                    {validationErrors.expireDate && <span className="text-[10px] text-red-400 mt-1 block">{validationErrors.expireDate}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">አድራሻ (አማርኛ)</label>
                    <input 
                      type="text" 
                      name="addressAmh" 
                      value={employeeForm.addressAmh} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ ቦሌ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">አድራሻ (እንግሊዝኛ)</label>
                    <input 
                      type="text" 
                      name="addressEng" 
                      value={employeeForm.addressEng} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ Bole" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ዞን (Zone)</label>
                    <input 
                      type="text" 
                      name="zone" 
                      value={employeeForm.zone} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ አዲስ አበባ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ከተማ (City)</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={employeeForm.city} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ አዲስ አበባ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ዜግነት (Nationality)</label>
                    <input 
                      type="text" 
                      name="nationality" 
                      value={employeeForm.nationality} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ ኢትዮጵያዊ" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ስልክ ቁጥር (Phone Number)</label>
                    <input 
                      type="text" 
                      name="phoneNumber" 
                      value={employeeForm.phoneNumber} 
                      onChange={handleChange} 
                      required 
                      maxLength="10" 
                      placeholder="ምሳሌ፡ 0911223344" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none font-mono"
                    />
                    {validationErrors.phoneNumber && <span className="text-[10px] text-red-400 mt-1 block">{validationErrors.phoneNumber}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ወረዳ (Woreda)</label>
                    <input 
                      type="text" 
                      name="woreda" 
                      value={employeeForm.woreda} 
                      onChange={handleChange} 
                      placeholder="ምሳሌ፡ 05" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">የስራ መደብ (በአማርኛ)</label>
                    <input 
                      type="text" 
                      name="positionAmh" 
                      value={employeeForm.positionAmh} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ ሲኒየር ሶፍትዌር ኢንጂነር" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">የስራ መደብ (በእንግሊዝኛ)</label>
                    <input 
                      type="text" 
                      name="positionEng" 
                      value={employeeForm.positionEng} 
                      onChange={handleChange} 
                      required 
                      placeholder="ምሳሌ፡ Senior Software Engineer" 
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* ሰራተኛው ስራ ላይ መሆኑን ወይም ስራ የለቀቀ መሆኑን የሚወስን ቼክቦክስ (Active/Left Toggle) */}
                  <div className="sm:col-span-2 lg:col-span-3 bg-gray-900 p-3 rounded-xl border border-gray-700 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      id="isActiveCheckbox"
                      checked={employeeForm.isActive} 
                      onChange={handleChange}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="isActiveCheckbox" className="text-xs font-bold text-gray-200 cursor-pointer">
                      ሰራተኛው አሁን ላይ ስራ ላይ ይገኛል (Active / ቋሚ ሰራተኛ) - ካልተመረጠ እንደ "ስራ የለቀቀ" ይታያል።
                    </label>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-2">
                    <label className="block text-xs font-bold text-gray-300">የሰራተኛ ፎቶ (Employee Photo)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border border-gray-600 bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">ፎቶ</span>
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-xl border border-gray-600 transition"
                      >
                        ፎቶ ምረጥ (Choose Photo)
                      </button>
                    </div>
                  </div>

                  {employeeStatus && (
                    <div className="sm:col-span-2 lg:col-span-3 text-xs font-bold p-3 rounded-xl bg-gray-900 border border-gray-700 text-yellow-400">
                      {employeeStatus}
                    </div>
                  )}

                  <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-xs shadow-lg"
                    >
                      {loading ? "እየሰራ ነው..." : (editingEmployeeId ? "💾 መረጃውን አስተካክር (Update)" : "✅ ሰራተኛ መዝግብ (Register)")}
                    </button>
                    {editingEmployeeId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingEmployeeId(null);
                          setEmployeeForm({ nameAmh: '', nameEng: '', age: '', faydaNumber: '', dateOfIssue: '', expireDate: '', addressAmh: '', addressEng: '', zone: '', city: '', nationality: '', phoneNumber: '', woreda: '', positionAmh: '', positionEng: '', branchNameAmh: '', branchNameEng: '', isActive: true });
                          setImagePreview(null);
                        }} 
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition text-xs"
                      >
                        ሰርዝ (Cancel)
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* ሰራተኞች ዝርዝር ሰንጠረዥ (Table) ከ ቅርንጫፍ እና Status ጋር */}
            {activeTab === 'employees' && (
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 print:p-0 print:border-none print:shadow-none">
                <h3 className="text-xl font-bold mb-4 text-blue-400 print:hidden">📋 የተመዝጋቢ ሰራተኞች ዝርዝር (Employees List)</h3>
                
                {employeeList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">ምንም የተመዘገበ ሰራተኛ የለም።</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-gray-900 text-gray-200 uppercase text-[10px] border-b border-gray-700">
                        <tr>
                          <th className="p-3">ፎቶ</th>
                          <th className="p-3">ስም</th>
                          <th className="p-3">የስራ መደብ</th>
                          <th className="p-3">ቅርንጫፍ (Branch)</th>
                          <th className="p-3">ስልክ ቁጥር</th>
                          <th className="p-3">ሁኔታ (Status)</th>
                          <th className="p-3 text-center print:hidden">ድርጊት (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {employeeList.map((emp) => (
                          <tr key={emp._id} className="hover:bg-gray-750 transition">
                            <td className="p-3">
                              <img src={emp.imageUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-white">{emp.nameAmh}</div>
                              <div className="text-[10px] text-gray-400">{emp.nameEng}</div>
                            </td>
                            <td className="p-3 text-[#d4af37] font-medium">{emp.positionAmh}</td>
                            <td className="p-3 font-medium text-blue-300">{emp.branchNameAmh || 'አልተገለጸም'}</td>
                            <td className="p-3 font-mono">{emp.phoneNumber}</td>
                            <td className="p-3">
                              {emp.isActive !== false ? (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-bold border border-green-500/30">
                                  ✅ ስራ ላይ (Active)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px] font-bold border border-red-500/30">
                                  ❌ የለቀቀ (Left)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center print:hidden flex items-center justify-center gap-2">
                              <button 
                                onClick={() => setSelectedIdCard(emp)} 
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition"
                                title="መታወቂያ ካርድ አሳይ"
                              >
                                🪪 ካርድ
                              </button>
                              <button 
                                onClick={() => handleEditClick(emp)} 
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                                title="አስተካክል"
                              >
                                ✏️
                              </button>
                              {/* ከማጥፋት ይልቅ ስራ የለቀቀ/ያለ መሆኑን መቀየሪያ */}
                              <button 
                                onClick={() => handleToggleStatus(emp)} 
                                className={`px-2.5 py-1.5 rounded-lg font-bold transition text-[11px] ${emp.isActive !== false ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                                title="የሰራተኛውን ሁኔታ ቀይር"
                              >
                                {emp.isActive !== false ? '🚫 ለቀቀ' : '🔄 መልስ'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
{selectedIdCard && (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 w-full max-w-4xl shadow-2xl flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={() => setSelectedIdCard(null)} 
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center print:hidden shadow"
        >
          ✕
        </button>
        <h3 className="text-sm font-bold text-blue-400 print:hidden">🪪 የሰራተኛ ዲጂታል መታወቂያ ካርድ (Employee Digital ID Card)</h3>
        
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 w-full max-w-md print:hidden flex flex-col gap-2">
          <label className="text-xs text-[#d4af37] font-bold">🪪 የካርድ ቅርጽ ይምረጡ (Select Card Design Style)</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button" 
              onClick={() => setPrintCardType('id-card')} 
              className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${printCardType === 'id-card' ? 'bg-[#0b192c] border-[#d4af37] text-white shadow-md' : 'bg-gray-900 border-gray-700 text-gray-300'}`}
            >
              የደረት ባጅ
            </button>
            <button 
              type="button" 
              onClick={() => setPrintCardType('badge')} 
              className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${printCardType === 'badge' ? 'bg-[#0b192c] border-[#d4af37] text-white shadow-md' : 'bg-gray-900 border-gray-700 text-gray-300'}`}
            >
              መደበኛ መታወቂያ (Standard ID)
            </button>
          </div>
        </div>

        <div className="print-container flex flex-col sm:flex-row gap-6 items-center justify-center">
          {printCardType === 'id-card' ? (
            <>
              {/* የካርድ ፊት ገጽ */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-[#d4af37] font-bold mb-1 print:hidden">የፊት ገጽ (Front Side)</span>
                <div className="printable-card w-[260px] h-[410px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col">
                  
                  {/* ሰራተኛው የለቀቀ ከሆነ ካርዱ ላይ ምልክት እንዲታይ */}
                  {selectedIdCard.isActive === false && (
                    <div className="absolute inset-0 bg-red-950/70 z-30 flex items-center justify-center rotate-[-20deg]">
                      <span className="border-4 border-red-500 text-red-400 font-extrabold text-xl px-4 py-1 rounded-xl shadow-2xl tracking-widest bg-black/60">
                        ስራ የለቀቀ / LEFT
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#d4af37]/20 to-transparent pointer-events-none rounded-tl-[80px]"></div>
                  <div className="pt-3 pb-1 px-2 text-center relative z-10">
                    <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center border border-[#d4af37] shadow mb-1 overflow-hidden">
                      {selectedIdCard.logoUrl || companyLogoUrl ? (
                        <img src={selectedIdCard.logoUrl || companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-extrabold text-[#0b192c]">LOGO</span>
                      )}
                    </div>
                    <h2 className="text-[11px] font-extrabold tracking-wider text-white">POESSA</h2>
                    <p className="text-[8px] text-[#d4af37] font-medium tracking-wide">የግል ድርጅት ሰራተኞች ማህበራዊ ዋስትና አስተዳደር</p>
                  </div>
                  <div className="flex flex-col items-center relative z-10 px-3 mt-0.5">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] to-blue-400 shadow-md">
                      <img src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} alt={selectedIdCard.nameEng} className="w-full h-full object-cover rounded-full bg-white" />
                    </div>
                    <h3 className="text-[11px] font-bold mt-1 text-center text-white leading-tight">{selectedIdCard.nameAmh}</h3>
                    <h3 className="text-[10px] font-semibold text-center text-gray-300 leading-tight">{selectedIdCard.nameEng}</h3>
                    <p className="text-[9px] text-[#d4af37] font-semibold text-center mt-0.5">{selectedIdCard.positionAmh} / {selectedIdCard.positionEng}</p>
                  </div>
                  <div className="px-2.5 py-1.5 text-[9px] space-y-1 text-gray-200 relative z-10 bg-black/25 backdrop-blur-xs mx-2 rounded-lg border border-[#d4af37]/20 mt-1">
                    {/* ቅርንጫፍ በካርድ ላይ ማሳያ */}
                    <div className="flex justify-between border-b border-white/10 pb-0.5">
                      <span className="text-gray-400 font-medium">ቅርንጫፍ:</span>
                      <span className="text-[#d4af37] font-bold">{selectedIdCard.branchNameAmh || 'ዋናው ጽ/ቤት'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-0.5">
                      <span className="text-gray-400 font-medium">ዜግነት:</span>
                      <span className="text-white font-medium">{selectedIdCard.nationality || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-0.5">
                      <span className="text-gray-400 font-medium">ከተማ:</span>
                      <span className="text-white">{selectedIdCard.city || '-'}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-gray-400 font-medium">ስልክ:</span>
                      <span className="font-mono text-white">{selectedIdCard.phoneNumber || '-'}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full py-1.5 text-center text-[8px] text-gray-400 bg-[#07101a] border-t border-[#d4af37]/30 z-10">
                    የግል ድርጅት ሰራተኞች ማህበራዊ ዋስትና አስተዳደር
                  </div>
                </div>
              </div>

              {/* የካርድ ጀርባ ገጽ */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-[#d4af37] font-bold mb-1 print:hidden">የጀርባ ገጽ (Back Side)</span>
                <div className="printable-card w-[260px] h-[410px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col justify-between p-3">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-bold text-[#d4af37] border-b border-white/10 pb-1.5 mb-1.5 tracking-wider text-center">
                      የመስሪያ ቤታችን ባልደረባ ናቸዉ
                    </h3>
                    <div className="text-[8.5px] space-y-1 text-gray-200 bg-black/25 p-2 rounded-lg border border-[#d4af37]/20 mb-1.5">
                      <div className="flex justify-between border-b border-white/10 pb-0.5">
                        <span className="text-gray-400">ድርጅት ስልክ:</span>
                        <span className="font-mono text-white">{selectedIdCard.orgPhoneNumber || companyPhone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span className="text-gray-400">ኢሜይል:</span>
                        <span className="text-white truncate max-w-[130px]">{selectedIdCard.orgEmail || companyEmail || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-[9px] space-y-1 text-gray-200 bg-black/25 p-2 rounded-lg border border-[#d4af37]/20">
                      <div className="flex justify-between border-b border-white/10 pb-0.5">
                        <span className="text-gray-400 font-medium">የፋይዳ ቁጥር:</span>
                        <span className="font-mono font-semibold text-white text-[8px]">{selectedIdCard.faydaNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-0.5">
                        <span className="text-green-400 font-medium">የተሰጠበት ቀን:</span>
                        <span className="text-white font-bold">{selectedIdCard.dateOfIssue || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span className="text-red-400 font-medium">የሚያበቃበት ቀን:</span>
                        <span className="text-red-400 font-bold">{selectedIdCard.expireDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto bg-black/30 p-2 rounded-xl border border-[#d4af37]/20">
                    <div className="bg-white p-1.5 rounded-lg shadow-md">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${selectedIdCard._id}`)}`} alt="QR Code" style={{ width: '85px', height: '85px', display: 'block' }} />
                    </div>
                    <span className="text-[8px] text-[#d4af37] font-bold mt-1 tracking-wide">SCAN TO VERIFY</span>
                  </div>
                  <div className="relative z-10 bg-[#07101a] -mx-3 -mb-3 py-1.5 px-2 text-center border-t border-[#d4af37]/30">
                    <p className="text-[7.5px] text-gray-400">Private Organizations Employees Social Security Administration</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* የደረት ባጅ (Badge Front) */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-[#d4af37] font-bold mb-1 print:hidden">የደረት ባጅ ፊት (Badge Front)</span>
                <div className="printable-card w-[360px] h-[250px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col justify-between p-4">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#d4af37]/15 to-transparent pointer-events-none rounded-bl-full"></div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#d4af37] shadow overflow-hidden">
                        {selectedIdCard.logoUrl || companyLogoUrl ? (
                          <img src={selectedIdCard.logoUrl || companyLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-extrabold text-[#0b192c]">LOGO</span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-[11px] font-extrabold tracking-wider text-white">POESSA</h2>
                        <p className="text-[8px] text-[#d4af37] font-medium">የግል ድርጅት ሰራተኞች ማህበራዊ ዋስትና አስተዳደር</p>
                      </div>
                    </div>
                    <div className="text-right text-[8px] text-gray-400">
                      <div>ቅርንጫፍ: <span className="text-[#d4af37] font-bold">{selectedIdCard.branchNameAmh || '-'}</span></div>
                      <div>ስልክ: {selectedIdCard.orgPhoneNumber || companyPhone}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 my-auto relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl p-0.5 bg-gradient-to-tr from-[#d4af37] to-blue-400 shadow-md shrink-0">
                        <img src={selectedIdCard.imageUrl || 'https://via.placeholder.com/100'} alt={selectedIdCard.nameEng} className="w-full h-full object-cover rounded-lg bg-white" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-bold text-white leading-tight">{selectedIdCard.nameAmh}</h3>
                        <h3 className="text-[10px] font-semibold text-gray-300 leading-tight">{selectedIdCard.nameEng}</h3>
                        <p className="text-[9px] text-[#d4af37] font-bold">{selectedIdCard.positionAmh}</p>
                        <div className="text-[8px] text-gray-300 pt-0.5">
                          <div>አድራሻ: {selectedIdCard.city}</div>
                          <div>ስልክ: {selectedIdCard.phoneNumber}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center bg-black/30 p-1.5 rounded-xl border border-[#d4af37]/20 shrink-0">
                      <div className="bg-white p-1 rounded-md">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${FRONTEND_URL}/verify/${selectedIdCard._id}`)}`} alt="QR Code" style={{ width: '55px', height: '55px', display: 'block' }} />
                      </div>
                      <span className="text-[7px] text-[#d4af37] font-bold mt-0.5">SCAN</span>
                    </div>
                  </div>
                  <div className="bg-[#07101a] -mx-4 -mb-4 py-1 px-3 text-center border-t border-[#d4af37]/30 text-[8px] text-gray-400 relative z-10">
                    የሰራተኛ መታወቂያ - POESSA
                  </div>
                </div>
              </div>

              {/* የደረት ባጅ ጀርባ (Badge Back) */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-[#d4af37] font-bold mb-1 print:hidden">የደረት ባጅ ጀርባ (Badge Back)</span>
                <div className="printable-card w-[360px] h-[250px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-[#d4af37] overflow-hidden relative flex flex-col justify-between p-4">
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#d4af37]/10 to-transparent pointer-events-none rounded-tr-full"></div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 relative z-10">
                    <h3 className="text-[10px] font-bold text-[#d4af37] tracking-wider">የምስሪያቤታችን ባልደረባ ናቸው</h3>
                    <span className="text-[8px] font-mono text-gray-400">ፋይዳ: {selectedIdCard.faydaNumber}</span>
                  </div>
                  <div className="flex flex-col justify-center my-auto px-2 space-y-2 relative z-10">
                    <div className="text-[10px] text-gray-200 grid grid-cols-2 gap-2 bg-black/25 p-3 rounded-xl border border-[#d4af37]/20">
                      <div><span className="text-green-400 font-semibold">የተሰጠበት (Issue):</span> <span className="text-white font-bold">{selectedIdCard.dateOfIssue || 'N/A'}</span></div>
                      <div><span className="text-red-400 font-semibold">የሚያበቃበት (Expire):</span> <span className="text-red-400 font-bold">{selectedIdCard.expireDate || 'N/A'}</span></div>
                      <div><span className="text-gray-400">ዜግነት:</span> <span className="text-white font-medium">{selectedIdCard.nationality}</span></div>
                      <div><span className="text-gray-400">እድሜ:</span> <span className="text-white font-medium">{selectedIdCard.age}</span></div>
                    </div>
                  </div>
                  <div className="bg-[#07101a] -mx-4 -mb-4 py-1.5 px-3 text-center border-t border-[#d4af37]/30 text-[8px] text-gray-400 relative z-10">
                    POESSA - Private Organizations Employees Social Security Administration
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-3 bg-gray-800 border border-gray-700 rounded-xl mt-2 w-[300px] print:hidden">
          <button onClick={() => window.print()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow text-sm transition">
            🖨 ሰነዱን አትም (Print Card)
          </button>
        </div>
      </div>
    </div>
  )}

  {verifiedEmployeeModal && (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-green-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative animate-fade-in">
        <button 
          onClick={() => { setVerifiedEmployeeModal(null); window.location.href = "/"; }} 
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold bg-gray-700 w-7 h-7 rounded-full flex items-center justify-center"
        >
          ✕
        </button>
        <div className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
          ✅ ትክክለኛ ሰራተኛ (Verified Employee)
        </div>
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#d4af37] mb-4 shadow-lg">
          <img src={verifiedEmployeeModal.imageUrl} alt={verifiedEmployeeModal.nameEng} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-lg font-bold text-white">{verifiedEmployeeModal.nameAmh}</h2>
        <h3 className="text-sm text-gray-300 mb-2">{verifiedEmployeeModal.nameEng}</h3>
        <p className="text-xs text-[#d4af37] font-bold mb-4">{verifiedEmployeeModal.positionAmh} / {verifiedEmployeeModal.positionEng}</p>
        <div className="bg-gray-900 p-3 rounded-xl text-left text-xs space-y-2 border border-gray-700">
          <div className="flex justify-between"><span className="text-gray-400">ቅርንጫፍ:</span> <span className="text-white font-bold">{verifiedEmployeeModal.branchNameAmh || '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">ፋይዳ ቁጥር:</span> <span className="font-mono text-white">{verifiedEmployeeModal.faydaNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">ስልክ ቁጥር:</span> <span className="text-white">{verifiedEmployeeModal.phoneNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">የድርጅት ኢሜይል:</span> <span className="text-white">{verifiedEmployeeModal.orgEmail}</span></div>
          <div className="flex justify-between"><span className="text-green-400 font-semibold">የተሰጠበት ቀን:</span> <span className="text-white font-bold">{verifiedEmployeeModal.dateOfIssue || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-red-400 font-semibold">የሚያበቃበት ቀን:</span> <span className="text-red-400 font-bold">{verifiedEmployeeModal.expireDate || 'N/A'}</span></div>
        </div>
        <button 
          onClick={() => { setVerifiedEmployeeModal(null); window.location.href = "/"; }}
          className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
        >
          ወደ ዋናው ገጽ ተመለስ
        </button>
      </div>
    </div>
  )}

  <div className="print:hidden">
    <Footer />
  </div>
</div>
  );
}

export default HRDashboard;
