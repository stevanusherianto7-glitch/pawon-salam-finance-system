import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import { colors } from '../../theme/colors';
import { performanceApi } from '../../services/api';
import { EmployeeOfTheMonth } from '../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Logo } from '../../components/Logo';

interface Props {
    onBack: () => void;
}

export const CertificateScreen: React.FC<Props> = ({ onBack }) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<EmployeeOfTheMonth | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [scale, setScale] = useState(1);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await performanceApi.getEmployeeOfTheMonth(currentMonth, currentYear);
            if (res.success && res.data) {
                setData(res.data);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const certificateWidth = 840; // A4 Landscape-like width
                const padding = 32;
                const newScale = Math.min((containerWidth - padding) / certificateWidth, 1);
                setScale(newScale);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [loading]);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: null }); // Increased scale for better quality
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Sertifikat_${data?.name.replace(/\s+/g, '_')}_${data?.periodMonth}_${data?.periodYear}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Gagal mengunduh sertifikat.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-400 flex-col gap-3">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <p className="text-xs">Generating Certificate...</p>
        </div>;
    }

    if (!data) {
        return <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-400">Data tidak tersedia.</div>;
    }

    const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long' });

    return (
        <div className="bg-gray-200 min-h-screen flex flex-col overflow-hidden">
            <div className="px-3 py-3 flex items-center justify-between bg-white shadow-md z-50 shrink-0">
                <button onClick={onBack} className="p-1.5 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h2 className="text-gray-800 font-bold text-xs">Sertifikat Digital</h2>
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                    {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    {downloading ? 'Menyimpan...' : 'Unduh PDF'}
                </button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                <div style={{ width: '840px', height: '594px', transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.3s ease-out' }}>
                    {/* --- "CLASSIC CORPORATE PRESTIGE" DESIGN --- */}
                    <div ref={certificateRef} className="w-full h-full relative shadow-2xl overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 font-serif">
                        {/* Ornamental Border */}
                        <div className="absolute inset-0 border-8 border-transparent pointer-events-none" style={{
                            borderImage: 'radial-gradient(ellipse at center, #C2560F 50%, #8B4513 100%) 10',
                            borderImageSlice: 10
                        }}></div>
                        <div className="absolute inset-3 border border-amber-800/20 pointer-events-none"></div>
                        <div className="absolute inset-8 border-2 border-amber-800/30 pointer-events-none"></div>

                        {/* Corner Ornaments */}
                        <div className="absolute top-10 left-10 w-16 h-16 border-l-2 border-t-2 border-amber-800/40"></div>
                        <div className="absolute top-10 right-10 w-16 h-16 border-r-2 border-t-2 border-amber-800/40"></div>
                        <div className="absolute bottom-10 left-10 w-16 h-16 border-l-2 border-b-2 border-amber-800/40"></div>
                        <div className="absolute bottom-10 right-10 w-16 h-16 border-r-2 border-b-2 border-amber-800/40"></div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-start h-full text-center px-12 py-6">
                            <div className="flex items-center gap-4 border-b-2 border-amber-900/10 w-full justify-center pb-4">
                                <Logo variant="dark" size="md" showText={false} />
                                <div>
                                    <h1 className="font-heading text-2xl font-extrabold text-amber-900 tracking-[0.3em]">PAWON SALAM</h1>
                                    <p className="text-xs text-amber-800/80 tracking-[0.2em] font-medium">RESTO & CATERING</p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <p className="text-xl text-stone-700 tracking-wider mt-4">Sertifikat Penghargaan</p>
                                <p className="text-sm text-stone-500 tracking-widest uppercase mt-1">Certificate of Appreciation</p>

                                <div className="w-48 h-px bg-stone-300 my-4"></div>

                                <p className="text-base text-stone-600">Dengan bangga diberikan kepada:</p>
                                <h2 className="font-heading text-4xl font-bold text-amber-900 mt-2 tracking-wide drop-shadow-sm">{data.name}</h2>

                                <p className="text-base text-stone-600 mt-4">Atas kinerja, dedikasi, dan kontribusi yang luar biasa sebagai</p>
                                <h3 className="font-script text-5xl text-orange-700 my-2 tracking-wider" style={{ fontFamily: '"Great Vibes", cursive' }}>Employee of the Month</h3>
                                <p className="text-sm font-bold text-stone-700 uppercase tracking-widest">Periode {monthName} {currentYear}</p>
                            </div>

                            <div className="w-full flex justify-between items-end mt-auto pt-6">
                                <div className="text-center w-1/2">
                                    <p className="font-script text-3xl text-stone-800" style={{ fontFamily: '"Great Vibes", cursive' }}>Veronica Dhian R.</p>
                                    <div className="w-56 h-px bg-stone-400 mx-auto mt-1 mb-2"></div>
                                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">Dr. Veronica Dhian Rusnasari SpPD, M.MRS</p>
                                    <p className="text-[9px] text-stone-500 uppercase tracking-wider">Business Owner</p>
                                </div>

                                <div className="text-center w-1/2">
                                    <p className="font-script text-3xl text-stone-800" style={{ fontFamily: '"Great Vibes", cursive' }}>Ana Jumnanik</p>
                                    <div className="w-56 h-px bg-stone-400 mx-auto mt-1 mb-2"></div>
                                    <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">Ana Jumnanik</p>
                                    <p className="text-[9px] text-stone-500 uppercase tracking-wider">HR Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
