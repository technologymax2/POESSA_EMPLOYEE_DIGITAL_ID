import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import Footer from "./Footer";


// ============================================================
// CONFIGURATION
// ============================================================

const IMGBB_API_KEY =
  "ebd592608f4dba1e8271bec8e920c408";

const FRONTEND_URL =
  "https://poessa-employee-digital-id.vercel.app";


// ============================================================
// EMPTY EMPLOYEE FORM
// ============================================================

const EMPTY_EMPLOYEE_FORM = {
  nameAmh: "",
  nameEng: "",
  age: "",
  faydaNumber: "",

  dateOfIssue: "",
  expireDate: "",

  addressAmh: "",
  addressEng: "",

  zone: "",
  city: "",
  woreda: "",

  nationality: "",
  phoneNumber: "",

  positionAmh: "",
  positionEng: "",

  branchAmh: "",
  branchEng: "",
};


// ============================================================
// HR DASHBOARD
// ============================================================

function HRDashboard({
  user,
  handleLogout,
  API_BASE_URL,
}) {
  // ==========================================================
  // EMPLOYEES
  // ==========================================================

  const [employeeList, setEmployeeList] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("employees");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [editingEmployeeId, setEditingEmployeeId] =
    useState(null);


  // ==========================================================
  // EMPLOYEE FORM
  // ==========================================================

  const [employeeForm, setEmployeeForm] =
    useState(EMPTY_EMPLOYEE_FORM);


  // ==========================================================
  // IMAGE
  // ==========================================================

  const [image, setImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const fileInputRef =
    useRef(null);


  // ==========================================================
  // COMPANY INFORMATION
  // ==========================================================

  const [companyLogoUrl, setCompanyLogoUrl] =
    useState(() => {
      return (
        localStorage.getItem(
          "company_logo_url"
        ) || ""
      );
    });

  const [companyPhone, setCompanyPhone] =
    useState(() => {
      return (
        localStorage.getItem(
          "company_phone"
        ) || ""
      );
    });

  const [companyEmail, setCompanyEmail] =
    useState(() => {
      return (
        localStorage.getItem(
          "company_email"
        ) || ""
      );
    });


  const logoInputRef =
    useRef(null);

  const [uploadingLogo, setUploadingLogo] =
    useState(false);


  // ==========================================================
  // STATUS / LOADING
  // ==========================================================

  const [employeeStatus, setEmployeeStatus] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // CARD
  // ==========================================================

  const [selectedIdCard, setSelectedIdCard] =
    useState(null);

  const [printCardType, setPrintCardType] =
    useState("id-card");


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const [validationErrors, setValidationErrors] =
    useState({});


  // ==========================================================
  // VERIFIED EMPLOYEE
  // ==========================================================

  const [verifiedEmployeeModal, setVerifiedEmployeeModal] =
    useState(null);


  // ==========================================================
  // FETCH EMPLOYEES
  // ==========================================================

  const fetchEmployees = useCallback(
    async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/hr/employees`
        );

        const data = await res.json();

        if (data.success) {
          setEmployeeList(
            Array.isArray(data.employees)
              ? data.employees
              : []
          );
        } else {
          console.error(
            "Employee fetch error:",
            data.error
          );
        }
      } catch (error) {
        console.error(
          "Error fetching employees:",
          error
        );
      }
    },
    [API_BASE_URL]
  );


  // ==========================================================
  // INITIAL FETCH
  // ==========================================================

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);


  // ==========================================================
  // QR VERIFICATION URL
  // ==========================================================

  useEffect(() => {
    const path =
      window.location.pathname;

    if (!path.includes("/verify/")) {
      return;
    }

    const idFromUrl =
      path.split("/").pop();

    if (!idFromUrl) {
      return;
    }

    fetch(
      `${API_BASE_URL}/api/hr/verify/${idFromUrl}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifiedEmployeeModal(
            data.employee
          );
        }
      })
      .catch((error) => {
        console.error(
          "Verify error:",
          error
        );
      });
  }, [API_BASE_URL]);


  // ==========================================================
  // EMPLOYEE PHOTO
  // ==========================================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );

    setEmployeeStatus("");
  };


  // ==========================================================
  // COMPANY LOGO UPLOAD
  // ==========================================================

  const handleLogoChange = async (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingLogo(true);

    try {
      const logoData =
        new FormData();

      logoData.append(
        "image",
        file
      );

      const logoRes =
        await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: "POST",
            body: logoData,
          }
        );

      const logoResult =
        await logoRes.json();

      if (!logoResult.success) {
        throw new Error(
          "ሎጎውን መጫን አልተቻለም።"
        );
      }

      const newUrl =
        logoResult.data.url;

      setCompanyLogoUrl(newUrl);

      localStorage.setItem(
        "company_logo_url",
        newUrl
      );

      alert(
        "የድርጅት ሎጎ በስኬት ተቀምጧል!"
      );

    } catch (error) {
      alert(
        "ስህተት፡ " +
          error.message
      );
    } finally {
      setUploadingLogo(false);
    }
  };


  // ==========================================================
  // COMPANY INFORMATION
  // ==========================================================

  const handleCompanyInfoChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "companyPhone") {
      setCompanyPhone(value);

      localStorage.setItem(
        "company_phone",
        value
      );
    }

    if (name === "companyEmail") {
      setCompanyEmail(value);

      localStorage.setItem(
        "company_email",
        value
      );
    }
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    let errors = {
      ...validationErrors,
    };


    // --------------------------------------------------------
    // FAYDA NUMBER
    // --------------------------------------------------------

    if (name === "faydaNumber") {
      const cleanValue =
        value
          .replace(/\D/g, "")
          .slice(0, 16);

      if (
        cleanValue.length > 0 &&
        cleanValue.length < 16
      ) {
        errors[name] =
          `⚠️ የፋይዳ ቁጥር 16 ዲጂት መሆን አለበት! (${cleanValue.length}/16)`;
      } else {
        delete errors[name];
      }

      setEmployeeForm((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));

      setValidationErrors(errors);

      return;
    }


    // --------------------------------------------------------
    // PHONE NUMBER
    // --------------------------------------------------------

    if (name === "phoneNumber") {
      let cleanValue =
        value.replace(/\D/g, "");

      if (
        cleanValue.length > 0 &&
        cleanValue[0] !== "0"
      ) {
        errors[name] =
          "⚠️ ስልክ ቁጥር በ 0 መጀመር አለበት!";

        setValidationErrors(
          errors
        );

        return;
      }

      cleanValue =
        cleanValue.substring(
          0,
          10
        );

      if (
        cleanValue.length > 0 &&
        cleanValue.length < 10
      ) {
        errors[name] =
          `⚠️ ስልክ ቁጥር 10 ዲጂት መሆን አለበት! (${cleanValue.length}/10)`;
      } else {
        delete errors[name];
      }

      setEmployeeForm((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));

      setValidationErrors(
        errors
      );

      return;
    }


    // --------------------------------------------------------
    // EXPIRY DATE
    // --------------------------------------------------------

    if (
      name === "expireDate" &&
      employeeForm.dateOfIssue &&
      value < employeeForm.dateOfIssue
    ) {
      errors.expireDate =
        "⚠️ የማብቂያ ቀን ከተሰጠበት ቀን ቀድሞ ሊሆን አይችልም!";
    } else if (
      name === "expireDate"
    ) {
      delete errors.expireDate;
    }


    // --------------------------------------------------------
    // NORMAL FIELDS
    // --------------------------------------------------------

    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors(
      errors
    );
  };


  // ==========================================================
  // EDIT EMPLOYEE
  // ==========================================================

  const handleEditClick = (emp) => {
    setEditingEmployeeId(
      emp._id
    );

    setEmployeeForm({
      nameAmh:
        emp.nameAmh || "",

      nameEng:
        emp.nameEng || "",

      age:
        emp.age || "",

      faydaNumber:
        emp.faydaNumber || "",

      dateOfIssue:
        emp.dateOfIssue || "",

      expireDate:
        emp.expireDate || "",

      addressAmh:
        emp.addressAmh || "",

      addressEng:
        emp.addressEng || "",

      zone:
        emp.zone || "",

      city:
        emp.city || "",

      woreda:
        emp.woreda || "",

      nationality:
        emp.nationality || "",

      phoneNumber:
        emp.phoneNumber || "",

      positionAmh:
        emp.positionAmh || "",

      positionEng:
        emp.positionEng || "",

      branchAmh:
        emp.branchAmh || "",

      branchEng:
        emp.branchEng || "",
    });


    // --------------------------------------------------------
    // USE EXISTING EMPLOYEE PHOTO
    // --------------------------------------------------------

    setImagePreview(
      emp.imageUrl || null
    );

    setImage(null);

    setValidationErrors({});

    setEmployeeStatus("");

    setActiveTab(
      "register"
    );

    setSidebarOpen(false);
  };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetEmployeeForm = () => {
    setEditingEmployeeId(
      null
    );

    setEmployeeForm({
      ...EMPTY_EMPLOYEE_FORM,
    });

    setImage(null);

    setImagePreview(null);

    setValidationErrors({});

    setEmployeeStatus("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };


  // ==========================================================
  // SUBMIT EMPLOYEE
  // ==========================================================

  const handleEmployeeSubmit =
    async (e) => {
      e.preventDefault();


      // ------------------------------------------------------
      // PHOTO
      // ------------------------------------------------------

      if (
        !image &&
        !imagePreview
      ) {
        setEmployeeStatus(
          "⚠️ እባክዎ የሰራተኛውን ፎቶ ይምረጡ!"
        );

        return;
      }


      // ------------------------------------------------------
      // FAYDA
      // ------------------------------------------------------

      if (
        employeeForm.faydaNumber.length !==
        16
      ) {
        setEmployeeStatus(
          "❌ የፋይዳ ቁጥር 16 አሃዝ መሆን አለበት!"
        );

        return;
      }


      // ------------------------------------------------------
      // PHONE
      // ------------------------------------------------------

      if (
        employeeForm.phoneNumber.length !==
        10
      ) {
        setEmployeeStatus(
          "❌ ስልክ ቁጥር 10 አሃዝ መሆን አለበት!"
        );

        return;
      }


      // ------------------------------------------------------
      // EXPIRY DATE
      // ------------------------------------------------------

      if (
        employeeForm.dateOfIssue &&
        employeeForm.expireDate &&
        employeeForm.expireDate <
          employeeForm.dateOfIssue
      ) {
        setEmployeeStatus(
          "❌ የማብቂያ ቀን ከተሰጠበት ቀን በፊት ሊሆን አይችልም!"
        );

        return;
      }


      setLoading(true);

      setEmployeeStatus(
        "⏳ መረጃ በመጫን ላይ..."
      );


      try {
        // ====================================================
        // EMPLOYEE PHOTO
        // ====================================================

        let finalImageUrl =
          imagePreview || "";


        if (image) {
          const imgData =
            new FormData();

          imgData.append(
            "image",
            image
          );

          const imgRes =
            await fetch(
              `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
              {
                method: "POST",
                body: imgData,
              }
            );

          const imgResult =
            await imgRes.json();

          if (
            !imgResult.success
          ) {
            throw new Error(
              "የሰራተኛውን ፎቶ መጫን አልተቻለም።"
            );
          }

          finalImageUrl =
            imgResult.data.url;
        }


        // ====================================================
        // FINAL DATA
        // ====================================================

        const finalData = {
          // Personal
          nameAmh:
            employeeForm.nameAmh.trim(),

          nameEng:
            employeeForm.nameEng.trim(),

          age:
            String(
              employeeForm.age
            ).trim(),

          faydaNumber:
            employeeForm.faydaNumber.trim(),


          // Dates
          dateOfIssue:
            employeeForm.dateOfIssue,

          expireDate:
            employeeForm.expireDate,


          // Address
          addressAmh:
            employeeForm.addressAmh.trim(),

          addressEng:
            employeeForm.addressEng.trim(),

          zone:
            employeeForm.zone.trim(),

          city:
            employeeForm.city.trim(),

          woreda:
            employeeForm.woreda.trim(),


          // Other
          nationality:
            employeeForm.nationality.trim(),

          phoneNumber:
            employeeForm.phoneNumber.trim(),


          // Position
          positionAmh:
            employeeForm.positionAmh.trim(),

          positionEng:
            employeeForm.positionEng.trim(),


          // Branch
          branchAmh:
            employeeForm.branchAmh.trim(),

          branchEng:
            employeeForm.branchEng.trim(),


          // Organization
          logoUrl:
            companyLogoUrl || "",

          orgPhoneNumber:
            companyPhone || "",

          orgEmail:
            companyEmail || "",


          // Employee photo
          imageUrl:
            finalImageUrl,


          // Status
          status:
            "approved",

          approved:
            true,
        };


        console.log(
          "EMPLOYEE DATA BEING SENT:",
          finalData
        );


        // ====================================================
        // URL / METHOD
        // ====================================================

        let url =
          `${API_BASE_URL}/api/hr/employees`;

        let method =
          "POST";


        if (
          editingEmployeeId
        ) {
          url =
            `${API_BASE_URL}/api/hr/employees/${editingEmployeeId}`;

          method =
            "PUT";
        }


        // ====================================================
        // REQUEST
        // ====================================================

        const res =
          await fetch(
            url,
            {
              method,

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  finalData
                ),
            }
          );


        const data =
          await res.json();


        // ====================================================
        // SUCCESS
        // ====================================================

        if (
          res.ok &&
          data.success
        ) {
          const wasEditing =
            Boolean(
              editingEmployeeId
            );


          setEmployeeStatus(
            wasEditing
              ? "✅ የሰራተኛው መረጃ በስኬት ተስተካክሏል!"
              : "✅ ሰራተኛው በስኬት ተመዝግቧል!"
          );


          resetEmployeeForm();

          await fetchEmployees();

        } else {
          setEmployeeStatus(
            data.error ||
              data.message ||
              "❌ የሰርቨር ስህተት!"
          );
        }

      } catch (error) {
        console.error(
          "Employee submit error:",
          error
        );

        setEmployeeStatus(
          `❌ ስህተት፡ ${error.message}`
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // DELETE EMPLOYEE
  // ==========================================================

  const handleDeleteEmployee =
    async (id) => {
      if (
        !window.confirm(
          "ይህንን ሰራተኛ ማጥፋት ይፈልጋሉ?"
        )
      ) {
        return;
      }

      try {
        const res =
          await fetch(
            `${API_BASE_URL}/api/hr/employees/${id}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          await res.json();

        if (
          res.ok &&
          data.success
        ) {
          alert(
            "ሰራተኛው ተሰርዟል!"
          );

          await fetchEmployees();
        } else {
          alert(
            data.error ||
              "ማጥፋት አልተቻለም!"
          );
        }

      } catch (error) {
        console.error(error);

        alert(
          "ማጥፋት አልተቻለም!"
        );
      }
    };


  // ==========================================================
  // RESIGN EMPLOYEE
  // ==========================================================

  const handleResignEmployee =
    async (emp) => {
      const resignedDate =
        window.prompt(
          "የስራ መልቀቂያ ቀን ያስገቡ (YYYY-MM-DD):",
          new Date()
            .toISOString()
            .split("T")[0]
        );

      if (!resignedDate) {
        return;
      }


      const resignationReason =
        window.prompt(
          "የስራ መልቀቂያ ምክንያት ያስገቡ:"
        );

      if (
        resignationReason ===
        null
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          `${emp.nameAmh || emp.nameEng} ድርጅቱን ለቋል ብለው መመዝገብ ይፈልጋሉ?`
        );

      if (!confirmed) {
        return;
      }


      try {
        setLoading(true);

        const res =
          await fetch(
            `${API_BASE_URL}/api/hr/employees/${emp._id}/resign`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  resignedDate,
                  resignationReason,
                }),
            }
          );


        const data =
          await res.json();


        if (
          res.ok &&
          data.success
        ) {
          setEmployeeStatus(
            "✅ ሰራተኛው ከድርጅቱ መልቀቁ ተመዝግቧል!"
          );

          await fetchEmployees();

        } else {
          setEmployeeStatus(
            data.error ||
              "❌ የስራ መልቀቁን መመዝገብ አልተቻለም!"
          );
        }

      } catch (error) {
        console.error(
          "Resignation error:",
          error
        );

        setEmployeeStatus(
          "❌ የሰራተኛውን የስራ መልቀቅ ማስመዝገብ አልተቻለም!"
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap justify-between items-center bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-md gap-4 mb-6">

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            className="bg-yellow-400 text-gray-900 p-2 px-3 rounded-xl text-lg font-bold"
          >
            ☰
          </button>

          <h2 className="text-lg sm:text-2xl font-bold">
            🏢 HR ዳሽቦርድ
            {" - "}
            እንኳን ደህና መጡ{" "}
            {user?.name || ""}
          </h2>

        </div>


        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
        >
          ውጣ (Logout)
        </button>

      </div>


      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex relative gap-6 items-start flex-1">


        {/* ====================================================
            MOBILE OVERLAY
        ==================================================== */}

        {sidebarOpen && (
          <div
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}


        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <div
          className={`
            fixed lg:relative
            top-0 left-0
            h-full lg:h-auto
            w-64
            bg-gray-800
            border-r lg:border
            border-gray-700
            rounded-none lg:rounded-2xl
            p-4
            flex flex-col
            gap-2
            z-50
            transition-transform
            duration-300
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >

          <button
            onClick={() => {
              setActiveTab(
                "employees"
              );

              setSidebarOpen(
                false
              );
            }}
            className={`
              w-full text-left
              p-3 rounded-xl
              font-bold
              ${
                activeTab ===
                "employees"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }
            `}
          >
            📋 ሰራተኞች ዝርዝር
          </button>


          <button
            onClick={() => {
              resetEmployeeForm();

              setActiveTab(
                "register"
              );

              setSidebarOpen(
                false
              );
            }}
            className={`
              w-full text-left
              p-3 rounded-xl
              font-bold
              ${
                activeTab ===
                "register"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }
            `}
          >
            ➕ አዲስ ሰራተኛ መመዝገቢያ
          </button>

        </div>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="flex-1 w-full min-w-0">

          <div className="grid grid-cols-1 gap-8">


            {/* ==================================================
                REGISTER / EDIT
            ================================================== */}

            {activeTab === "register" && (

              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">

                <h3 className="text-xl font-bold mb-4 text-blue-400">

                  {editingEmployeeId
                    ? "✏️ የሰራተኛ መረጃ ማስተካከያ"
                    : "➕ አዲስ ሰራተኛ መመዝገቢያ"}

                </h3>


                {/* ============================================
                    COMPANY SETTINGS
                ============================================ */}

                <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-xl">

                  <div className="text-sm font-bold text-yellow-400 border-b border-gray-700 pb-2 mb-4">
                    🏢 የድርጅት ቋሚ መረጃ
                  </div>


                  <div className="flex flex-wrap items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">

                        {companyLogoUrl ? (
                          <img
                            src={companyLogoUrl}
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            LOGO
                          </span>
                        )}

                      </div>


                      <div>

                        <div className="text-xs font-bold text-gray-200">
                          የድርጅት ሎጎ
                        </div>

                        <div className="text-[11px] text-gray-400">
                          {companyLogoUrl
                            ? "✅ ተቀምጧል"
                            : "⚠️ አልተጫነም"}
                        </div>

                      </div>

                    </div>


                    <div>

                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={
                          handleLogoChange
                        }
                        className="hidden"
                        accept="image/*"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          logoInputRef.current?.click()
                        }
                        disabled={
                          uploadingLogo
                        }
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-blue-300 text-xs font-bold rounded-lg"
                      >
                        {uploadingLogo
                          ? "እየጫነ ነው..."
                          : companyLogoUrl
                          ? "ሎጎ ቀይር"
                          : "ሎጎ ጫን"}
                      </button>

                    </div>

                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

                    <input
                      type="text"
                      name="companyPhone"
                      placeholder="የድርጅት ስልክ"
                      value={companyPhone}
                      onChange={
                        handleCompanyInfoChange
                      }
                      className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="email"
                      name="companyEmail"
                      placeholder="የድርጅት Email"
                      value={companyEmail}
                      onChange={
                        handleCompanyInfoChange
                      }
                      className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                    />

                  </div>

                </div>


                {/* ============================================
                    FORM
                ============================================ */}

                <form
                  onSubmit={
                    handleEmployeeSubmit
                  }
                  className="flex flex-col gap-4"
                >


                  {/* PHOTO */}

                  <div className="flex flex-col items-center">

                    <label className="text-xs text-gray-300 mb-1 font-semibold">
                      የሰራተኛ ፎቶ
                    </label>

                    <div
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="w-24 h-28 bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500"
                    >

                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Employee"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[11px] text-center text-gray-400">
                          📷 ፎቶ ይምረጡ
                        </div>
                      )}

                    </div>


                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                      accept="image/*"
                    />

                  </div>


                  {/* NAME */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                      type="text"
                      name="nameAmh"
                      placeholder="ሙሉ ስም (አማርኛ)"
                      value={
                        employeeForm.nameAmh
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="nameEng"
                      placeholder="Full Name (English)"
                      value={
                        employeeForm.nameEng
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                  </div>


                  {/* POSITION */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                      type="text"
                      name="positionAmh"
                      placeholder="የስራ መደብ (አማርኛ)"
                      value={
                        employeeForm.positionAmh
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="positionEng"
                      placeholder="Position (English)"
                      value={
                        employeeForm.positionEng
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                  </div>


                  {/* FAYDA + PHONE */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div>

                      <input
                        type="text"
                        name="faydaNumber"
                        maxLength="16"
                        placeholder="የፋይዳ ቁጥር (16 Digits)"
                        value={
                          employeeForm.faydaNumber
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                      />

                      <span className="text-[11px] text-gray-400">
                        ({employeeForm.faydaNumber.length}/16)
                      </span>

                      {validationErrors.faydaNumber && (
                        <span className="text-[11px] text-red-400 block">
                          {validationErrors.faydaNumber}
                        </span>
                      )}

                    </div>


                    <div>

                      <input
                        type="text"
                        name="phoneNumber"
                        maxLength="10"
                        placeholder="ሰራተኛው ስልክ ቁጥር"
                        value={
                          employeeForm.phoneNumber
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                      />

                      <span className="text-[11px] text-gray-400">
                        ({employeeForm.phoneNumber.length}/10)
                      </span>

                    </div>

                  </div>


                  {/* NATIONALITY + BRANCH ENGLISH */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                      type="text"
                      name="nationality"
                      placeholder="ዜግነት / Nationality"
                      value={
                        employeeForm.nationality
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="branchEng"
                      placeholder="Branch Office (English)"
                      value={
                        employeeForm.branchEng
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                  </div>


                  {/* BRANCH AMHARIC */}

                  <input
                    type="text"
                    name="branchAmh"
                    placeholder="ቅርንጫፍ መስሪያ ቤት (አማርኛ)"
                    value={
                      employeeForm.branchAmh
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                  />


                  {/* ADDRESS */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                      type="text"
                      name="addressAmh"
                      placeholder="አድራሻ (አማርኛ)"
                      value={
                        employeeForm.addressAmh
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="addressEng"
                      placeholder="Address (English)"
                      value={
                        employeeForm.addressEng
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                  </div>


                  {/* ZONE / CITY / WOREDA */}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <input
                      type="text"
                      name="zone"
                      placeholder="ዞን / Zone"
                      value={
                        employeeForm.zone
                      }
                      onChange={
                        handleChange
                      }
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="city"
                      placeholder="ከተማ / City"
                      value={
                        employeeForm.city
                      }
                      onChange={
                        handleChange
                      }
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                    <input
                      type="text"
                      name="woreda"
                      placeholder="ወረዳ / Woreda"
                      value={
                        employeeForm.woreda
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                    />

                  </div>


                  {/* AGE / DATES */}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div>

                      <label className="text-xs text-gray-400 mb-1 block">
                        እድሜ / Age
                      </label>

                      <input
                        type="number"
                        name="age"
                        value={
                          employeeForm.age
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                      />

                    </div>


                    <div>

                      <label className="text-xs text-green-400 mb-1 block font-bold">
                        📅 የተሰጠበት ቀን
                      </label>

                      <input
                        type="date"
                        name="dateOfIssue"
                        value={
                          employeeForm.dateOfIssue
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                      />

                    </div>


                    <div>

                      <label className="text-xs text-red-400 mb-1 block font-bold">
                        ⏳ የሚያበቃበት ቀን
                      </label>

                      <input
                        type="date"
                        name="expireDate"
                        value={
                          employeeForm.expireDate
                        }
                        onChange={
                          handleChange
                        }
                        required
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                      />

                    </div>

                  </div>


                  {validationErrors.expireDate && (
                    <span className="text-[11px] text-red-400">
                      {validationErrors.expireDate}
                    </span>
                  )}


                  {/* SUBMIT */}

                  <div className="flex gap-3 mt-2">

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                      {loading
                        ? "እየተቀመጠ ነው..."
                        : editingEmployeeId
                        ? "ለውጦችን አስቀምጥ"
                        : "ሰራተኛውን መዝግብ"}
                    </button>


                    {editingEmployeeId && (
                      <button
                        type="button"
                        onClick={() => {
                          resetEmployeeForm();
                        }}
                        className="py-3.5 px-5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl"
                      >
                        ሰርዝ
                      </button>
                    )}

                  </div>

                </form>


                {employeeStatus && (
                  <p className="mt-4 text-center font-medium text-green-400 text-sm">
                    {employeeStatus}
                  </p>
                )}

              </div>
            )}


            {/* ==================================================
                EMPLOYEE LIST
            ================================================== */}

            {activeTab ===
              "employees" && (

              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 overflow-x-auto">

                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  📋 የተመዘገቡ ሰራተኞች ዝርዝር
                </h3>


                <table className="w-full text-left border-collapse min-w-[700px]">

                  <thead>

                    <tr className="border-b border-gray-700 text-gray-400 text-sm">

                      <th className="p-3">
                        ስም
                      </th>

                      <th className="p-3">
                        የስራ መደብ
                      </th>

                      <th className="p-3">
                        የፋይዳ ቁጥር
                      </th>

                      <th className="p-3">
                        Branch
                      </th>

                      <th className="p-3">
                        እርምጃ
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-700">

                    {employeeList.map(
                      (emp) => (

                      <tr
                        key={
                          emp._id
                        }
                        className="hover:bg-gray-700/30"
                      >

                        <td className="p-3">

                          <div className="flex items-center gap-3">

                            <img
                              src={
                                emp.imageUrl ||
                                "https://via.placeholder.com/40"
                              }
                              alt={
                                emp.nameEng
                              }
                              className="w-10 h-10 rounded-full object-cover border border-blue-500"
                            />

                            <div>

                              <div className="font-semibold">
                                {
                                  emp.nameAmh
                                }
                              </div>

                              <div className="text-xs text-gray-400">
                                {
                                  emp.nameEng
                                }
                              </div>

                            </div>

                          </div>

                        </td>


                        <td className="p-3">

                          <div>
                            {
                              emp.positionAmh
                            }
                          </div>

                          <div className="text-xs text-gray-400">
                            {
                              emp.positionEng
                            }
                          </div>

                        </td>


                        <td className="p-3 font-mono text-xs text-blue-300">
                          {
                            emp.faydaNumber
                          }
                        </td>


                        <td className="p-3">

                          <div className="text-sm">
                            {
                              emp.branchAmh ||
                              "-"
                            }
                          </div>

                          <div className="text-xs text-gray-400">
                            {
                              emp.branchEng ||
                              "-"
                            }
                          </div>

                        </td>


                        <td className="p-3">

                          <div className="flex gap-2 items-center flex-wrap">

                            <button
                              onClick={() => {
                                setSelectedIdCard(
                                  emp
                                );

                                setPrintCardType(
                                  "id-card"
                                );
                              }}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
                            >
                              🪪 እይ/አትም
                            </button>


                            <button
                              onClick={() =>
                                handleEditClick(
                                  emp
                                )
                              }
                              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold rounded-lg"
                            >
                              ✏️ አስተካክል
                            </button>


                            {emp.status !==
                              "resigned" && (

                              <button
                                onClick={() =>
                                  handleResignEmployee(
                                    emp
                                  )
                                }
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg"
                              >
                                🚪 ስራ ለቋል
                              </button>

                            )}


                            <button
                              onClick={() =>
                                handleDeleteEmployee(
                                  emp._id
                                )
                              }
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                            >
                              🗑 አጥፋ
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                    )}


                    {employeeList.length ===
                      0 && (

                      <tr>

                        <td
                          colSpan="5"
                          className="p-6 text-center text-gray-500"
                        >
                          ምንም የተመዘገበ ሰራተኛ የለም።
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          ID CARD MODAL
      ====================================================== */}

      {selectedIdCard && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">

          <div className="flex flex-col items-center gap-6 my-auto">

            <button
              onClick={() =>
                setSelectedIdCard(
                  null
                )
              }
              className="text-white bg-red-600 w-8 h-8 rounded-full"
            >
              ✕
            </button>


            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 w-full max-w-md">

              <label className="text-xs text-yellow-400 font-bold">
                🪪 የካርድ ቅርጽ ይምረጡ
              </label>


              <div className="grid grid-cols-2 gap-2 mt-2">

                <button
                  onClick={() =>
                    setPrintCardType(
                      "id-card"
                    )
                  }
                  className={`py-2 rounded-lg text-xs font-bold ${
                    printCardType ===
                    "id-card"
                      ? "bg-blue-600"
                      : "bg-gray-900"
                  }`}
                >
                  መደበኛ ID
                </button>


                <button
                  onClick={() =>
                    setPrintCardType(
                      "badge"
                    )
                  }
                  className={`py-2 rounded-lg text-xs font-bold ${
                    printCardType ===
                    "badge"
                      ? "bg-blue-600"
                      : "bg-gray-900"
                  }`}
                >
                  የደረት ባጅ
                </button>

              </div>

            </div>


            {/* =================================================
                SIMPLE ID CARD PREVIEW
            ================================================= */}

            <div className="flex flex-col sm:flex-row gap-6 items-center">

              <div className="w-[300px] h-[420px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-yellow-500 overflow-hidden relative flex flex-col">

                <div className="p-4 text-center">

                  {(
                    selectedIdCard.logoUrl ||
                    companyLogoUrl
                  ) ? (

                    <img
                      src={
                        selectedIdCard.logoUrl ||
                        companyLogoUrl
                      }
                      alt="Logo"
                      className="w-12 h-12 mx-auto rounded-full object-cover"
                    />

                  ) : (
                    <div className="text-xs">
                      LOGO
                    </div>
                  )}

                  <h2 className="font-bold mt-2">
                    POESSA
                  </h2>

                  <p className="text-[9px] text-yellow-400">
                    የግል ድርጅት ሰራተኞች
                    ማህበራዊ ዋስትና
                    አስተዳደር
                  </p>

                </div>


                <div className="flex flex-col items-center">

                  <img
                    src={
                      selectedIdCard.imageUrl ||
                      "https://via.placeholder.com/100"
                    }
                    alt={
                      selectedIdCard.nameEng
                    }
                    className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500"
                  />

                  <h3 className="text-sm font-bold mt-2">
                    {
                      selectedIdCard.nameAmh
                    }
                  </h3>

                  <h4 className="text-xs text-gray-300">
                    {
                      selectedIdCard.nameEng
                    }
                  </h4>

                  <p className="text-[10px] text-yellow-400 mt-1">
                    {
                      selectedIdCard.positionAmh
                    }
                    {" / "}
                    {
                      selectedIdCard.positionEng
                    }
                  </p>

                </div>


                <div className="mx-3 mt-3 p-3 bg-black/30 rounded-lg text-xs space-y-2">

                  <div className="flex justify-between">
                    <span>
                      ዜግነት:
                    </span>
                    <span>
                      {
                        selectedIdCard.nationality ||
                        "-"
                      }
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span>
                      Branch:
                    </span>

                    <span className="text-right">
                      {
                        selectedIdCard.branchEng ||
                        "-"
                      }
                      <br />
                      {
                        selectedIdCard.branchAmh ||
                        "-"
                      }
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span>
                      ስልክ:
                    </span>

                    <span>
                      {
                        selectedIdCard.phoneNumber ||
                        "-"
                      }
                    </span>
                  </div>


                  <div className="flex justify-between">
                    <span>
                      አድራሻ:
                    </span>

                    <span>
                      {
                        selectedIdCard.addressAmh ||
                        selectedIdCard.addressEng ||
                        "-"
                      }
                    </span>
                  </div>

                </div>


                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-center p-2 text-[8px]">
                  POESSA - Employee ID
                </div>

              </div>


              {/* BACK */}

              <div className="w-[300px] h-[420px] bg-[#0b192c] text-white rounded-xl shadow-2xl border-2 border-yellow-500 p-4 flex flex-col">

                <h3 className="text-yellow-400 font-bold text-center text-sm">
                  የሰራተኛ መረጃ
                </h3>


                <div className="mt-4 bg-black/30 p-3 rounded-lg text-xs space-y-3">

                  <div>
                    <span className="text-gray-400">
                      የፋይዳ ቁጥር:
                    </span>

                    <div className="font-mono">
                      {
                        selectedIdCard.faydaNumber
                      }
                    </div>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      ቅርንጫፍ:
                    </span>

                    <div>
                      {
                        selectedIdCard.branchAmh ||
                        "-"
                      }
                    </div>

                    <div className="text-gray-400">
                      {
                        selectedIdCard.branchEng ||
                        "-"
                      }
                    </div>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      አድራሻ:
                    </span>

                    <div>
                      {
                        selectedIdCard.addressAmh ||
                        selectedIdCard.addressEng ||
                        "-"
                      }
                    </div>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      ከተማ:
                    </span>

                    <div>
                      {
                        selectedIdCard.city ||
                        "-"
                      }
                    </div>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      ወረዳ:
                    </span>

                    <div>
                      {
                        selectedIdCard.woreda ||
                        "-"
                      }
                    </div>
                  </div>

                </div>


                <div className="mt-auto flex flex-col items-center">

                  <div className="bg-white p-2 rounded-lg">

                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `${FRONTEND_URL}/verify/${selectedIdCard._id}`
                      )}`}
                      alt="QR"
                      className="w-28 h-28"
                    />

                  </div>

                  <span className="text-[9px] text-yellow-400 mt-2">
                    SCAN TO VERIFY
                  </span>

                </div>

              </div>

            </div>


            <button
              onClick={() =>
                window.print()
              }
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              🖨 ሰነዱን አትም
            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          QR VERIFIED EMPLOYEE
      ====================================================== */}

      {verifiedEmployeeModal && (

        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">

          <div className="bg-gray-800 border-2 border-green-500 rounded-2xl p-6 max-w-sm w-full text-center">

            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
              ✅ ትክክለኛ ሰራተኛ
            </div>


            <img
              src={
                verifiedEmployeeModal.imageUrl
              }
              alt={
                verifiedEmployeeModal.nameEng
              }
              className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-yellow-500 mb-4"
            />


            <h2 className="text-lg font-bold">
              {
                verifiedEmployeeModal.nameAmh
              }
            </h2>


            <h3 className="text-sm text-gray-300">
              {
                verifiedEmployeeModal.nameEng
              }
            </h3>


            <p className="text-xs text-yellow-400 font-bold mt-2">
              {
                verifiedEmployeeModal.positionAmh
              }
              {" / "}
              {
                verifiedEmployeeModal.positionEng
              }
            </p>


            <div className="bg-gray-900 p-3 rounded-xl text-left text-xs space-y-2 mt-4">

              <div className="flex justify-between">
                <span className="text-gray-400">
                  ፋይዳ:
                </span>

                <span>
                  {
                    verifiedEmployeeModal.faydaNumber
                  }
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-gray-400">
                  ስልክ:
                </span>

                <span>
                  {
                    verifiedEmployeeModal.phoneNumber ||
                    "-"
                  }
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-gray-400">
                  Branch:
                </span>

                <span className="text-right">
                  {
                    verifiedEmployeeModal.branchEng ||
                    "-"
                  }
                  <br />
                  {
                    verifiedEmployeeModal.branchAmh ||
                    "-"
                  }
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-gray-400">
                  Email:
                </span>

                <span>
                  {
                    verifiedEmployeeModal.orgEmail ||
                    "-"
                  }
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-green-400">
                  የተሰጠበት:
                </span>

                <span>
                  {
                    verifiedEmployeeModal.dateOfIssue ||
                    "-"
                  }
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-red-400">
                  የሚያበቃበት:
                </span>

                <span>
                  {
                    verifiedEmployeeModal.expireDate ||
                    "-"
                  }
                </span>
              </div>

            </div>


            <button
              onClick={() => {
                setVerifiedEmployeeModal(
                  null
                );

                window.location.href =
                  "/";
              }}
              className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
            >
              ወደ ዋናው ገጽ ተመለስ
            </button>

          </div>

        </div>

      )}


      <Footer />

    </div>
  );
}


export default HRDashboard;
