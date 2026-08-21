import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// HELPERS
// ============================================================

const EMPTY_EMPLOYEE = {
  id: null,

  // Personal information
  fullName: "",
  staffId: "",
  gender: "",
  birthDate: "",
  nationalId: "",
  passportNo: "",
  nationality: "",
  tinNo: "",
  bankAcc: "",
  pensionNo: "",
  maritalStatus: "",
  address: "",
  phone: "",
  email: "",

  // Service information
  year: "",
  hireDateServiceStart: "",
  retirementDateServiceEnd: "",
  serviceDurationText: "",

  // Salary information
  basicSalary: "",
  pensionAdjustment: "",
  pensionBaseSalary: "",
  allowance1: "",
  allowance2: "",
  totalSalaryForPension: "",
  averagePensionSalary: "",

  // Percentages
  govPercentage: "",
  privatePercentage: "",

  // Pension allowance
  govPensionAllowance: "",
  privatePensionAllowance: "",
  totalPensionAllowance: "",

  // Other allowances
  specialAllowance: "",
  dependentAllowance: "",
  totalAllowanceWithOthers: "",

  // Payment
  pensionAdvancePayment: "",
  pensionRetroactivePayment: "",
  pensionOverpaymentDeduction: "",
  pensionLoanDeduction: "",
  pensionOtherDeduction: "",
  totalDeduction: "",

  // Tax
  pensionTaxableAmount: "",
  pensionTaxAmount: "",

  // Net payment
  netPayable: "",

  // Status
  paymentStatus: "",

  // Notes
  notes: "",
};

const SAMPLE_EMPLOYEES = [
  {
    ...EMPTY_EMPLOYEE,
    id: 1,
    fullName: "አቶ ከበደ አበበ ደሴ",
    staffId: "3107",
    birthDate: "01/01/1950",
    gender: "ወንድ",
    year: "2018",
    netPayable: 27073.64,
    basicSalary: 12992.05,
    pensionAdjustment: 1833,
    govPercentage: 70,
    privatePercentage: 30,
  },
  {
    ...EMPTY_EMPLOYEE,
    id: 2,
    fullName: "ወ/ሮ አበባ ተፈራ ከበደ",
    staffId: "3100",
    birthDate: "01/01/1945",
    gender: "ሴት",
    year: "2017",
    netPayable: 31392.39,
    basicSalary: 12992.05,
    pensionAdjustment: 1833,
    govPercentage: 70,
    privatePercentage: 30,
  },
];

const calculateDateDiff = (startStr, endStr) => {
  if (!startStr || !endStr) {
    return {
      years: 0,
      months: 0,
      days: 0,
    };
  }

  const startMoment = moment(startStr, "DD/MM/YYYY", true);
  const endMoment = moment(endStr, "DD/MM/YYYY", true);

  if (!startMoment.isValid() || !endMoment.isValid()) {
    return {
      years: 0,
      months: 0,
      days: 0,
    };
  }

  if (endMoment.isBefore(startMoment)) {
    return {
      years: 0,
      months: 0,
      days: 0,
    };
  }

  const years = endMoment.diff(startMoment, "years");

  const afterYears = startMoment.clone().add(years, "years");
  const months = endMoment.diff(afterYears, "months");

  const afterMonths = afterYears.clone().add(months, "months");
  const days = endMoment.diff(afterMonths, "days");

  return {
    years,
    months,
    days,
  };
};

const formatServiceDuration = (start, end) => {
  const diff = calculateDateDiff(start, end);

  return `${diff.years} ዓመት ${diff.months} ወር ${diff.days} ቀን`;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const safeNumber = (value) => {
  const number = toNumber(value);

  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PensionManagementSystem = () => {
  const [employeeData, setEmployeeData] = useState(SAMPLE_EMPLOYEES);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedYear, setSelectedYear] = useState("ሁሉም");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------------------------------------------
  // FILTERED DATA
  // ----------------------------------------------------------

  const filteredData = useMemo(() => {
    let data = Array.isArray(employeeData) ? [...employeeData] : [];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      data = data.filter((emp) => {
        const fullName = String(emp?.fullName || "").toLowerCase();
        const staffId = String(emp?.staffId || "").toLowerCase();

        return (
          fullName.includes(search) ||
          staffId.includes(search)
        );
      });
    }

    if (selectedYear !== "ሁሉም") {
      data = data.filter(
        (emp) => String(emp?.year || "") === String(selectedYear)
      );
    }

    return data;
  }, [employeeData, searchTerm, selectedYear]);

  // ----------------------------------------------------------
  // YEAR OPTIONS
  // ----------------------------------------------------------

  const yearOptions = useMemo(() => {
    const years = employeeData
      .map((emp) => emp?.year)
      .filter(Boolean)
      .map(String);

    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [employeeData]);

  // ----------------------------------------------------------
  // MODAL
  // ----------------------------------------------------------

  const openEditModal = (employee = null) => {
    const safeEmployee = {
      ...EMPTY_EMPLOYEE,
      ...(employee || {}),
    };

    setSelectedEmployee(safeEmployee);
    setIsModalOpen(true);
  };

  const openNewEmployeeModal = () => {
    setSelectedEmployee({
      ...EMPTY_EMPLOYEE,
      id: null,
    });

    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  // ----------------------------------------------------------
  // SAVE EMPLOYEE
  // ----------------------------------------------------------

  const saveEmployeeData = (formData) => {
    const safeFormData = {
      ...EMPTY_EMPLOYEE,
      ...(formData || {}),
    };

    const calculated = {
      ...safeFormData,

      id:
        safeFormData.id ||
        Date.now(),

      currentAge: calculateDateDiff(
        safeFormData.birthDate,
        moment().format("DD/MM/YYYY")
      ).years,

      totalServiceYears: calculateDateDiff(
        safeFormData.hireDateServiceStart,
        safeFormData.retirementDateServiceEnd
      ).years,

      serviceDurationText: formatServiceDuration(
        safeFormData.hireDateServiceStart,
        safeFormData.retirementDateServiceEnd
      ),

      basicSalary: toNumber(safeFormData.basicSalary),

      pensionAdjustment: toNumber(
        safeFormData.pensionAdjustment
      ),

      netPayable:
        toNumber(safeFormData.basicSalary) +
        toNumber(safeFormData.pensionAdjustment),
    };

    if (safeFormData.id) {
      setEmployeeData((previous) =>
        previous.map((employee) =>
          employee?.id === calculated.id
            ? calculated
            : employee
        )
      );
    } else {
      setEmployeeData((previous) => [
        ...previous,
        calculated,
      ]);
    }

    closeEditModal();
  };

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  const deleteEmployee = (id) => {
    if (!id) {
      closeEditModal();
      return;
    }

    if (
      window.confirm(
        "እርግጠኛ ነዎት ይህን ሰራተኛ ለመሰረዝ?"
      )
    ) {
      setEmployeeData((previous) =>
        previous.filter(
          (employee) => employee?.id !== id
        )
      );

      closeEditModal();
    }
  };

  // ----------------------------------------------------------
  // EXPORT EXCEL
  // ----------------------------------------------------------

  const exportToExcel = () => {
    const dataToExport = filteredData.map(
      (emp, index) => ({
        "ቁጥር": index + 1,

        "የባለ መብቱ ስም እስከ አያት":
          emp?.fullName || "",

        "ስራ መለያ ቁጥር":
          emp?.staffId || "",

        "ጾታ":
          emp?.gender || "",

        "የትውልድ ዘመን":
          emp?.birthDate || "",

        "ዓመት":
          emp?.year || "",

        "የአገልግሎት መነሻ":
          emp?.hireDateServiceStart || "",

        "የአገልግሎት ማብቂያ":
          emp?.retirementDateServiceEnd || "",

        "ጠቅላላ የአገልግሎት ዘመን":
          emp?.serviceDurationText || "",

        "መሰረታዊ ደመወዝ":
          toNumber(emp?.basicSalary),

        "የጡረታ ማስተካከያ":
          toNumber(emp?.pensionAdjustment),

        "የመንግስት %":
          toNumber(emp?.govPercentage),

        "የግል %":
          toNumber(emp?.privatePercentage),

        "የመንግስት ጡረታ":
          toNumber(emp?.govPensionAllowance),

        "የግል ጡረታ":
          toNumber(emp?.privatePensionAllowance),

        "ጠቅላላ ጡረታ":
          toNumber(emp?.totalPensionAllowance),

        "ጠቅላላ ቅናሽ":
          toNumber(emp?.totalDeduction),

        "የጡረታ ታክስ":
          toNumber(emp?.pensionTaxAmount),

        "የሚጣራ ክፍያ":
          toNumber(emp?.netPayable),

        "የክፍያ ሁኔታ":
          emp?.paymentStatus || "",

        "ስልክ":
          emp?.phone || "",

        "ኢሜይል":
          emp?.email || "",

        "ማስታወሻ":
          emp?.notes || "",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(dataToExport);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "የጡረታ_ሪፖርት"
    );

    const fileYear =
      selectedYear === "ሁሉም"
        ? "ሁሉም"
        : selectedYear;

    XLSX.writeFile(
      workbook,
      `የጡረታ_ሪፖርት_${fileYear}.xlsx`
    );
  };

  // ----------------------------------------------------------
  // CLASSES
  // ----------------------------------------------------------

  const tableHeaderClass =
    "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";

  const tableCellClass =
    "px-6 py-4 whitespace-nowrap text-sm text-gray-900";

  const cardClass =
    "bg-white p-8 rounded-3xl border border-gray-100 shadow-lg";

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="max-w-[90rem] mx-auto p-8 bg-gray-50 min-h-screen rounded-[3rem] font-sans">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="mb-12 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 border-b border-gray-200 pb-8">

        <div className="flex items-center gap-8">

          <img
            src="/logo.jpg"
            alt="POESSA Logo"
            className="h-20 w-20 rounded-full object-cover shadow"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 tracking-tight">
              የተዋሃደ የጡረታ አበል አስተዳደር ስርዓት
            </h1>

            <p className="mt-3 text-lg md:text-2xl text-gray-700">
              ከ40+ አምዶች መረጃ ጋር በንጹህ በይነገጽ ይስሩ
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-4">

          <button
            onClick={exportToExcel}
            className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-md"
          >
            <DocumentArrowDownIcon className="h-7 w-7" />

            ሪፖርት በኤክሴል አውርድ
          </button>

          <button
            onClick={openNewEmployeeModal}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <PlusIcon className="h-7 w-7" />

            አዲስ ሰራተኛ ጨምር
          </button>

        </div>
      </header>

      {/* =====================================================
          SEARCH + TABLE
      ====================================================== */}

      <section className={cardClass}>

        <div className="mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 bg-gray-100 p-6 rounded-2xl">

          {/* SEARCH */}

          <div className="relative flex-grow max-w-3xl">

            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />

            <input
              type="search"
              placeholder="በሰራተኛ ስም ወይም መታወቂያ ቁጥር ይፈልጉ..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="block w-full rounded-full border border-gray-300 pl-16 pr-8 py-5 text-lg shadow-inner focus:border-blue-500 focus:ring-blue-500"
            />

          </div>

          {/* YEAR */}

          <div className="flex items-center gap-6">

            <label className="text-xl font-semibold text-gray-800">
              ዓመት ይምረጡ፡
            </label>

            <select
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(event.target.value)
              }
              className="rounded-full border border-gray-400 pl-6 pr-12 py-5 text-lg bg-white"
            >

              <option value="ሁሉም">
                ሁሉም ዓመታት
              </option>

              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto border rounded-2xl shadow-sm">

          <table className="min-w-full divide-y divide-gray-300">

            <thead className="bg-gray-200">

              <tr>

                <th className={tableHeaderClass}>
                  ቁጥር #
                </th>

                <th className={tableHeaderClass}>
                  የሰራተኛ ስም
                </th>

                <th className={tableHeaderClass}>
                  መታወቂያ
                </th>

                <th className={tableHeaderClass}>
                  የትውልድ ዘመን
                </th>

                <th className={tableHeaderClass}>
                  ዓመት
                </th>

                <th className={tableHeaderClass}>
                  የተጣራ ክፍያ
                </th>

                <th className={tableHeaderClass}>
                  እርምጃ
                </th>

              </tr>

            </thead>

            <tbody className="bg-white divide-y divide-gray-200">

              {filteredData.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500 text-lg"
                  >
                    ምንም መረጃ አልተገኘም
                  </td>
                </tr>

              ) : (

                filteredData.map((emp, index) => (

                  <tr
                    key={emp?.id || index}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >

                    <td className={tableCellClass}>
                      {index + 1}
                    </td>

                    <td className={`${tableCellClass} font-medium`}>
                      {emp?.fullName || "-"}
                    </td>

                    <td className={tableCellClass}>
                      {emp?.staffId || "-"}
                    </td>

                    <td className={tableCellClass}>
                      {emp?.birthDate || "-"}
                    </td>

                    <td className={tableCellClass}>
                      {emp?.year || "-"}
                    </td>

                    <td
                      className={`${tableCellClass} font-semibold text-blue-900`}
                    >
                      {safeNumber(emp?.netPayable)}
                    </td>

                    <td className={tableCellClass}>

                      <button
                        onClick={() =>
                          openEditModal(emp)
                        }
                        className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-base font-medium hover:bg-blue-200 transition"
                      >

                        <PencilSquareIcon className="h-5 w-5" />

                        ሙሉ መረጃ ይመልከቱ/አርትዕ

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          MODAL
      ====================================================== */}

      <Transition
        appear
        show={isModalOpen}
        as={React.Fragment}
      >

        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeEditModal}
        >

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >

            <div className="fixed inset-0 bg-black bg-opacity-40" />

          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">

            <div className="flex min-h-full items-center justify-center p-6 text-center">

              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >

                <Dialog.Panel className="w-full max-w-[85rem] transform overflow-hidden rounded-[2.5rem] bg-white p-8 md:p-12 text-left align-middle shadow-2xl transition-all">

                  <div className="flex items-center justify-between mb-10 border-b border-gray-300 pb-8">

                    <Dialog.Title
                      as="h3"
                      className="text-3xl md:text-4xl font-bold leading-6 text-blue-700"
                    >

                      {selectedEmployee?.id
                        ? "የሰራተኛ ሙሉ መረጃ አርትዖት"
                        : "አዲስ ሰራተኛ መመዝገቢያ"}

                    </Dialog.Title>

                    <div className="flex items-center gap-5">

                      {selectedEmployee?.id && (

                        <button
                          onClick={() =>
                            deleteEmployee(
                              selectedEmployee.id
                            )
                          }
                          className="flex items-center gap-2.5 px-6 py-3 bg-red-100 text-red-700 rounded-full text-lg font-medium hover:bg-red-200 transition"
                        >

                          <TrashIcon className="h-6 w-6" />

                          መዝገቡን ሰርዝ

                        </button>

                      )}

                      <button
                        onClick={closeEditModal}
                        className="text-gray-500 hover:text-gray-800 transition p-1"
                      >

                        <XMarkIcon className="h-10 w-10" />

                      </button>

                    </div>

                  </div>

                  <EmployeeDetailForm
                    employee={
                      selectedEmployee || EMPTY_EMPLOYEE
                    }
                    onSave={saveEmployeeData}
                    onDelete={deleteEmployee}
                  />

                </Dialog.Panel>

              </Transition.Child>

            </div>

          </div>

        </Dialog>

      </Transition>

    </div>
  );
};

// ============================================================
// EMPLOYEE DETAIL FORM
// ============================================================

const EmployeeDetailForm = ({
  employee,
  onSave,
  onDelete,
}) => {

  const safeEmployee = {
    ...EMPTY_EMPLOYEE,
    ...(employee || {}),
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: safeEmployee,
  });

  // IMPORTANT:
  // Reset the form whenever a different employee is selected.
  useEffect(() => {
    reset({
      ...EMPTY_EMPLOYEE,
      ...(employee || {}),
    });
  }, [employee, reset]);

  const inputClass =
    "block w-full rounded-lg border border-gray-400 p-4 text-lg shadow-sm focus:border-blue-600 focus:ring-blue-600";

  const labelClass =
    "block text-lg font-semibold text-gray-800 mb-2";

  // ==========================================================
  // FIELD GROUPS
  // ==========================================================

  const fieldGroups = [
    {
      title: "የግል መረጃ",

      fields: [
        {
          name: "fullName",
          label: "ሙሉ ስም (ስከ አያት)",
          type: "text",
        },

        {
          name: "staffId",
          label: "ስራ መለያ ቁጥር",
          type: "text",
        },

        {
          name: "gender",
          label: "ጾታ",
          type: "select",
          options: ["ወንድ", "ሴት"],
        },

        {
          name: "birthDate",
          label: "የትውልድ ዘመን (DD/MM/YYYY)",
          type: "text",
        },

        {
          name: "nationalId",
          label: "ብሔራዊ መታወቂያ ቁጥር",
          type: "text",
        },

        {
          name: "passportNo",
          label: "ፓስፖርት ቁጥር",
          type: "text",
        },

        {
          name: "nationality",
          label: "ዜግነት",
          type: "text",
        },

        {
          name: "tinNo",
          label: "ግብር ከፋይ ቁጥር (TIN)",
          type: "text",
        },

        {
          name: "bankAcc",
          label: "የባንክ ሂሳብ ቁጥር",
          type: "text",
        },

        {
          name: "pensionNo",
          label: "የጡረታ መለያ ቁጥር",
          type: "text",
        },

        {
          name: "maritalStatus",
          label: "የጋብቻ ሁኔታ",
          type: "select",
          options: [
            "ነጠላ",
            "ያገባ",
            "የፈታ",
            "ባል የሞተባት/ት",
          ],
        },

        {
          name: "address",
          label: "አድራሻ",
          type: "text",
        },

        {
          name: "phone",
          label: "ስልክ ቁጥር",
          type: "text",
        },

        {
          name: "email",
          label: "ኢሜይል",
          type: "email",
        },
      ],
    },

    {
      title: "የአገልግሎት እና የጡረታ መረጃ",

      fields: [
        {
          name: "year",
          label: "ዓመት (እንደ 2018)",
          type: "text",
        },

        {
          name: "hireDateServiceStart",
          label:
            "የአገልግሎት መነሻ ቀን (DD/MM/YYYY)",
          type: "text",
        },

        {
          name: "retirementDateServiceEnd",
          label:
            "የአገልግሎት ማብቂያ/ጡረታ ቀን (DD/MM/YYYY)",
          type: "text",
        },

        {
          name: "serviceDurationText",
          label: "ጠቅላላ የአገልግሎት ዘመን",
          type: "text",
          readOnly: true,
        },

        {
          name: "basicSalary",
          label: "መሰረታዊ ደመወዝ",
          type: "number",
        },

        {
          name: "pensionAdjustment",
          label: "የጡረታ ማስተካከያ (ካሳ)",
          type: "number",
        },

        {
          name: "pensionBaseSalary",
          label: "የጡረታ መሰረት ደመወዝ",
          type: "number",
        },

        {
          name: "allowance1",
          label: "አበል 1",
          type: "number",
        },

        {
          name: "allowance2",
          label: "አበል 2",
          type: "number",
        },

        {
          name: "totalSalaryForPension",
          label:
            "ለጡረታ አበል የተያዘ ጠቅላላ ደመወዝ",
          type: "number",
        },

        {
          name: "averagePensionSalary",
          label: "አማካይ የጡረታ ደመወዝ",
          type: "number",
        },

        {
          name: "govPercentage",
          label: "የመንግስት አገልግሎት (%)",
          type: "number",
        },

        {
          name: "privatePercentage",
          label: "የግል ድርጅት አገልግሎት (%)",
          type: "number",
        },

        {
          name: "govPensionAllowance",
          label: "የመንግስት ጡረታ አበል መጠን",
          type: "number",
        },

        {
          name: "privatePensionAllowance",
          label: "የግል ጡረታ አበል መጠን",
          type: "number",
        },

        {
          name: "totalPensionAllowance",
          label: "ጠቅላላ የጡረታ አበል መጠን",
          type: "number",
        },

        {
          name: "specialAllowance",
          label: "ልዩ ልዩ አበል",
          type: "number",
        },

        {
          name: "dependentAllowance",
          label: "ጥገኝነት አበል",
          type: "number",
        },

        {
          name: "totalAllowanceWithOthers",
          label: "ጠቅላላ ከሌሎች አበል ጋር",
          type: "number",
        },

        {
          name: "pensionAdvancePayment",
          label: "ቅድመ ክፍያ",
          type: "number",
        },

        {
          name: "pensionRetroactivePayment",
          label: "ሬትሮአክቲቭ ክፍያ",
          type: "number",
        },

        {
          name: "pensionOverpaymentDeduction",
          label: "ከመጠን በላይ ክፍያ ቅናሽ",
          type: "number",
        },

        {
          name: "pensionLoanDeduction",
          label: "የብድር ቅናሽ",
          type: "number",
        },

        {
          name: "pensionOtherDeduction",
          label: "ሌሎች ቅናሾች",
          type: "number",
        },

        {
          name: "totalDeduction",
          label: "ጠቅላላ ቅናሾች",
          type: "number",
        },

        {
          name: "pensionTaxableAmount",
          label:
            "ታክስ የሚከፈልበት የጡረታ መጠን",
          type: "number",
        },

        {
          name: "pensionTaxAmount",
          label: "የጡረታ ታክስ መጠን",
          type: "number",
        },

        {
          name: "netPayable",
          label: "የሚጣራ ክፍያ",
          type: "number",
          readOnly: true,
        },

        {
          name: "paymentStatus",
          label: "የክፍያ ሁኔታ",
          type: "select",
          options: [
            "የተከፈለ",
            "ያልተከፈለ",
            "በሂደት ላይ",
          ],
        },

        {
          name: "notes",
          label: "ማስታወሻ",
          type: "textarea",
          fullWidth: true,
        },
      ],
    },
  ];

  // ==========================================================
  // FORM
  // ==========================================================

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="space-y-12"
    >

      {fieldGroups.map((group, groupIndex) => (

        <div
          key={groupIndex}
          className={
            group.title ===
            "የአገልግሎት እና የጡረታ መረጃ"
              ? "bg-blue-50 p-8 rounded-2xl border border-blue-100"
              : ""
          }
        >

          <h4 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-300">
            {group.title}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">

            {group.fields.map((field) => (

              <div
                key={field.name}
                className={`form-group ${
                  field.fullWidth
                    ? "col-span-full"
                    : ""
                }`}
              >

                <label
                  htmlFor={field.name}
                  className={labelClass}
                >
                  {field.label}
                </label>

                {/* SELECT */}

                {field.type === "select" ? (

                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: controllerField }) => (

                      <select
                        {...controllerField}
                        value={
                          controllerField.value ?? ""
                        }
                        id={field.name}
                        className={inputClass}
                        disabled={field.readOnly}
                      >

                        <option value="">
                          ይምረጡ
                        </option>

                        {(field.options || []).map(
                          (option) => (
                            <option
                              key={option}
                              value={option}
                            >
                              {option}
                            </option>
                          )
                        )}

                      </select>

                    )}
                  />

                ) : field.type === "textarea" ? (

                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: controllerField }) => (

                      <textarea
                        {...controllerField}
                        value={
                          controllerField.value ?? ""
                        }
                        id={field.name}
                        className={`${inputClass} h-32`}
                        disabled={field.readOnly}
                      />

                    )}
                  />

                ) : (

                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: controllerField }) => (

                      <input
                        {...controllerField}
                        value={
                          controllerField.value ?? ""
                        }
                        type={field.type}
                        id={field.name}
                        className={inputClass}
                        placeholder={
                          field.placeholder || ""
                        }
                        readOnly={field.readOnly}
                      />

                    )}
                  />

                )}

                {errors?.[field.name] && (
                  <p className="text-red-600 text-sm mt-2">
                    ይህ መስክ ያስፈልጋል
                  </p>
                )}

              </div>

            ))}

          </div>

        </div>

      ))}

      {/* ======================================================
          BUTTONS
      ======================================================= */}

      <div className="flex justify-end gap-6 pt-10 border-t border-gray-300 mt-16">

        {safeEmployee?.id && (

          <button
            type="button"
            onClick={() =>
              onDelete?.(safeEmployee.id)
            }
            className="px-10 py-5 bg-red-600 text-white rounded-full text-xl font-semibold hover:bg-red-700 transition"
          >
            መዝገቡን ሰርዝ
          </button>

        )}

        <button
          type="submit"
          className="px-10 py-5 bg-blue-600 text-white rounded-full text-xl font-semibold hover:bg-blue-700 transition"
        >
          ለውጡን ያስቀምጡ
        </button>

      </div>

    </form>
  );
};

export default PensionManagementSystem;
