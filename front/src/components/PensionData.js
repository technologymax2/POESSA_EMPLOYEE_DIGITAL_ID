import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

// --- Helpers ---
// የሁለት ቀኖችን ልዩነት (አመት) ያሰላል (በግሪጎሪያን ብቻ)
const calculateYearDiff = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = moment(startStr, 'DD/MM/YYYY');
    const end = moment(endStr, 'DD/MM/YYYY');
    if (!start.isValid() || !end.isValid()) return 0;
    return Math.round(end.diff(start, 'years', true)); // ትክክለኛ አመት ልዩነት
};

// --- Main Pension Data Component ---
const PensionData = () => {
    // --- State ---
    // ይህንን ዳታ ከAPI ወይም ከፋይል ታመጣዋለህ። ለሙከራ ያህል ምሳሌያዊ ዳታ ከኤክሴል ተወስዷል።
    const [employeeData, setEmployeeData] = useState([
        {
            id: 1, fullName: "ወ/ሮ ሳምራዊት ታደሰ ወ/ጊዮርጊስ", staffId: "3107", birthDate: "1/1/1952", gender: "ሴት", year: "2018",
            pensionAdjustment: 744, basicSalary: 1052.85, serviceStart: "1/7/2010", serviceEnd: "1/1/2018",
            netPayable: 27073.64, paymentStatus: "የተከፈለ",
        },
        {
            id: 2, fullName: "አቶ ተፈራ ተክለ ሀይማኖት", staffId: "3100", birthDate: "7/1/1945", gender: "ወንድ", year: "2018",
            pensionAdjustment: 910.21, basicSalary: 2088.13, serviceStart: "1/1/2017", serviceEnd: "1/1/2018",
            netPayable: 31392.39, paymentStatus: "የተከፈለ",
        },
        // ሌሎች ሰራተኞች እዚህ ይጨመራሉ
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
                emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || emp.staffId.includes(searchTerm)
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

    // መረጃ ሲቀመጥ የሚሠራ ተግባር (በስርዓቱ የሚሰሉትን እሴቶች እዚህ ያሰሉ)
    const saveEmployeeData = (formData) => {
        const serviceYears = calculateYearDiff(formData.serviceStart, formData.serviceEnd);
        
        // --- ጠቃሚ አመክንዮ (Business Logic) እዚህ ይተገበራል ---
        // ይህ ለምሳሌ ያህል የቀረበ ቀመር ነው፡ በትክክለኛው ህግ መተካት አለበት።
        const calculatedTotalPensionAllowance = parseFloat(formData.basicSalary) + parseFloat(formData.pensionAdjustment);
        const calculatedNetPayable = calculatedTotalPensionAllowance * (1 + (serviceYears / 100)); // ምሳሌያዊ ቀመር

        const calculated = {
            ...formData,
            id: formData.id || Date.now(),
            calculatedServiceYears: serviceYears,
            totalPensionAllowance: calculatedTotalPensionAllowance.toFixed(2),
            netPayable: calculatedNetPayable.toFixed(2), // በስርዓቱ የተሰላ
        };

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
        if (window.confirm("እርግጠኛ ነዎት ይህን ሰራተኛ መዝገብ ለመሰረዝ?")) {
            setEmployeeData(prev => prev.filter(emp => emp.id !== id));
            closeEditModal();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- STYLING CONSTANTS ---
    const tableHeaderClass = "px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50";
    const tableCellClass = "px-5 py-4 whitespace-nowrap text-sm text-gray-800 border-b border-gray-100";
    const cardClass = "bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-lg mb-12";

    // --- MAIN RENDER ---
    return (
        <div className="max-w-[95rem] mx-auto p-6 md:p-10 bg-gray-50 min-h-screen font-sans rounded-[2rem]">
            <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-200 pb-8 print:hidden">
                <div>
                    <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">የጡረታ አበል ማሻሻያ መረጃ</h1>
                    <p className="mt-2 text-lg text-gray-600">የጡረታ አበል ተጠቃሚዎችን መረጃ ያስተዳድሩ እና ያትሙ</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <button onClick={handlePrint} className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-700 text-white rounded-xl text-base font-semibold hover:bg-gray-800 transition shadow-md">
                        <PrinterIcon className="h-6 w-6" />
                        ሪፖርት አትም (Print)
                    </button>
                     <button onClick={() => openEditModal({})} className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-700 text-white rounded-xl text-base font-semibold hover:bg-blue-800 transition shadow-md">
                        <PlusIcon className="h-6 w-6" />
                        አዲስ ተጠቃሚ ጨምር
                    </button>
                </div>
            </header>

            <section className={cardClass}>
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gray-100 p-5 rounded-xl border border-gray-200 print:hidden">
                     <div className="relative flex-grow max-w-xl">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                        <input type="search" placeholder="በሰራተኛ ስም ወይም መታወቂያ ቁጥር ይፈልጉ..." value={searchTerm} onChange={handleSearch} className="block w-full rounded-xl border border-gray-300 pl-14 pr-6 py-4 text-base shadow-inner focus:border-blue-500 focus:ring-blue-500 bg-white" />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-base font-semibold text-gray-700">ዓመት:</label>
                        <select value={selectedYear} onChange={handleYearFilter} className="rounded-xl border border-gray-400 pl-4 pr-10 py-4 text-base bg-white font-medium">
                            <option value="ሁሉም">ሁሉም</option>
                            <option value="2018">2018</option>
                            <option value="2017">2017</option>
                            <option value="2016">2016</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-xl shadow-inner bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th scope="col" className={tableHeaderClass}>ቁጥር #</th>
                                <th scope="col" className={tableHeaderClass}>የባለ መብቱ ስም</th>
                                <th scope="col" className={tableHeaderClass}>መታወቂያ</th>
                                <th scope="col" className={tableHeaderClass}>የትውልድ ዘመን</th>
                                <th scope="col" className={tableHeaderClass}>የጡረታ ማስተካከያ (ካሳ)</th>
                                <th scope="col" className={tableHeaderClass}>መሰረታዊ ደመወዝ</th>
                                <th scope="col" className={tableHeaderClass}>የሚጣራ ክፍያ (በስርዓቱ)</th>
                                <th scope="col" className={tableHeaderClass}>እርምጃ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredData.map((emp, index) => (
                                <tr key={emp.id} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className={tableCellClass}>{index + 1}</td>
                                    <td className={`${tableCellClass} font-bold text-gray-900`}>{emp.fullName}</td>
                                    <td className={tableCellClass}>{emp.staffId}</td>
                                    <td className={tableCellClass}>{emp.birthDate}</td>
                                    <td className={tableCellClass}>{emp.pensionAdjustment}</td>
                                    <td className={tableCellClass}>{emp.basicSalary}</td>
                                    <td className={`${tableCellClass} font-semibold text-blue-900`}>{emp.netPayable.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ብር</td>
                                    <td className={`${tableCellClass} print:hidden`}>
                                        <button onClick={() => openEditModal(emp)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
                                            <PencilSquareIcon className="h-5 w-5" />
                                            አርትዕ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredData.length === 0 && (
                         <div className="p-12 text-center text-xl text-gray-500">ምንም መረጃ አልተገኘም።</div>
                    )}
                </div>
            </section>

            {/* ብቅ-ባይ ቅጽ (Modal) - HR የሚያስገባቸውን 6 መረጃዎች ብቻ ይይዛል */}
            <Transition appear show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeEditModal}>
                    <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black bg-opacity-40" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-6 text-center">
                            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-[2.5rem] bg-white p-12 text-left align-middle shadow-2xl transition-all">
                                    <div className="flex items-center justify-between mb-10 border-b border-gray-300 pb-8">
                                        <Dialog.Title as="h3" className="text-4xl font-bold leading-6 text-blue-700">
                                            {selectedEmployee?.id ? 'የሰራተኛ ጡረታ አርትዖት' : 'አዲስ ሰራተኛ ጡረታ መመዝገቢያ'}
                                        </Dialog.Title>
                                         <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800 transition p-1">
                                            <XMarkIcon className="h-10 w-10" />
                                        </button>
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
// --- Detail Form Component (HR የሚያስገባቸው አስፈላጊ መስኮች) ---
const EmployeeDetailForm = ({ employee, onSave, onDelete }) => {
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: employee || { year: "2018" } // ነባሪ አመት 2018
    });

    const inputClass = "block w-full rounded-lg border border-gray-400 p-5 text-lg shadow-sm focus:border-blue-600 focus:ring-blue-600";
    const labelClass = "block text-lg font-semibold text-gray-800 mb-2";

    // HR በየጊዜው የሚያስገባቸው መረጃዎች ብቻ (ከኤክሴል የተወሰደ)
    const essentialFields = [
        { name: "fullName", label: "ሙሉ ስም (ከአያት ጋር)", type: "text", required: true },
        { name: "staffId", label: "የሰራተኛ መታወቂያ (ID)", type: "text", required: true },
        { name: "year", label: "ዓመት (እንደ 2018)", type: "text", required: true },
        { name: "birthDate", label: "የትውልድ ዘመን (DD/MM/YYYY)", type: "text", required: true },
        { name: "serviceStart", label: "የአገልግሎት መነሻ ቀን (DD/MM/YYYY)", type: "text", required: true },
        // ከኤክሴል እንደተረዳሁት serviceEnd (ጡረታ የወጣበት ቀን) አብዛኛውን ጊዜ የአሁኑ ዓመት የመጨረሻ ቀን ነው
        // ነገር ግን አስፈላጊ ከሆነ እዚህ ሊጨመር ይችላል።
    ];

    // HR የሚያስገባቸው የገንዘብ መጠን መረጃዎች
    const financeFields = [
        { name: "basicSalary", label: "የመጀመሪያ/መሰረታዊ ደመወዝ", type: "number", required: true },
        { name: "pensionAdjustment", label: "የጡረታ ማስተካከያ (ካሳ)", type: "number", required: true },
        // ሌሎች እንደ አበል፣ ቅናሽ፣ እና ታክስ ያሉ አምዶች እዚህ አይገቡም ምክንያቱም በሲስተሙ ይሰላሉ።
    ];

    return (
        <form onSubmit={handleSubmit(onSave)} className="space-y-10">
            {/* የግል እና የስራ መረጃ ክፍል */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {essentialFields.map((field) => (
                    <div key={field.name} className="form-group">
                        <label htmlFor={field.name} className={labelClass}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <Controller
                            name={field.name}
                            control={control}
                            rules={{ required: field.required }}
                            render={({ field: controllerField }) => (
                                <input
                                    {...controllerField}
                                    type={field.type}
                                    id={field.name}
                                    className={inputClass}
                                    placeholder={`${field.label} ያስገቡ`}
                                />
                            )}
                        />
                        {errors[field.name] && <p className="text-red-600 text-sm mt-2">ይህ መስክ ያስፈልጋል</p>}
                    </div>
                ))}
            </div>

            {/* የደመወዝ መረጃ ክፍል */}
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <h4 className="text-xl font-bold text-gray-900 mb-8">የደመወዝ መረጃ (በየወሩ የሚገባ)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {financeFields.map((field) => (
                         <div key={field.name} className="form-group">
                            <label htmlFor={field.name} className={labelClass}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <Controller
                                name={field.name}
                                control={control}
                                rules={{ required: field.required }}
                                render={({ field: controllerField }) => (
                                    <input
                                        {...controllerField}
                                        type={field.type}
                                        id={field.name}
                                        className={inputClass}
                                        placeholder={`${field.label} ያስገቡ`}
                                    />
                                )}
                            />
                             {errors[field.name] && <p className="text-red-600 text-sm mt-2">ይህ መስክ ያስፈልጋል</p>}
                        </div>
                    ))}
                </div>
            </div>

            {/* የማስቀመጫ እና መሰረዣ አዝራሮች */}
            <div className="flex justify-end gap-6 pt-10 border-t border-gray-300 mt-16">
                {employee?.id && (
                    <button type="button" onClick={() => onDelete(employee.id)} className="px-8 py-4 bg-red-100 text-red-700 rounded-xl text-lg font-semibold hover:bg-red-200 transition flex items-center gap-2">
                        <TrashIcon className="h-5 w-5" />
                        መዝገቡን ሰርዝ
                    </button>
                )}
                <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                    <PencilSquareIcon className="h-5 w-5" />
                    {employee?.id ? 'ለውጡን ያስቀምጡ' : 'አዲስ ሰራተኛ ይመዝግቡ'}
                </button>
            </div>
        </form>
    );
};

export default PensionData;
