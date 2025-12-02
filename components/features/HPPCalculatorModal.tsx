import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calculator, Save, AlertCircle, ChevronRight, DollarSign, Percent, Zap, Package, Shield, Users, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { StockItem, inventoryApi } from '../../services/api';
import { HPPCalculatorService, IngredientInput, OverheadCost, DEFAULT_OVERHEADS, ProfitProtectionInput } from '../../services/HPPCalculatorService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const HPPCalculatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
    const [overheads, setOverheads] = useState<OverheadCost[]>(DEFAULT_OVERHEADS);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [menuName, setMenuName] = useState('');
    const [customSellingPrice, setCustomSellingPrice] = useState<number>(0);
    const [isFooterExpanded, setIsFooterExpanded] = useState(false);

    const [params, setParams] = useState<ProfitProtectionInput>({
        laborCostPercent: 20,
        fixedCostBuffer: 2000,
        enableRiskFactor: false,
        targetProfitMargin: 30
    });

    // Load stock items
    useEffect(() => {
        if (isOpen) {
            inventoryApi.getStock().then(res => {
                if (res.success && res.data) setStockItems(res.data);
            });
        }
    }, [isOpen]);

    // Calculate Metrics
    const metrics = useMemo(() =>
        HPPCalculatorService.calculateProfitProtectionMetrics(
            ingredients,
            overheads,
            params,
            customSellingPrice
        ),
        [ingredients, overheads, params, customSellingPrice]);

    // Handlers
    const handleAddIngredient = () => {
        if (stockItems.length === 0) return;
        const newItem: IngredientInput = {
            id: `ing-${Date.now()}`,
            stockItem: stockItems[0],
            qtyNeeded: 0,
            yieldPercent: 100,
        };
        setIngredients([...ingredients, newItem]);
    };

    const updateIngredient = (id: string, field: keyof IngredientInput, value: any) => {
        setIngredients(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const updateStockItem = (id: string, stockItemId: string) => {
        const stockItem = stockItems.find(s => s.id === stockItemId);
        if (stockItem) updateIngredient(id, 'stockItem', stockItem);
    };

    const toggleOverhead = (id: string) => {
        setOverheads(prev => prev.map(oh => oh.id === id ? { ...oh, isSelected: !oh.isSelected } : oh));
    };

    const removeIngredient = (id: string) => setIngredients(prev => prev.filter(i => i.id !== id));

    const getProfitMeterColor = (fc: number) => {
        if (fc <= 35) return 'bg-green-500';
        if (fc <= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" onClick={onClose} />

            <div className="fixed top-[12vh] h-[78vh] left-[4%] w-[92%] z-[9999] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col">

                {/* 1. Header Section (Sticky Top) */}
                <div className="bg-gradient-to-r from-[#E87722] to-[#F9A055] p-4 sm:p-6 flex justify-between items-center shadow-lg z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight leading-tight">Profit Protection</h2>
                            <p className="text-[10px] text-white/80 font-medium">Calculator</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* MAIN CONTENT - SCROLLABLE */}
                <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">

                    {/* Menu Name Input */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Nama Menu</label>
                        <input
                            type="text"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            placeholder="Contoh: Nasi Goreng Spesial"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800 focus:border-orange-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* Card A: Prime Cost */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <Package size={16} className="text-orange-500" />
                                Prime Cost (Bahan)
                            </h3>
                            <button onClick={handleAddIngredient} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                                + Tambah
                            </button>
                        </div>
                        <div className="space-y-3">
                            {ingredients.map((item) => (
                                <div key={item.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 group">
                                    <div className="space-y-2">
                                        <select
                                            value={item.stockItem.id}
                                            onChange={(e) => updateStockItem(item.id, e.target.value)}
                                            className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none border-b border-gray-200 pb-1"
                                        >
                                            {stockItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>

                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1 flex-1">
                                                <input
                                                    type="number"
                                                    value={item.qtyNeeded || ''}
                                                    onChange={(e) => updateIngredient(item.id, 'qtyNeeded', parseFloat(e.target.value))}
                                                    className="w-full bg-white border rounded px-2 py-1.5 text-xs font-bold"
                                                    placeholder="Qty"
                                                />
                                                <span className="text-[10px] text-gray-400">{item.stockItem.unit}</span>
                                            </div>

                                            <div className="flex items-center gap-1 flex-1">
                                                <span className="text-[10px] text-gray-400">Yield:</span>
                                                <input
                                                    type="number"
                                                    value={item.yieldPercent}
                                                    onChange={(e) => updateIngredient(item.id, 'yieldPercent', parseFloat(e.target.value))}
                                                    className="w-full bg-white border rounded px-2 py-1.5 text-xs font-bold"
                                                />
                                                <span className="text-[10px] text-gray-400">%</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-1">
                                            <p className="font-bold text-gray-800 text-xs">Rp {HPPCalculatorService.calculateRowCost(item).toLocaleString()}</p>
                                            <button onClick={() => removeIngredient(item.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {ingredients.length === 0 && <div className="text-center py-6 text-gray-400 text-xs italic">Belum ada bahan baku</div>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">Total Prime Cost</span>
                            <span className="text-sm font-black text-gray-800">Rp {metrics.primeCost.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Card B: Overhead Langsung */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
                            <Zap size={16} className="text-blue-500" />
                            Overhead Langsung
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {overheads.map(oh => (
                                <div key={oh.id} onClick={() => toggleOverhead(oh.id)} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${oh.isSelected ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${oh.isSelected ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{oh.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500">+Rp {oh.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card C: Labor & Service */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
                            <Users size={16} className="text-purple-500" />
                            Labor Allocation
                        </h3>
                        <div className="mb-4">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                <span>Alokasi Gaji (% Harga Jual)</span>
                                <span className="text-purple-600">{params.laborCostPercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                step="1"
                                value={params.laborCostPercent}
                                onChange={(e) => setParams({ ...params, laborCostPercent: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-purple-800">Nominal Labor</span>
                            <span className="text-sm font-black text-purple-600">Rp {metrics.laborCost.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Card D: Risk & Buffer */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm">
                            <Shield size={16} className="text-red-500" />
                            Risk & Buffer
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1.5">Fixed Cost Buffer (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">Rp</span>
                                    <input
                                        type="number"
                                        value={params.fixedCostBuffer}
                                        onChange={(e) => setParams({ ...params, fixedCostBuffer: parseFloat(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>
                            <div
                                onClick={() => setParams({ ...params, enableRiskFactor: !params.enableRiskFactor })}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${params.enableRiskFactor ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${params.enableRiskFactor ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                        {params.enableRiskFactor && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <span className={`text-xs font-bold ${params.enableRiskFactor ? 'text-red-700' : 'text-gray-600'}`}>Risk Factor (5% Waste)</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">+Rp {metrics.riskCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STICKY FOOTER - RESULT PANEL */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[10000] flex flex-col transition-all duration-300">

                    {/* Expandable Handle */}
                    <div
                        onClick={() => setIsFooterExpanded(!isFooterExpanded)}
                        className="flex justify-center py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                    >
                        <div className="w-10 h-1 bg-gray-300 rounded-full mb-1" />
                    </div>

                    {/* Expanded Content (Profit Analysis) */}
                    {isFooterExpanded && (
                        <div className="px-6 pb-4 animate-in slide-in-from-bottom-5 duration-200">
                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                    <span>Food Cost %</span>
                                    <span className={`${metrics.foodCostPercentage > 45 ? 'text-red-500' : metrics.foodCostPercentage > 35 ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {metrics.foodCostPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${getProfitMeterColor(metrics.foodCostPercentage)}`}
                                        style={{ width: `${Math.min(metrics.foodCostPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                        Target Profit Margin
                                        <span className="text-green-600">{params.targetProfitMargin}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="60"
                                        step="5"
                                        value={params.targetProfitMargin}
                                        onChange={(e) => setParams({ ...params, targetProfitMargin: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                                    />
                                </div>

                                <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-800">Rekomendasi</span>
                                    <span className="text-lg font-black text-green-600">Rp {metrics.suggestedSellingPrice.toLocaleString()}</span>
                                </div>

                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">Rp</span>
                                    <input
                                        type="number"
                                        value={customSellingPrice || ''}
                                        onChange={(e) => setCustomSellingPrice(parseFloat(e.target.value))}
                                        placeholder="Input Harga Manual"
                                        className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:border-orange-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compact Footer (Always Visible) */}
                    <div className="px-6 py-3 bg-white">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Real Cost</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-bold text-gray-500">Rp</span>
                                    <span className="text-2xl font-black text-gray-800">{metrics.totalHPP.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profit</p>
                                <p className={`text-lg font-black ${metrics.grossProfit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Rp {metrics.grossProfit.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-gradient-to-r from-[#E87722] to-[#F9A055] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                            <Save size={18} />
                            Simpan Menu & HPP
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
