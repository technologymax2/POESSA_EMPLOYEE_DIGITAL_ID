import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';
import 'moment-ethiopian';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, PencilSquareIcon, DocumentArrowDownIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

// --- Helpers ---
const calculateDateDiff = (startStr, endStr) => {
    if (!startStr || !endStr) return { years: 0, months: 0, days: 0 };
    const start = moment(startStr, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const end = moment(endStr, 'DD/MM/YYYY').format('YYYY-MM-DD');
    if (!moment(start, 'YYYY-MM-DD').isValid() || !moment(end, 'YYYY-MM-DD').isValid()) return { years: 0, months: 0, days: 0 };
    const duration = moment.duration(moment(end).diff(moment(start)));
    return { years: duration.years(), months: duration.months(), days: duration.days() };
};

// --- Main Component ---
const PensionManagementSystem = () => {
    const [employeeData, setEmployeeData] = useState([
        { id: 1, fullName: "አቶ ከበደ አበበ ደሴ", staffId: "3107", birthDate: "01/01/1950", gender: "ወንድ", year: "2018", netPayable: 27073.64, basicSalary: 12992.05, pensionAdjustment: 1833, hireDateServiceStart: "01/11/1973", retirementDateServiceEnd: "30/10/2018", govPercentage: 70, privatePercentage: 30 }, // Example Data
        { id: 2, fullName: "ወ/ሮ አበባ ተፈራ ከበደ", staffId: "3100", birthDate: "01/01/1945", gender: "ሴት", year: "2017", netPayable: 31392.39, basicSalary: 12992.05, pensionAdjustment: 1833, hireDateServiceStart: "01/11/1973", retirementDateServiceEnd: "30/10/2018", govPercentage: 70, privatePercentage: 30 }, // Example Data
        // ሌሎች መረጃዎችን እዚህ ይጫኑ
    ]);
    const [filteredData, setFilteredData] = useState(employeeData);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('ሁሉም');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Effects ---
    useEffect(() => {
        let data = employeeData;
        if (searchTerm) {
            data = data.filter(emp =>
                emp.fullName.includes(searchTerm) || emp.staffId.includes(searchTerm)
            );
        }
        if (selectedYear !== 'ሁሉም') {
            data = data.filter(emp => emp.year === selectedYear);
        }
        setFilteredData(data);
    }, [searchTerm, selectedYear, employeeData]);

    // --- Handlers ---
    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleYearFilter = (e) => setSelectedYear(e.target.value);

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedEmployee(null);
        setIsModalOpen(false);
    };

    const saveEmployeeData = (formData) => {
        // 1. በስርዓቱ የሚሰሉትን እሴቶች በሙሉ እዚህ ያሰሉ (40+ አመክንዮ እዚህ ይተገበራል)
        const calculated = {
            ...formData,
            id: formData.id || Date.now(), // አዲስ መዝገብ ከሆነ ID ይስጡት
            currentAge: calculateDateDiff(formData.birthDate, moment().format('DD/MM/YYYY')).years,
            totalServiceYears: calculateDateDiff(formData.hireDateServiceStart, formData.retirementDateServiceEnd).years,
            netPayable: parseFloat(formData.basicSalary) + parseFloat(formData.pensionAdjustment) // ምሳሌያዊ ቀመር
        };

        // 2. ዋናውን ዳታ state ያዘምኑ (አዲስ ከሆነ ይጨምሩ፣ ካለ ያሻሽሉ)
        if (formData.id) {
            setEmployeeData(prev =>
                prev.map(emp => (emp.id === calculated.id ? calculated : emp))
            );
        } else {
            setEmployeeData(prev => [...prev, calculated]);
        }
        closeEditModal();
    };

    const deleteEmployee = (id) => {
        if (window.confirm("እርግጠኛ ነዎት ይህን ሰራተኛ ለመሰረዝ?")) {
            setEmployeeData(prev => prev.filter(emp => emp.id !== id));
            closeEditModal();
        }
    }

    // --- EXPORT FUNCTION ---
    const exportToExcel = () => {
        const dataToExport = filteredData.map((emp, index) => ({
            "ቁጥር": index + 1,
            "የባለ መብቱ ስም አስከ አያት": emp.fullName,
            "ስራ መለያ ቁጥር": emp.staffId,
            "የትውልድ ዘመን": emp.birthDate,
            "ዓመት": emp.year,
            "የሚከፈል ክፍያ": emp.netPayable,
            // "ጾታ": emp.gender, ... ሌሎች 40+ አምዶች ...
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "የጡረታ_ማጠቃለያ_ሪፖርት");
        XLSX.writeFile(workbook, `የጡረታ_ሪፖርት_${selectedYear}.xlsx`);
    };

    // --- STYLING CONSTANTS ---
    const tableHeaderClass = "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
    const tableCellClass = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
    const cardClass = "bg-white p-8 rounded-3xl border border-gray-100 shadow-lg";

    // --- MAIN RENDER ---
    return (
        <div className="max-w-[90rem] mx-auto p-8 bg-gray-50 min-h-screen rounded-[3rem] font-sans">
            <header className="mb-12 flex items-center justify-between gap-10 border-b border-gray-200 pb-8">
                <div className="flex items-center gap-8">
                    <img src="/path/to/your/logo.png" alt="POESSA Logo" className="h-20 w-auto" />
                    <div>
                        <h1 className="text-5xl font-extrabold text-blue-700 tracking-tight">የተዋሃደ የጡረታ አበል አስተዳደር ስርዓት</h1>
                        <p className="mt-3 text-2xl text-gray-700">ከ40+ አምዶች መረጃ ጋር በንጹህ በይነገጽ ይስሩ</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={exportToExcel} className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full text-lg font-semibold hover:bg-green-700 transition shadow-md">
                        <DocumentArrowDownIcon className="h-7 w-7" />
                        ሪፖርት በኤክሴል አውርድ
                    </button>
                     <button onClick={() => openEditModal({})} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md">
                        <PlusIcon className="h-7 w-7" />
                        አዲስ ሰራተኛ ጨምር
                    </button>
                </div>
            </header>

            {/* ክፍል 1፡ ፈጣን ፍለጋ እና ማጠቃለያ ሰንጠረዥ */}
            <section className={cardClass}>
                <div className="mb-10 flex items-center justify-between gap-8 bg-gray-100 p-6 rounded-2xl">
                     <div className="relative flex-grow max-w-3xl">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                        <input type="search" placeholder="በሰራተኛ ስም ወይም መታወቂያ ቁጥር ይፈልጉ..." value={searchTerm} onChange={handleSearch} className="block w-full rounded-full border border-gray-300 pl-16 pr-8 py-5 text-lg shadow-inner focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-6">
                        <label className="text-xl font-semibold text-gray-800">ዓመት ይምረጡ፡</label>
                        <select value={selectedYear} onChange={handleYearFilter} className="rounded-full border border-gray-400 pl-6 pr-12 py-5 text-lg bg-white">
                            <option value="ሁሉም">ሁሉም ዓመታት</option>
                            <option value="2018">2018</option>
                            <option value="2017">2017</option>
                            {/* ሌሎች ዓመታት */}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-2xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-200">
                            <tr>
                                <th scope="col" className={tableHeaderClass}>ቁጥር #</th>
                                <th scope="col" className={tableHeaderClass}>የሰራተኛ ስም</th>
                                <th scope="col" className={tableHeaderClass}>መታወቂያ</th>
                                <th scope="col" className={tableHeaderClass}>የትውልድ ዘመን</th>
                                <th scope="col" className={tableHeaderClass}>ዓመት</th>
                                <th scope="col" className={tableHeaderClass}>የተጣራ ክፍያ</th>
                                <th scope="col" className={tableHeaderClass}>እርምጃ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((emp, index) => (
                                <tr key={emp.id} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className={tableCellClass}>{index + 1}</td>
                                    <td className={`${tableCellClass} font-medium`}>{emp.fullName}</td>
                                    <td className={tableCellClass}>{emp.staffId}</td>
                                    <td className={tableCellClass}>{emp.birthDate}</td>
                                    <td className={tableCellClass}>{emp.year}</td>
                                    <td className={`${tableCellClass} font-semibold text-blue-900`}>{emp.netPayable.toFixed(2)}</td>
                                    <td className={tableCellClass}>
                                        <button onClick={() => openEditModal(emp)} className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-base font-medium hover:bg-blue-200 transition">
                                            <PencilSquareIcon className="h-5 w-5" />
                                            ሙሉ መረጃ ይመልከቱ/አርትዕ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ክፍል 2፡ የዝርዝር መረጃ ብቅ-ባይ ቅጽ (Modal) */}
            <Transition appear show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
                    <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-6 text-center">
                            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-[85rem] transform overflow-hidden rounded-[2.5rem] bg-white p-12 text-left align-middle shadow-2xl transition-all">
                                    <div className="flex items-center justify-between mb-10 border-b border-gray-300 pb-8">
                                        <Dialog.Title as="h3" className="text-4xl font-bold leading-6 text-blue-700">
                                            {selectedEmployee?.id ? 'የሰራተኛ ሙሉ መረጃ አርትዖት' : 'አዲስ ሰራተኛ መመዝገቢያ'}
                                        </Dialog.Title>
                                        <div className="flex items-center gap-5">
                                            {selectedEmployee?.id && (
                                                <button onClick={() => deleteEmployee(selectedEmployee.id)} className="flex items-center gap-2.5 px-6 py-3 bg-red-100 text-red-700 rounded-full text-lg font-medium hover:bg-red-200 transition">
                                                    <TrashIcon className="h-6 w-6" />
                                                    መዝገቡን ሰርዝ
                                                </button>
                                            )}
                                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800 transition p-1">
                                                <XMarkIcon className="h-10 w-10" />
                                            </button>
                                        </div>
                                    </div>

                                    <EmployeeDetailForm employee={selectedEmployee} onSave={saveEmployeeData} onDelete={deleteEmployee} />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

// --- Detail Form Component ---
const EmployeeDetailForm = ({ employee, onSave, onDelete }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: employee || {}
    });

    const inputClass = "block w-full rounded-lg border border-gray-400 p-4 text-lg shadow-sm focus:border-blue-600 focus:ring-blue-600";
    const labelClass = "block text-lg font-semibold text-gray-800 mb-2";

 
       const fieldGroups = [
    {
        title: "የግል መረጃ",
        fields: [
            { name: "fullName", label: "ሙሉ ስም (ስከ አያት)", type: "text" },
            { name: "staffId", label: "ስራ መለያ ቁጥር", type: "text" },
            { 
                name: "gender", 
                label: "ጾታ", 
                type: "select", 
                options: ["ወንድ", "ሴት"] 
            },
            { name: "birthDate", label: "የትውልድ ዘመን (DD/MM/YYYY)", type: "text" },
            { name: "nationalId", label: "ብሔራዊ መታወቂያ ቁጥር", type: "text" },
            { name: "passportNo", label: "ፓስፖርት ቁጥር", type: "text" },
            { name: "nationality", label: "ዜግነት", type: "text" },
            { name: "tinNo", label: "ግብር ከፋይ ቁጥር (TIN)", type: "text" },
            { name: "bankAcc", label: "የባንክ ሂሳብ ቁጥር", type: "text" },
            { name: "pensionNo", label: "የጡረታ መለያ ቁጥር", type: "text" },
            { 
                name: "maritalStatus", 
                label: "የጋብቻ ሁኔታ", 
                type: "select", 
                options: ["ነጠላ", "ያገባ", "የፈታ", "ባል የሞተባት/ት"] 
            },
            { name: "address", label: "አድራሻ", type: "text" },
            { name: "phone", label: "ስልክ ቁጥር", type: "text" },
            { name: "email", label: "ኢሜይል", type: "email" },
        ]
    },
        {
            title: "የአገልግሎት እና የጡረታ መረጃ",
            fields: [
                 // ሌሎች 40+ አምዶችን እዚህ ይጨምሩ...
                { name: "year", label: "ዓመት (እንደ 2018)", type: "text" },
                { name: "hireDateServiceStart", label: "የአገልግሎት መነሻ ቀን (DD/MM/YYYY)", type: "text" },
                { name: "retirementDateServiceEnd", label: "የአገልግሎት ማብቂያ/ጡረታ ቀን (DD/MM/YYYY)", type: "text" },
                { name: "serviceDurationText", label: "ጠቅላላ የአገልግሎት ዘመን ጽሑፍ", type: "text", readOnly: true },

                // የደመወዝ መረጃ
                { name: "basicSalary", label: "መሰረታዊ ደመወዝ", type: "number" },
                { name: "pensionAdjustment", label: "የጡረታ ማስተካከያ (ካሳ)", type: "number" },
                { name: "pensionBaseSalary", label: "የጡረታ መሰረት ደመወዝ", type: "number" },
                { name: "allowance1", label: "አበል 1", type: "number" },
                { name: "allowance2", label: "አበል 2", type: "number" },
                { name: "totalSalaryForPension", label: "ለጡረታ አበል የተያዘ ጠቅላላ ደመወዝ", type: "number" },
                { name: "averagePensionSalary", label: "አማካይ የጡረታ ደመወዝ", type: "number" },

                // የፐርሰንት መረጃ
                { name: "govPercentage", label: "የመንግስት አገልግሎት (%)", type: "number" },
                { name: "privatePercentage", label: "የግል ድርጅት አገልግሎት (%)", type: "number" },

                 // የጡረታ አበል መጠን
                { name: "govPensionAllowance", label: "የመንግስት ጡረታ አበል መጠን", type: "number" },
                { name: "privatePensionAllowance", label: "የግል ጡረታ አበል መጠን", type: "number" },
                { name: "totalPensionAllowance", label: "ጠቅላላ የጡረታ አበል መጠን", type: "number" },

                // የልዩ ልዩ አበል
                { name: "specialAllowance", label: "ልዩ ልዩ አበል", type: "number" },
                { name: "dependentAllowance", label: "ጥገኝነት አበል", type: "number" },
                { name: "totalAllowanceWithOthers", label: "ጠቅላላ ከሌሎች አበል ጋር", type: "number" },

                // የክፍያ ዝርዝር
                { name: "pensionAdvancePayment", label: "ቅድመ ክፍያ", type: "number" },
                { name: "pensionRetroactivePayment", label: "ሬትሮአክቲቭ ክፍያ", type: "number" },
                { name: "pensionOverpaymentDeduction", label: "ከመጠን በላይ ክፍያ ቅናሽ", type: "number" },
                { name: "pensionLoanDeduction", label: "የብድር ቅናሽ", type: "number" },
                { name: "pensionOtherDeduction", label: "ሌሎች ቅናሾች", type: "number" },
                { name: "totalDeduction", label: "ጠቅላላ ቅናሾች", type: "number" },

                // የሂሳብ ማጠቃለያ
                { name: "pensionTaxableAmount", label: "ታክስ የሚከፈልበት የጡረታ መጠን", type: "number" },
                { name: "pensionTaxAmount", label: "የጡረታ ታክስ መጠን", type: "number" },
                { name: "netPayable", label: "የሚጣራ ክፍያ", type: "number", readOnly: true },
                { name: "paymentStatus", label: "የክፍያ ሁኔታ", type: "select", options: ["የተከፈለ", "ያልተከፈለ", "በሂደት ላይ"] },

                 // ማስታወሻ
                { name: "notes", label: "ማስታወሻ", type: "textarea", fullWidth: true },
            ]
        },
    ];

    return (
        <form onSubmit={handleSubmit(onSave)} className="space-y-12">
            {fieldGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={`${group.title === "የአገልግሎት እና የጡረታ መረጃ" ? "bg-blue-50 p-8 rounded-2xl border border-blue-100" : ""}`}>
                    <h4 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-300">{group.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                        {group.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className={`form-group ${field.fullWidth ? 'col-span-full' : ''}`}>
                                <label htmlFor={field.name} className={labelClass}>{field.label}</label>
                                {field.type === 'select' ? (
                                    <Controller
                                        name={field.name}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <select {...controllerField} id={field.name} className={inputClass} disabled={field.readOnly}>
                                                <option value="">ይምረጡ</option>
                                                {field.options.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                ) : field.type === 'textarea' ? (
                                    <Controller
                                        name={field.name}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <textarea {...controllerField} id={field.name} className={`${inputClass} h-32`} disabled={field.readOnly} />
                                        )}
                                    />
                                ) : (
                                     <Controller
                                        name={field.name}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <input
                                                {...controllerField}
                                                type={field.type}
                                                id={field.name}
                                                className={inputClass}
                                                placeholder={field.placeholder}
                                                readOnly={field.readOnly}
                                            />
                                        )}
                                    />
                                )}
                                {errors[field.name] && <p className="text-red-600 text-sm mt-2">ይህ መስክ ያስፈልጋል</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end gap-6 pt-10 border-t border-gray-300 mt-16">
                <button type="button" onClick={() => onDelete(employee.id)} className="px-10 py-5 bg-red-600 text-white rounded-full text-xl font-semibold hover:bg-red-700 transition">
                    መዝገቡን ሰርዝ
                </button>
                <button type="submit" className="px-10 py-5 bg-blue-600 text-white rounded-full text-xl font-semibold hover:bg-blue-700 transition">
                    ለውጡን ያስቀምጡ
                </button>
            </div>
        </form>
    );
};

export default PensionManagementSystem;
