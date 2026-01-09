import { Card, CardContent } from "../cards/Card";
import { Icon } from "../base/Icon";

/**
 * Environmental Impact Formulas (Industry Standard):
 * - CO2 Saved: 0.45 kg CO2 per kWh (global average grid emission factor)
 * - Trees Equivalent: 1 tree absorbs ~21 kg CO2 per year
 * 
 * Sources:
 * - EPA: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
 * - IEA: Global average CO2 emissions per kWh
 */

const CO2_PER_KWH = 0.45; // kg CO2 per kWh
const CO2_PER_TREE_PER_YEAR = 21; // kg CO2 absorbed per tree per year

interface EnergyImpactProps {
    totalYieldKwh?: number;
}

export function EnergyImpact({ totalYieldKwh = 0 }: EnergyImpactProps) {
    // Calculate environmental impact
    const co2SavedKg = totalYieldKwh * CO2_PER_KWH;
    const treesEquivalent = co2SavedKg / CO2_PER_TREE_PER_YEAR;

    // Format for display
    const formatCO2 = (kg: number) => {
        if (kg >= 1000) {
            return `${(kg / 1000).toFixed(1)} Tons`;
        }
        return `${kg.toFixed(0)} kg`;
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <Icon name="plant" />
                    </div>
                    <div>
                        <p className="text-xs text-text-sub uppercase font-bold">CO2 Saved</p>
                        <p className="text-lg font-bold">{formatCO2(co2SavedKg)}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <Icon name="plant" />
                        {/* Using plant icon for trees as well */}
                    </div>
                    <div>
                        <p className="text-xs text-text-sub uppercase font-bold">Trees Planted</p>
                        <p className="text-lg font-bold">{Math.round(treesEquivalent).toLocaleString()} Trees</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
