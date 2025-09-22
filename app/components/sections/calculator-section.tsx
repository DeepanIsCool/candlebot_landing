"use client";

import {
  calculateCompoundFD,
  calculateFDLadder,
  calculateFDWithTDS,
  compareFDInvestments,
} from "@/app/components/lib/calculators/fixed-deposit";
import {
  calculateCapitalGainsTax,
  compareTaxRegimes,
} from "@/app/components/lib/calculators/income-tax-calculator";
import {
  calculateReturnsWithExpenses,
  compareFunds,
} from "@/app/components/lib/calculators/mutual-fund-calculator";
import {
  calculateRequiredSIP,
  calculateSIPFutureValue,
  calculateStepUpSIP,
} from "@/app/components/lib/calculators/sip-calculator";
import {
  calculatePerpetualWithdrawal,
  calculateSWP,
  calculateSustainableWithdrawal,
} from "@/app/components/lib/calculators/swp-calculator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Banknote,
  BarChart3,
  Calculator,
  Info,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import { cn } from "@/app/components/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Tabs, TabsContent } from "@/app/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// Main component export
export { CalculatorSection };

type ChartConfig = {
  type: "line" | "bar" | "pie" | "area" | "radial";
  data: any[];
  lines?: { key: string; color: string }[];
  bars?: { key: string; color: string }[];
  areas?: { key: string; color: string; gradient?: string }[];
  pieConfig?: { nameKey: string; valueKey: string; colors: string[] };
  radialConfig?: { nameKey: string; valueKey: string; colors: string[] };
  xAxisKey: string;
} | null;

const calculatorTabs = [
  { id: "sip", name: "SIP", icon: TrendingUp },
  { id: "fd", name: "FD", icon: PiggyBank },
  { id: "tax", name: "Tax", icon: Receipt },
  { id: "swp", name: "SWP", icon: Banknote },
  { id: "mf", name: "Mutual Fund", icon: Target },
];

function CalculatorSection() {
  const [activeTab, setActiveTab] = useState("sip");
  const [results, setResults] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartConfig>(null);

  // State for different calculator modes
  const [sipMode, setSipMode] = useState("futureValue");
  const [fdMode, setFdMode] = useState("simple");
  const [taxMode, setTaxMode] = useState("regimeComparison");
  const [swpMode, setSwpMode] = useState("standard");
  const [mfMode, setMfMode] = useState("lumpSum");

  const defaultSipData = {
    monthlyInvestment: "10000",
    annualRate: "15",
    years: "10",
    principal: 0,
    targetAmount: "3500000",
    stepUpPercentage: "10",
    enableStepUp: false,
  };

  const defaultFdData = {
    principal: "",
    annualRate: "",
    tenure: "",
    compoundingFrequency: 4,
    taxRate: "",
    totalAmount: "",
    numberOfFDs: "",
    ladders: [
      { tenure: 1, rate: 6.8 },
      { tenure: 2, rate: 7.0 },
      { tenure: 3, rate: 7.2 },
      { tenure: 4, rate: 7.5 },
      { tenure: 5, rate: 7.5 },
    ],
  };

  const defaultTaxData = {
    annualIncome: "",
    age: "",
    deductions: {
      section80C: "",
      section80D: "",
      section80E: "",
      section24B: "",
      section80G: "",
    },
    salePrice: "",
    purchasePrice: "",
    holdingPeriod: "",
    assetType: "equity",
    indexedPurchasePrice: "",
  };

  const defaultSwpData = {
    initialAmount: "",
    monthlyWithdrawal: "",
    annualRate: "",
    years: "",
  };

  const defaultMfData = {
    investment: "",
    annualRate: "",
    years: "",
    expenseRatio: "",
    funds: [
      {
        id: 1,
        name: "",
        investment: "",
        returns: "",
        expenseRatio: "",
        years: "",
      },
      {
        id: 2,
        name: "",
        investment: "",
        returns: "",
        expenseRatio: "",
        years: "",
      },
    ],
  };

  const [sipData, setSipData] = useState(defaultSipData);
  const [fdData, setFdData] = useState(defaultFdData);
  const [taxData, setTaxData] = useState(defaultTaxData);
  const [swpData, setSwpData] = useState(defaultSwpData);
  const [mfData, setMfData] = useState(defaultMfData);

  // Reset states on tab change
  useEffect(() => {
    setResults(null);
    setChartData(null);
  }, [activeTab]);

  // Helper function to convert string to number, defaulting to 0 if empty
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleCalculate = () => {
    try {
      let result: any;
      let newChartData: ChartConfig = null;

      // Validate inputs before calculation
      if (activeTab === "sip") {
        if (sipMode === "futureValue") {
          if (
            !sipData.monthlyInvestment ||
            !sipData.annualRate ||
            !sipData.years
          ) {
            throw new Error(
              "Please fill in all required fields: Monthly Investment, Annual Rate, and Years"
            );
          }
        } else {
          if (!sipData.targetAmount || !sipData.annualRate || !sipData.years) {
            throw new Error(
              "Please fill in all required fields: Target Amount, Annual Rate, and Years"
            );
          }
        }
      }

      switch (activeTab) {
        case "sip":
          if (sipMode === "futureValue") {
            result = sipData.enableStepUp
              ? calculateStepUpSIP(
                  toNumber(sipData.monthlyInvestment),
                  toNumber(sipData.stepUpPercentage),
                  sipData.principal,
                  toNumber(sipData.annualRate),
                  toNumber(sipData.years)
                )
              : calculateSIPFutureValue(
                  sipData.principal,
                  toNumber(sipData.monthlyInvestment),
                  toNumber(sipData.annualRate),
                  toNumber(sipData.years)
                );

            // Chart data generation for SIP - using area chart for better visualization
            const data = [];
            for (let i = 0; i <= toNumber(sipData.years); i++) {
              const yearResult = sipData.enableStepUp
                ? calculateStepUpSIP(
                    toNumber(sipData.monthlyInvestment),
                    toNumber(sipData.stepUpPercentage),
                    sipData.principal,
                    toNumber(sipData.annualRate),
                    i
                  )
                : calculateSIPFutureValue(
                    sipData.principal,
                    toNumber(sipData.monthlyInvestment),
                    toNumber(sipData.annualRate),
                    i
                  );
              data.push({
                Year: i,
                "Total Invested": yearResult.totalInvested,
                "Future Value": yearResult.futureValue,
                "Wealth Gain":
                  yearResult.futureValue - yearResult.totalInvested,
              });
            }

            // Pie chart for final year breakdown
            const finalYear = data[data.length - 1];
            const pieData = [
              {
                name: "Total Invested",
                value: finalYear["Total Invested"],
                color: "#3b82f6",
              },
              {
                name: "Wealth Gain",
                value: finalYear["Wealth Gain"],
                color: "#10b981",
              },
            ];

            newChartData = {
              type: "pie",
              data: pieData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#3b82f6", "#10b981"],
              },
              xAxisKey: "name",
            };
          } else {
            const requiredSIP = calculateRequiredSIP(
              toNumber(sipData.targetAmount),
              sipData.principal,
              toNumber(sipData.annualRate),
              toNumber(sipData.years)
            );
            result = { requiredSIP };

            // Pie chart showing target breakdown
            const totalInvestment = requiredSIP * 12 * toNumber(sipData.years);
            const wealthGain = toNumber(sipData.targetAmount) - totalInvestment;

            const targetData = [
              {
                name: "Total Investment",
                value: totalInvestment,
                color: "#3b82f6",
              },
              { name: "Wealth Gain", value: wealthGain, color: "#10b981" },
            ];

            newChartData = {
              type: "pie",
              data: targetData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#3b82f6", "#10b981"],
              },
              xAxisKey: "name",
            };
          }
          break;
        case "fd":
          if (fdMode === "simple") {
            result = calculateFDWithTDS(
              toNumber(fdData.principal),
              toNumber(fdData.annualRate),
              toNumber(fdData.tenure),
              toNumber(fdData.taxRate),
              true,
              fdData.compoundingFrequency
            );

            // Bar chart for simple FD breakdown
            const fdBreakdown = [
              {
                name: "Principal",
                value: toNumber(fdData.principal),
                color: "#3b82f6",
              },
              { name: "Interest", value: result.netInterest, color: "#10b981" },
              { name: "TDS", value: result.totalTDS, color: "#ef4444" },
            ];

            newChartData = {
              type: "bar",
              data: fdBreakdown,
              bars: [{ key: "value", color: "#3b82f6" }],
              xAxisKey: "name",
            };
          } else if (fdMode === "comparison") {
            const comparison = compareFDInvestments(
              toNumber(fdData.principal),
              toNumber(fdData.tenure)
            );
            result = { comparison };

            // Bar chart for FD comparison
            newChartData = {
              type: "bar",
              data: result.comparison.map((item: any) => ({
                name: item.name,
                "Maturity Amount": item.maturityAmount,
                Interest: item.maturityAmount - toNumber(fdData.principal),
              })),
              bars: [
                { key: "Maturity Amount", color: "#3b82f6" },
                { key: "Interest", color: "#10b981" },
              ],
              xAxisKey: "name",
            };
          } else {
            result = calculateFDLadder(
              toNumber(fdData.totalAmount),
              toNumber(fdData.numberOfFDs),
              fdData.ladders
                .slice(0, toNumber(fdData.numberOfFDs))
                .map((fd) => fd.rate),
              fdData.ladders
                .slice(0, toNumber(fdData.numberOfFDs))
                .map((fd) => fd.tenure)
            );

            // Radial chart for FD ladder visualization
            const radialData = result.fdDetails.map((fd: any, i: number) => ({
              name: `FD ${i + 1}`,
              value: fd.maturityAmount,
              percentage:
                (fd.maturityAmount / result.totalMaturityAmount) * 100,
              fill: `hsl(${200 + i * 40}, 70%, 50%)`,
            }));

            newChartData = {
              type: "radial",
              data: radialData,
              radialConfig: {
                nameKey: "name",
                valueKey: "percentage",
                colors: radialData.map((d) => d.fill),
              },
              xAxisKey: "name",
            };
          }
          break;
        case "tax":
          if (taxMode === "regimeComparison") {
            result = compareTaxRegimes(
              toNumber(taxData.annualIncome),
              {
                section80C: toNumber(taxData.deductions.section80C),
                section80D: toNumber(taxData.deductions.section80D),
                section80E: toNumber(taxData.deductions.section80E),
                section24B: toNumber(taxData.deductions.section24B),
                section80G: toNumber(taxData.deductions.section80G),
              },
              toNumber(taxData.age)
            );

            // Enhanced bar chart with glowing effects
            newChartData = {
              type: "bar",
              data: [
                {
                  Regime: "Old Regime",
                  Tax: result.oldRegime.totalTax,
                  color: "#ef4444",
                },
                {
                  Regime: "New Regime",
                  Tax: result.newRegime.totalTax,
                  color: "#22c55e",
                },
              ],
              bars: [{ key: "Tax", color: "#f97316" }],
              xAxisKey: "Regime",
            };
          } else {
            result = calculateCapitalGainsTax(
              toNumber(taxData.salePrice),
              toNumber(taxData.purchasePrice),
              toNumber(taxData.holdingPeriod),
              taxData.assetType,
              toNumber(taxData.indexedPurchasePrice)
            );

            // Pie chart for capital gains breakdown
            const capitalGainsData = [
              { name: "Net Gain", value: result.netGain, color: "#10b981" },
              { name: "Tax Paid", value: result.tax, color: "#ef4444" },
            ];

            newChartData = {
              type: "pie",
              data: capitalGainsData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#10b981", "#ef4444"],
              },
              xAxisKey: "name",
            };
          }
          break;
        case "swp":
          if (swpMode === "standard") {
            result = calculateSWP(
              toNumber(swpData.initialAmount),
              toNumber(swpData.monthlyWithdrawal),
              toNumber(swpData.annualRate),
              toNumber(swpData.years)
            );
            const swpChartData = [];
            for (let i = 0; i <= toNumber(swpData.years); i++) {
              const yearResult = calculateSWP(
                toNumber(swpData.initialAmount),
                toNumber(swpData.monthlyWithdrawal),
                toNumber(swpData.annualRate),
                i
              );
              swpChartData.push({
                Year: i,
                "Total Withdrawn": yearResult.totalWithdrawn,
                "Final Balance": yearResult.finalBalance,
              });
            }

            // Area chart for SWP visualization
            newChartData = {
              type: "area",
              data: swpChartData,
              areas: [
                {
                  key: "Total Withdrawn",
                  color: "#f59e0b",
                  gradient: "url(#withdrawnGradient)",
                },
                {
                  key: "Final Balance",
                  color: "#10b981",
                  gradient: "url(#balanceGradient)",
                },
              ],
              xAxisKey: "Year",
            };
          } else if (swpMode === "sustainable") {
            const sustainableAmount = calculateSustainableWithdrawal(
              toNumber(swpData.initialAmount),
              toNumber(swpData.annualRate),
              toNumber(swpData.years)
            );
            result = { sustainableAmount };

            // Radial chart showing sustainable withdrawal percentage
            const sustainableData = [
              {
                name: "Sustainable Withdrawal",
                value:
                  (sustainableAmount / toNumber(swpData.initialAmount)) * 100,
                fill: "#10b981",
              },
              {
                name: "Remaining Capital",
                value:
                  100 -
                  (sustainableAmount / toNumber(swpData.initialAmount)) * 100,
                fill: "#64748b",
              },
            ];

            newChartData = {
              type: "pie",
              data: sustainableData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#10b981", "#64748b"],
              },
              xAxisKey: "name",
            };
          } else {
            result = calculatePerpetualWithdrawal(
              toNumber(swpData.initialAmount),
              toNumber(swpData.annualRate)
            );

            // Bar chart showing different withdrawal rates
            const perpetualData = Object.entries(
              result.standardOptions || {}
            ).map(([rate, values]: [string, any]) => ({
              Rate: `${rate}%`,
              "Monthly Withdrawal": values.monthlyWithdrawal,
              "Annual Withdrawal": values.annualWithdrawal,
            }));

            if (perpetualData.length > 0) {
              newChartData = {
                type: "bar",
                data: perpetualData,
                bars: [
                  { key: "Monthly Withdrawal", color: "#f59e0b" },
                  { key: "Annual Withdrawal", color: "#10b981" },
                ],
                xAxisKey: "Rate",
              };
            }
          }
          break;
        case "mf":
          if (mfMode === "lumpSum") {
            result = calculateReturnsWithExpenses(
              toNumber(mfData.investment),
              toNumber(mfData.annualRate),
              toNumber(mfData.expenseRatio),
              toNumber(mfData.years)
            );

            // Area chart showing growth over time
            const growthData = [];
            for (let i = 0; i <= toNumber(mfData.years); i++) {
              const yearResult = calculateReturnsWithExpenses(
                toNumber(mfData.investment),
                toNumber(mfData.annualRate),
                toNumber(mfData.expenseRatio),
                i
              );
              growthData.push({
                Year: i,
                Investment: toNumber(mfData.investment),
                "Value (Without Expenses)":
                  toNumber(mfData.investment) *
                  Math.pow(1 + toNumber(mfData.annualRate) / 100, i),
                "Net Value (After Expenses)": yearResult.netFutureValue,
              });
            }

            newChartData = {
              type: "area",
              data: growthData,
              areas: [
                {
                  key: "Investment",
                  color: "#64748b",
                  gradient: "url(#investmentGradient)",
                },
                {
                  key: "Value (Without Expenses)",
                  color: "#3b82f6",
                  gradient: "url(#grossValueGradient)",
                },
                {
                  key: "Net Value (After Expenses)",
                  color: "#10b981",
                  gradient: "url(#netValueGradient)",
                },
              ],
              xAxisKey: "Year",
            };
          } else {
            const comparison = compareFunds(
              mfData.funds.map((fund) => ({
                ...fund,
                investment: toNumber(fund.investment),
                returns: toNumber(fund.returns),
                expenseRatio: toNumber(fund.expenseRatio),
                years: toNumber(fund.years),
              }))
            );
            result = { comparison };

            // Pie chart for fund comparison
            const pieData = result.comparison.map(
              (fund: any, index: number) => ({
                name: fund.name || `Fund ${index + 1}`,
                value: fund.totalGains,
                color: `hsl(${120 + index * 60}, 70%, 50%)`,
              })
            );

            newChartData = {
              type: "pie",
              data: pieData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: pieData.map((d) => d.color),
              },
              xAxisKey: "name",
            };
          }
          break;
      }
      setResults(result);
      setChartData(newChartData);
    } catch (error) {
      console.error("Calculation Error:", error);
      setResults({ error: (error as Error).message });
      setChartData(null);
    }
  };

  const handleClear = () => {
    setResults(null);
    setChartData(null);
    setSipData(defaultSipData);
    setFdData(defaultFdData);
    setTaxData(defaultTaxData);
    setSwpData(defaultSwpData);
    setMfData(defaultMfData);
  };

  const handleAddFund = () => {
    setMfData((prev) => ({
      ...prev,
      funds: [
        ...prev.funds,
        {
          id: Date.now(),
          name: "",
          investment: "",
          returns: "",
          expenseRatio: "",
          years: "",
        },
      ],
    }));
  };

  const handleRemoveFund = (id: number) => {
    setMfData((prev) => ({
      ...prev,
      funds: prev.funds.filter((fund) => fund.id !== id),
    }));
  };

  const handleFundChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setMfData((prev) => ({
      ...prev,
      funds: prev.funds.map((fund) =>
        fund.id === id ? { ...fund, [field]: value } : fund
      ),
    }));
  };

  const renderResults = () => {
    if (!results) {
      return (
        <div className="flex-grow flex items-center justify-center text-center text-muted-foreground p-4">
          <div>
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter values and click Calculate to see results.</p>
          </div>
        </div>
      );
    }
    if (results.error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>
            <strong>Error:</strong> {results.error}
          </p>
        </div>
      );
    }

    // Dynamic rendering based on active tab and mode
    switch (activeTab) {
      case "sip":
        return (
          <div className="space-y-3">
            {results.futureValue !== undefined ? (
              <>
                <ResultCard
                  label="Total Invested"
                  value={`₹${results.totalInvested?.toLocaleString()}`}
                />
                <ResultCard
                  label="Wealth Gained"
                  value={`₹${results.wealthGained?.toLocaleString()}`}
                  isPrimary
                />
                <ResultCard
                  label="Future Value"
                  value={`₹${results.futureValue?.toLocaleString()}`}
                  isLarge
                />
              </>
            ) : (
              <ResultCard
                label="Required Monthly SIP"
                value={`₹${results.requiredSIP?.toLocaleString()}`}
                isLarge
              />
            )}
          </div>
        );

      case "fd":
        if (results.maturityAmount !== undefined)
          return (
            <div className="space-y-3">
              <ResultCard
                label="Net Maturity Amount"
                value={`₹${results.netMaturityAmount?.toLocaleString()}`}
                isLarge
              />
              <ResultCard
                label="Total Interest"
                value={`₹${results.netInterest?.toLocaleString()}`}
                isPrimary
              />
              <ResultCard
                label="Total TDS Deducted"
                value={`₹${results.totalTDS?.toLocaleString()}`}
              />
            </div>
          );
        if (results.comparison)
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.comparison.map((item: any) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      ₹{item.maturityAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{item.rank}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          );
        if (results.fdDetails)
          return (
            <div>
              <ResultCard
                label="Total Maturity"
                value={`₹${results.totalMaturityAmount.toLocaleString()}`}
                isLarge
              />
              <p className="text-sm text-center text-muted-foreground mt-2">
                Average Rate: {results.averageRate}%
              </p>
            </div>
          );
        return null;

      case "tax":
        if (results.betterRegime)
          return (
            <div className="space-y-3">
              <ResultCard
                label={`Better Regime: ${results.betterRegime}`}
                value={`Saves ₹${results.taxSavings.toLocaleString()}`}
                isLarge
              />
              <ResultCard
                label="Tax (New Regime)"
                value={`₹${results.newRegime.totalTax.toLocaleString()}`}
              />
              <ResultCard
                label="Tax (Old Regime)"
                value={`₹${results.oldRegime.totalTax.toLocaleString()}`}
                isPrimary
              />
            </div>
          );
        if (results.capitalGain !== undefined)
          return (
            <div className="space-y-3">
              <ResultCard
                label="Capital Gains Tax"
                value={`₹${results.tax.toLocaleString()}`}
                isLarge
              />
              <ResultCard
                label="Net Gain"
                value={`₹${results.netGain.toLocaleString()}`}
                isPrimary
              />
              <ResultCard
                label={`Type: ${results.gainType}`}
                value={`Rate: ${results.taxRate}%`}
              />
            </div>
          );
        return null;

      case "swp":
        if (results.finalBalance !== undefined)
          return (
            <div className="space-y-3">
              <ResultCard
                label="Final Balance"
                value={`₹${results.finalBalance.toLocaleString()}`}
                isLarge
              />
              <ResultCard
                label="Total Withdrawn"
                value={`₹${results.totalWithdrawn.toLocaleString()}`}
              />
              <ResultCard
                label="Corpus Lasts For"
                value={`${results.yearsUntilDepletion} years`}
                isPrimary
              />
            </div>
          );
        if (results.sustainableAmount !== undefined)
          return (
            <ResultCard
              label="Sustainable Monthly Withdrawal"
              value={`₹${results.sustainableAmount.toLocaleString()}`}
              isLarge
            />
          );
        if (results.standardOptions)
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rate</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Annual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(results.standardOptions).map(
                  ([rate, values]: [string, any]) => (
                    <TableRow key={rate}>
                      <TableCell>{rate}</TableCell>
                      <TableCell>
                        ₹{values.monthlyWithdrawal.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{values.annualWithdrawal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          );
        return null;

      case "mf":
        if (results.netFutureValue !== undefined)
          return (
            <div className="space-y-3">
              <ResultCard
                label="Net Value (After Expenses)"
                value={`₹${results.netFutureValue.toLocaleString()}`}
                isLarge
              />
              <ResultCard
                label="Expense Impact"
                value={`₹${results.expenseImpact.toLocaleString()}`}
              />
              <ResultCard
                label="Net Return Rate"
                value={`${results.netReturn}%`}
                isPrimary
              />
            </div>
          );
        if (results.comparison)
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund</TableHead>
                  <TableHead>Net Gain</TableHead>
                  <TableHead>Net Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.comparison.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>₹{item.totalGains.toLocaleString()}</TableCell>
                    <TableCell>{item.netReturn}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          );
        return null;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="compact-section bg-background">
        <div className="max-w-7xl mx-auto compact-container">
          <div className="text-center mb-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 text-balance">
              Financial Calculators
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Empower your financial decisions with our precise and easy-to-use
              calculators.
            </p>
          </div>

          <Card className="glass-strong shadow-minimal-lg border-border/50">
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="glass border-b border-border/30 p-3 rounded-t-lg">
                  <div className="flex flex-wrap justify-center gap-2">
                    {calculatorTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            "relative group px-3 py-2 rounded-md font-medium text-xs sm:text-sm transition-smooth",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-minimal glow-primary scale-[1.02]"
                              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            "border border-transparent hover:border-border/40"
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid lg:grid-cols-7 gap-4">
                    <div className="lg:col-span-4 space-y-3">
                      <Card className="glass rounded-lg p-4 border border-border/50">
                        <CardHeader className="p-0 mb-4">
                          <CardTitle className="flex items-center text-lg">
                            <Calculator className="w-5 h-5 mr-2 text-primary" />
                            Calculator
                          </CardTitle>
                        </CardHeader>

                        {/* SIP CALCULATOR */}
                        <TabsContent value="sip" className="space-y-3 mt-0">
                          <ModeSelector
                            value={sipMode}
                            onValueChange={setSipMode}
                            options={[
                              {
                                value: "futureValue",
                                label: "Calculate Future Value",
                              },
                              { value: "goalPlanning", label: "Plan a Goal" },
                            ]}
                          />

                          {sipMode === "futureValue" ? (
                            <div className="space-y-3">
                              <InputWithLabel
                                label="Monthly Investment (₹)"
                                type="number"
                                placeholder="25000"
                                value={sipData.monthlyInvestment}
                                onChange={(e) =>
                                  setSipData({
                                    ...sipData,
                                    monthlyInvestment: e.target.value,
                                  })
                                }
                              />
                              <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                  id="enableStepUp"
                                  checked={sipData.enableStepUp}
                                  onCheckedChange={(checked) =>
                                    setSipData({
                                      ...sipData,
                                      enableStepUp: !!checked,
                                    })
                                  }
                                />
                                <Label htmlFor="enableStepUp">
                                  Enable Step-Up SIP
                                </Label>
                              </div>
                              {sipData.enableStepUp && (
                                <InputWithLabel
                                  label="Annual Step-Up (%)"
                                  type="number"
                                  placeholder="10"
                                  value={sipData.stepUpPercentage}
                                  onChange={(e) =>
                                    setSipData({
                                      ...sipData,
                                      stepUpPercentage: e.target.value,
                                    })
                                  }
                                  tooltip="The percentage by which your SIP increases annually."
                                />
                              )}
                            </div>
                          ) : (
                            <InputWithLabel
                              label="Target Amount (₹)"
                              type="number"
                              placeholder="10000000"
                              value={sipData.targetAmount}
                              onChange={(e) =>
                                setSipData({
                                  ...sipData,
                                  targetAmount: e.target.value,
                                })
                              }
                            />
                          )}

                          <InputWithLabel
                            label="Time (years)"
                            type="number"
                            placeholder="10"
                            value={sipData.years}
                            onChange={(e) =>
                              setSipData({
                                ...sipData,
                                years: e.target.value,
                              })
                            }
                          />
                          <InputWithLabel
                            label="Expected Rate of Return % (p.a.)"
                            type="number"
                            placeholder="12"
                            value={sipData.annualRate}
                            onChange={(e) =>
                              setSipData({
                                ...sipData,
                                annualRate: e.target.value,
                              })
                            }
                          />
                        </TabsContent>

                        {/* FD CALCULATOR */}
                        <TabsContent value="fd" className="space-y-3 mt-0">
                          <ModeSelector
                            value={fdMode}
                            onValueChange={setFdMode}
                            options={[
                              { value: "simple", label: "FD Calculator" },
                              { value: "comparison", label: "Compare FDs" },
                              { value: "laddering", label: "FD Ladder" },
                            ]}
                          />
                          {fdMode === "simple" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Principal Amount (₹)"
                                placeholder="100000"
                                value={fdData.principal}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    principal: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Tenure (Years)"
                                placeholder="5"
                                value={fdData.tenure}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    tenure: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Annual Rate (%)"
                                placeholder="7.5"
                                value={fdData.annualRate}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    annualRate: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Tax Rate (%)"
                                placeholder="10"
                                value={fdData.taxRate}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    taxRate: e.target.value,
                                  })
                                }
                                tooltip="Your income tax slab rate for TDS calculation."
                              />
                            </div>
                          )}
                          {fdMode === "comparison" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Investment Amount (₹)"
                                placeholder="100000"
                                value={fdData.principal}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    principal: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Tenure (Years)"
                                placeholder="5"
                                value={fdData.tenure}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    tenure: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                          {fdMode === "laddering" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Total Amount (₹)"
                                placeholder="500000"
                                value={fdData.totalAmount}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    totalAmount: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Number of FDs"
                                placeholder="5"
                                value={fdData.numberOfFDs}
                                type="number"
                                min="2"
                                max="5"
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    numberOfFDs: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                        </TabsContent>

                        {/* TAX CALCULATOR */}
                        <TabsContent value="tax" className="space-y-3 mt-0">
                          <ModeSelector
                            value={taxMode}
                            onValueChange={setTaxMode}
                            options={[
                              {
                                value: "regimeComparison",
                                label: "Compare Regimes",
                              },
                              {
                                value: "capitalGains",
                                label: "Capital Gains",
                              },
                            ]}
                          />
                          {taxMode === "regimeComparison" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Annual Income (₹)"
                                placeholder="1200000"
                                value={taxData.annualIncome}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    annualIncome: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Age"
                                placeholder="30"
                                value={taxData.age}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    age: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="80C Deductions"
                                placeholder="150000"
                                value={taxData.deductions.section80C}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    deductions: {
                                      ...taxData.deductions,
                                      section80C: e.target.value,
                                    },
                                  })
                                }
                              />
                              <InputWithLabel
                                label="80D Deductions"
                                placeholder="25000"
                                value={taxData.deductions.section80D}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    deductions: {
                                      ...taxData.deductions,
                                      section80D: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          )}
                          {taxMode === "capitalGains" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <Select
                                value={taxData.assetType}
                                onValueChange={(value) =>
                                  setTaxData({ ...taxData, assetType: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Asset Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equity">Equity</SelectItem>
                                  <SelectItem value="debt">Debt</SelectItem>
                                  <SelectItem value="property">
                                    Property
                                  </SelectItem>
                                  <SelectItem value="gold">Gold</SelectItem>
                                </SelectContent>
                              </Select>
                              <InputWithLabel
                                label="Holding Period (Years)"
                                placeholder="5"
                                value={taxData.holdingPeriod}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    holdingPeriod: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Purchase Price (₹)"
                                placeholder="1500000"
                                value={taxData.purchasePrice}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    purchasePrice: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Sale Price (₹)"
                                placeholder="2500000"
                                value={taxData.salePrice}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    salePrice: e.target.value,
                                  })
                                }
                              />
                            </div>
                          )}
                        </TabsContent>

                        {/* SWP CALCULATOR */}
                        <TabsContent value="swp" className="space-y-3 mt-0">
                          <ModeSelector
                            value={swpMode}
                            onValueChange={setSwpMode}
                            options={[
                              {
                                value: "standard",
                                label: "SWP Calculator",
                              },
                              {
                                value: "sustainable",
                                label: "Sustainable Withdrawal",
                              },
                              {
                                value: "perpetual",
                                label: "Perpetual Withdrawal",
                              },
                            ]}
                          />
                          <div className="grid md:grid-cols-2 gap-3">
                            <InputWithLabel
                              label="Initial Investment (₹)"
                              placeholder="1000000"
                              value={swpData.initialAmount}
                              onChange={(e) =>
                                setSwpData({
                                  ...swpData,
                                  initialAmount: e.target.value,
                                })
                              }
                            />
                            <InputWithLabel
                              label="Expected Annual Return (%)"
                              placeholder="10"
                              value={swpData.annualRate}
                              onChange={(e) =>
                                setSwpData({
                                  ...swpData,
                                  annualRate: e.target.value,
                                })
                              }
                            />
                            {swpMode === "standard" && (
                              <InputWithLabel
                                label="Monthly Withdrawal (₹)"
                                placeholder="8000"
                                value={swpData.monthlyWithdrawal}
                                onChange={(e) =>
                                  setSwpData({
                                    ...swpData,
                                    monthlyWithdrawal: e.target.value,
                                  })
                                }
                              />
                            )}
                            {(swpMode === "standard" ||
                              swpMode === "sustainable") && (
                              <InputWithLabel
                                label="Withdrawal Period (Years)"
                                placeholder="15"
                                value={swpData.years}
                                onChange={(e) =>
                                  setSwpData({
                                    ...swpData,
                                    years: e.target.value,
                                  })
                                }
                              />
                            )}
                          </div>
                        </TabsContent>

                        {/* MUTUAL FUND CALCULATOR */}
                        <TabsContent value="mf" className="space-y-3 mt-0">
                          <ModeSelector
                            value={mfMode}
                            onValueChange={setMfMode}
                            options={[
                              {
                                value: "lumpSum",
                                label: "Lump Sum Calculator",
                              },
                              { value: "comparison", label: "Compare Funds" },
                            ]}
                          />
                          {mfMode === "lumpSum" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Investment Amount (₹)"
                                placeholder="100000"
                                value={mfData.investment}
                                onChange={(e) =>
                                  setMfData({
                                    ...mfData,
                                    investment: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Investment Period (Years)"
                                placeholder="10"
                                value={mfData.years}
                                onChange={(e) =>
                                  setMfData({
                                    ...mfData,
                                    years: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Expected Annual Return (%)"
                                placeholder="15"
                                value={mfData.annualRate}
                                onChange={(e) =>
                                  setMfData({
                                    ...mfData,
                                    annualRate: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Expense Ratio (%)"
                                placeholder="1.5"
                                value={mfData.expenseRatio}
                                onChange={(e) =>
                                  setMfData({
                                    ...mfData,
                                    expenseRatio: e.target.value,
                                  })
                                }
                                tooltip="Annual fee charged by the fund, deducted from returns."
                              />
                            </div>
                          )}
                          {mfMode === "comparison" && (
                            <div className="space-y-3">
                              {mfData.funds.map((fund, index) => (
                                <div
                                  key={fund.id}
                                  className="p-3 border rounded-lg space-y-2 relative bg-background/30"
                                >
                                  <Input
                                    placeholder={`Fund ${index + 1} Name`}
                                    value={fund.name}
                                    onChange={(e) =>
                                      handleFundChange(
                                        fund.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className="font-semibold"
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Return %"
                                      value={fund.returns}
                                      onChange={(e) =>
                                        handleFundChange(
                                          fund.id,
                                          "returns",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Expense Ratio %"
                                      value={fund.expenseRatio}
                                      onChange={(e) =>
                                        handleFundChange(
                                          fund.id,
                                          "expenseRatio",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  {mfData.funds.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6"
                                      onClick={() => handleRemoveFund(fund.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                onClick={handleAddFund}
                                className="w-full"
                              >
                                Add Another Fund
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Card>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleCalculate}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg glow-primary transition-smooth"
                        >
                          Calculate
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="px-6 border-border text-muted-foreground hover:text-foreground hover:bg-accent/50 py-2 rounded-lg transition-smooth bg-transparent"
                        >
                          Clear
                        </Button>
                      </div>

                      {/* Chart Legend Card - Only show when chart data exists */}
                      {chartData &&
                        chartData.data &&
                        chartData.data.length > 0 && (
                          <Card className="glass rounded-lg border border-border/50">
                            <CardHeader className="p-3">
                              <CardTitle className="flex items-center text-sm font-medium">
                                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                                {chartData.type === "pie" && "Breakdown"}
                                {chartData.type === "area" && "Trend Analysis"}
                                {chartData.type === "bar" && "Comparison"}
                                {chartData.type === "radial" && "Distribution"}
                                {chartData.type === "line" && "Growth Trend"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="grid grid-cols-1 gap-3">
                                {/* Dynamic legend based on chart type and calculator */}
                                {/* SIP Calculator Legends */}
                                {chartData.type === "pie" &&
                                  activeTab === "sip" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm mr-3 shadow-lg shadow-blue-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Total Invested
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Wealth Gained
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {/* FD Calculator Legends */}
                                {chartData.type === "bar" &&
                                  activeTab === "fd" &&
                                  fdMode === "simple" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm mr-3 shadow-lg shadow-blue-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Principal
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Interest Earned
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-sm mr-3 shadow-lg shadow-red-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          TDS Deducted
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "bar" &&
                                  activeTab === "fd" &&
                                  fdMode === "comparison" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm mr-3 shadow-lg shadow-blue-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Maturity Amount
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Interest Earned
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "radial" &&
                                  activeTab === "fd" && (
                                    <div className="flex items-center">
                                      <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-sm mr-3 shadow-lg shadow-blue-400/50"></div>
                                      <span className="text-sm text-muted-foreground">
                                        FD Ladder Distribution
                                      </span>
                                    </div>
                                  )}

                                {/* Tax Calculator Legends */}
                                {chartData.type === "bar" &&
                                  activeTab === "tax" &&
                                  taxMode === "regimeComparison" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-sm mr-3 shadow-lg shadow-red-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Old Regime Tax
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-sm mr-3 shadow-lg shadow-green-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          New Regime Tax
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "pie" &&
                                  activeTab === "tax" &&
                                  taxMode === "capitalGains" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Net Gain
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-sm mr-3 shadow-lg shadow-red-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Tax Paid
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {/* SWP Calculator Legends */}
                                {chartData.type === "area" &&
                                  activeTab === "swp" &&
                                  swpMode === "standard" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-sm mr-3 shadow-lg shadow-amber-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Total Withdrawn
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Remaining Balance
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "pie" &&
                                  activeTab === "swp" &&
                                  swpMode === "sustainable" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Sustainable Withdrawal
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-slate-400 to-slate-600 rounded-sm mr-3 shadow-lg shadow-slate-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Remaining Capital
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "bar" &&
                                  activeTab === "swp" &&
                                  swpMode === "perpetual" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-sm mr-3 shadow-lg shadow-amber-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Monthly Withdrawal
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Annual Withdrawal
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {/* Mutual Fund Calculator Legends */}
                                {chartData.type === "area" &&
                                  activeTab === "mf" &&
                                  mfMode === "lumpSum" && (
                                    <>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-slate-400 to-slate-600 rounded-sm mr-3 shadow-lg shadow-slate-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Initial Investment
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-sm mr-3 shadow-lg shadow-blue-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Value (Without Expenses)
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-sm mr-3 shadow-lg shadow-emerald-400/50"></div>
                                        <span className="text-sm text-muted-foreground">
                                          Net Value (After Expenses)
                                        </span>
                                      </div>
                                    </>
                                  )}

                                {chartData.type === "pie" &&
                                  activeTab === "mf" &&
                                  mfMode === "comparison" && (
                                    <div className="flex items-center">
                                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-sm mr-3 shadow-lg shadow-green-400/50"></div>
                                      <span className="text-sm text-muted-foreground">
                                        Fund Performance Comparison
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                      {/* Results Summary Card */}
                      <Card className="glass rounded-lg border border-border/50">
                        <CardHeader className="p-3">
                          <CardTitle className="flex items-center text-sm font-medium">
                            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                            Results Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {renderResults()}
                        </CardContent>
                      </Card>

                      {/* Chart Card - Only show when data is available and meaningful */}
                      {chartData &&
                        chartData.data &&
                        chartData.data.length > 0 && (
                          <Card className="glass rounded-lg border border-border/50 flex-1">
                            <CardHeader className="p-3">
                              <CardTitle className="flex items-center text-sm font-medium">
                                <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                                {activeTab === "sip" && "Investment Breakdown"}
                                {activeTab === "fd" &&
                                  "FD Portfolio Distribution"}
                                {activeTab === "tax" && "Tax Comparison"}
                                {activeTab === "swp" && "Withdrawal Analysis"}
                                {activeTab === "mf" && "Fund Performance"}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="h-[350px] rounded-lg bg-gradient-to-br from-background/60 to-background/30 border border-border/20 p-3 backdrop-blur-sm">
                                <ResultsChart chartConfig={chartData} />
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

// --- HELPER COMPONENTS ---
const ResultsChart = ({ chartConfig }: { chartConfig: ChartConfig }) => {
  if (!chartConfig) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No chart configuration</p>
      </div>
    );
  }

  if (!chartConfig.data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No chart data</p>
      </div>
    );
  }

  if (chartConfig.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Empty chart data</p>
      </div>
    );
  }

  const { type, data, lines, bars, areas, pieConfig, radialConfig, xAxisKey } =
    chartConfig;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-background/95 backdrop-blur-md border border-border/70 rounded-lg shadow-2xl shadow-primary/20">
          <p className="label font-bold text-foreground mb-2">{`${xAxisKey}: ${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="intro text-sm flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shadow-lg"
                style={{
                  backgroundColor: pld.color,
                }}
              />
              {`${pld.name}: ${
                typeof pld.value === "number"
                  ? pld.value.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 0,
                    })
                  : pld.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderGradients = () => (
    <defs>
      {/* Gradients for area charts */}
      <linearGradient id="withdrawnGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
      </linearGradient>
      {/* Mutual Fund gradients */}
      <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#64748b" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="grossValueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="netValueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
      </linearGradient>
      {/* Glowing filter effects */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="drop-shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
      </filter>
    </defs>
  );

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            {renderGradients()}
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.3}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value as number)
              }
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend iconSize={12} />
            {lines?.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: line.color,
                  strokeWidth: 0,
                  filter: "url(#glow)",
                }}
                filter="url(#drop-shadow)"
              />
            ))}
          </LineChart>
        ) : type === "area" ? (
          <AreaChart data={data}>
            {renderGradients()}
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.3}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value as number)
              }
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend iconSize={12} />
            {areas?.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stackId="1"
                stroke={area.color}
                fill={area.gradient || area.color}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : type === "pie" ? (
          <PieChart>
            {renderGradients()}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey={pieConfig?.valueKey}
              style={{ filter: "url(#drop-shadow)" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieConfig?.colors[index] || entry.color}
                />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend iconSize={12} />
          </PieChart>
        ) : type === "radial" ? (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            data={data}
          >
            {renderGradients()}
            <RadialBar
              dataKey={radialConfig?.valueKey}
              cornerRadius={10}
              style={{ filter: "url(#drop-shadow)" }}
            />
            <Legend iconSize={12} wrapperStyle={{ fontSize: "12px" }} />
            <RechartsTooltip content={<CustomTooltip />} />
          </RadialBarChart>
        ) : (
          <BarChart data={data}>
            {renderGradients()}
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.3}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value as number)
              }
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend iconSize={12} />
            {bars?.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const InputWithLabel = ({
  label,
  tooltip,
  ...props
}: {
  label: string;
  tooltip?: string;
} & React.ComponentProps<typeof Input>) => (
  <div className="space-y-1.5">
    <Label className="text-foreground text-xs font-medium">
      {label}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3 h-3 inline-block ml-1 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </Label>
    <Input
      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
      {...props}
    />
  </div>
);

const ResultCard = ({
  label,
  value,
  isPrimary = false,
  isLarge = false,
}: {
  label: string;
  value: string;
  isPrimary?: boolean;
  isLarge?: boolean;
}) => (
  <div className="glass-strong rounded-lg p-3 border border-border/20 text-center">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div
      className={cn(
        "font-bold",
        isLarge ? "text-xl" : "text-lg",
        isPrimary ? "text-primary" : "text-foreground"
      )}
    >
      {value}
    </div>
  </div>
);

const ModeSelector = ({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) => (
  <RadioGroup
    value={value}
    onValueChange={onValueChange}
    className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4"
  >
    {options.map((option) => (
      <Label
        key={option.value}
        htmlFor={option.value}
        className={cn(
          "flex items-center justify-center text-center text-xs font-medium border rounded-md p-2 cursor-pointer transition-colors",
          value === option.value
            ? "bg-primary text-primary-foreground border-primary"
            : "hover:bg-accent/50"
        )}
      >
        <RadioGroupItem
          value={option.value}
          id={option.value}
          className="sr-only"
        />
        {option.label}
      </Label>
    ))}
  </RadioGroup>
);
