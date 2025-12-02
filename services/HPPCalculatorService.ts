import { StockItem } from './api';

export interface IngredientInput {
    id: string;
    stockItem: StockItem;
    qtyNeeded: number; // in the unit of the stock item (e.g., grams, pcs)
    yieldPercent: number; // 0-100
    customPrice?: number; // Optional override for simulation
}

export interface OverheadCost {
    id: string;
    name: string;
    amount: number;
    isSelected: boolean;
}

export interface ProfitProtectionInput {
    laborCostPercent: number; // % of Selling Price
    fixedCostBuffer: number; // Nominal per portion
    enableRiskFactor: boolean; // 5% of Prime Cost
    targetProfitMargin: number; // %
}

export interface CalculationResult {
    primeCost: number; // Ingredients only
    overheadCost: number; // Direct overheads
    riskCost: number; // 5% waste risk
    fixedCost: number; // Buffer
    laborCost: number; // Derived from price
    totalHPP: number; // Total Real Cost
    suggestedSellingPrice: number;
    grossProfit: number;
    foodCostPercentage: number; // Prime Cost / Price
    netProfitPercentage: number;
}

export const DEFAULT_OVERHEADS: OverheadCost[] = [
    { id: 'oh-1', name: 'Gas & Listrik', amount: 1500, isSelected: false },
    { id: 'oh-2', name: 'Packaging', amount: 2000, isSelected: false },
    { id: 'oh-3', name: 'Garnish', amount: 500, isSelected: false },
    { id: 'oh-4', name: 'Minyak/Bumbu', amount: 1000, isSelected: false },
];

export const HPPCalculatorService = {
    /**
     * Calculates the cost of a single ingredient row accounting for yield.
     * Formula: (Price * Qty) / (Yield / 100)
     */
    calculateRowCost: (ingredient: IngredientInput): number => {
        const price = ingredient.customPrice ?? ingredient.stockItem.pricePerUnit;
        const yieldFactor = ingredient.yieldPercent / 100;

        if (yieldFactor <= 0) return 0; // Prevent division by zero

        const rawCost = price * ingredient.qtyNeeded;
        const realCost = rawCost / yieldFactor;

        return realCost;
    },

    /**
     * Calculates the Prime Cost (Ingredients only).
     */
    calculatePrimeCost: (ingredients: IngredientInput[]): number => {
        return ingredients.reduce((sum, item) => {
            return sum + HPPCalculatorService.calculateRowCost(item);
        }, 0);
    },

    /**
     * Calculates the full Profit Protection metrics.
     * Formula: Price = (Prime + Overhead + Fixed + Risk) / (1 - Labor% - Profit%)
     */
    calculateProfitProtectionMetrics: (
        ingredients: IngredientInput[],
        overheads: OverheadCost[],
        params: ProfitProtectionInput,
        manualPrice?: number
    ): CalculationResult => {
        // 1. Calculate Base Costs
        const primeCost = HPPCalculatorService.calculatePrimeCost(ingredients);

        const overheadCost = overheads
            .filter(oh => oh.isSelected)
            .reduce((sum, oh) => sum + oh.amount, 0);

        const fixedCost = params.fixedCostBuffer;

        const riskCost = params.enableRiskFactor ? primeCost * 0.05 : 0;

        const totalFixedComponent = primeCost + overheadCost + fixedCost + riskCost;

        // 2. Calculate Price
        let sellingPrice = 0;
        let laborCost = 0;

        if (manualPrice && manualPrice > 0) {
            sellingPrice = manualPrice;
            laborCost = sellingPrice * (params.laborCostPercent / 100);
        } else {
            // Suggest Price
            // Price = TotalFixed / (1 - Labor% - Profit%)
            const divisor = 1 - (params.laborCostPercent / 100) - (params.targetProfitMargin / 100);

            if (divisor > 0) {
                sellingPrice = Math.ceil(totalFixedComponent / divisor);
                // Round up to nearest 100 or 500 for cleaner pricing? Let's keep it exact for now or ceil.
                sellingPrice = Math.ceil(sellingPrice / 100) * 100;
            } else {
                sellingPrice = 0; // Impossible parameters (e.g. Labor 50% + Profit 60% = 110%)
            }

            laborCost = sellingPrice * (params.laborCostPercent / 100);
        }

        // 3. Calculate Total Real Cost (HPP)
        const totalHPP = totalFixedComponent + laborCost;

        // 4. Metrics
        const grossProfit = sellingPrice - totalHPP;
        const foodCostPercentage = sellingPrice > 0 ? (primeCost / sellingPrice) * 100 : 0;
        const netProfitPercentage = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;

        return {
            primeCost,
            overheadCost,
            riskCost,
            fixedCost,
            laborCost,
            totalHPP,
            suggestedSellingPrice: sellingPrice,
            grossProfit,
            foodCostPercentage,
            netProfitPercentage
        };
    }
};
