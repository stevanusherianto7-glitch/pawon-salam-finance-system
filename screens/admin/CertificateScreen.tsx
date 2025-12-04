import React, { useRef, useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Employee } from '../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GlassMonthPicker } from '../../components/GlassMonthPicker';

interface Props {
    onBack: () => void;
    employee: Employee;
}

export const CertificateScreen: React.FC<Props> = ({ onBack, employee }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [scale, setScale] = useState(1);

    // Editable State
    const [recipientName, setRecipientName] = useState(''); // EMPTY as requested
    const [department, setDepartment] = useState(''); // NEW FIELD
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
    const formattedDate = `${selectedDay} ${monthName} ${selectedYear}`;

    React.useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const certificateWidth = 1024; // Match template width
                const padding = 32;
                const newScale = Math.min((containerWidth - padding) / certificateWidth, 1);
                setScale(newScale);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);

        try {
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: null,
                logging: false,
                foreignObjectRendering: false
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
                compress: true
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Sertifikat_${recipientName.replace(/\s+/g, '_') || 'Employee'}_${monthName}_${selectedYear}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Gagal mengunduh sertifikat.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-gray-200 min-h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-3 py-3 flex items-center justify-between bg-white shadow-md z-50 shrink-0">
                <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h2 className="text-gray-800 font-bold text-xs">Sertifikat: Employee of the Month</h2>
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                    {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    {downloading ? 'Menyimpan...' : 'Unduh PDF'}
                </button>
            </div>

            {/* Input Fields Section */}
            <div className="bg-white p-4 shadow-md">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nama Penerima</label>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Masukkan nama..."
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    {/* Department Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Departemen</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Contoh: Kitchen, FOH..."
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Tanggal</label>
                        <GlassMonthPicker
                            value={`${monthName} ${selectedYear}`}
                            onChange={(val) => {
                                const parts = val.split(' ');
                                if (parts.length === 2) {
                                    const mName = parts[0];
                                    const y = parseInt(parts[1]);
                                    const months = [
                                        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                                    ];
                                    const mIndex = months.indexOf(mName) + 1;
                                    if (mIndex > 0 && !isNaN(y)) {
                                        setSelectedMonth(mIndex);
                                        setSelectedYear(y);
                                    }
                                }
                            }}
                            variant="light"
                        />
                    </div>
                </div>
            </div>

            {/* Certificate Preview */}
            <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                <div style={{
                    width: '1024px',
                    height: '720px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease-out'
                }}>
                    {/* Certificate Container with Background Image */}
                    <div
                        ref={certificateRef}
                        className="w-full h-full relative shadow-2xl overflow-hidden"
                        style={{
                            backgroundImage: 'url(/certificate-template.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        {/* Editable Name Field - Positioned over template */}
                        <div className="absolute" style={{
                            top: '315px',
                            left: '80px',
                            width: '580px',
                            textAlign: 'left'
                        }}>
                            <div
                                className="font-serif text-5xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-600 tracking-wide px-2 py-1"
                                style={{
                                    fontFamily: '"Great Vibes", "Brush Script MT", cursive',
                                    WebkitTextStroke: '0.5px rgba(180, 83, 9, 0.3)',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {recipientName || '―――――――――'}
                            </div>
                        </div>

                        {/* Department Field - Positioned below description */}
                        {department && (
                            <div className="absolute" style={{
                                top: '430px',
                                left: '80px',
                                width: '580px',
                                textAlign: 'left'
                            }}>
                                <div className="text-lg font-medium text-gray-800">
                                    <span className="text-gray-600">Departemen:</span> {department}
                                </div>
                            </div>
                        )}

                        {/* Date Badge - Top Right */}
                        <div className="absolute" style={{
                            top: '30px',
                            right: '30px'
                        }}>
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border-2 border-amber-500">
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Tanggal</p>
                                <p className="text-sm font-bold text-amber-700">{formattedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
