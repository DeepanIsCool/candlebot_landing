"use client";

import {
  calculateCompoundFD,
  calculateFDLadder,
  calculateFDWithTDS,
  calculateOptimalFDTenure,
  calculatePrematureWithdrawal,
  compareFDInvestments,
} from "@/app/components/lib/calculators/fixed-deposit";
import {
  calculateAdvanceTax,
  calculateCapitalGainsTax,
  calculateTDS,
  compareTaxRegimes,
} from "@/app/components/lib/calculators/income-tax-calculator";
import {
  calculateReturnsWithExpenses,
  calculateTaxAdjustedReturns,
  compareFunds,
} from "@/app/components/lib/calculators/mutual-fund-calculator";
import {
  calculateGoalBasedSIP,
  calculateRequiredSIP,
  calculateSIPFutureValue,
  calculateStepUpSIP,
  calculateTaxOptimizedSIP,
  compareSIPvsLumpSum,
} from "@/app/components/lib/calculators/sip-calculator";
import {
  calculatePerpetualWithdrawal,
  calculateSWP,
  calculateStepUpSWP,
  calculateSustainableWithdrawal,
  compareSWPvsFD,
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
import { Slider } from "@/app/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
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
    // Tax configuration
    investmentType: "equity" as "equity" | "debt" | "hybrid",
    taxSlab: "30",
    // Goal-based SIP parameters
    goalAmount: "5000000",
    currentAge: "30",
    goalAge: "50",
    riskProfile: "moderate" as "conservative" | "moderate" | "aggressive",
    existingSavings: "0",
    // SIP vs Lump Sum comparison
    totalInvestmentAmount: "1200000",
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
    // Optimal tenure parameters
    rateSlabs: [
      { minTenure: 1, maxTenure: 2, rate: 6.8 },
      { minTenure: 2, maxTenure: 3, rate: 7.0 },
      { minTenure: 3, maxTenure: 5, rate: 7.2 },
      { minTenure: 5, maxTenure: 10, rate: 7.5 },
    ],
    // Premature withdrawal parameters
    originalTenure: "",
    actualTenure: "",
    penaltyRate: "1",
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
    // TDS Calculator parameters
    monthlySalary: "",
    regime: "new" as "new" | "old",
    // Advance Tax Calculator parameters
    annualTax: "",
    tdsDeducted: "",
  };

  const defaultSwpData = {
    initialAmount: "1000000",
    monthlyWithdrawal: "8000",
    annualRate: "12",
    years: "15",
    // Tax configuration
    investmentType: "equity" as "equity" | "debt" | "hybrid",
    taxSlab: "30",
    expenseRatio: "1.5",
    initialNAV: "10",
    // Step-up SWP parameters
    initialWithdrawal: "8000",
    stepUpPercentage: "5",
    // SWP vs FD comparison
    fdRate: "7",
  };

  const defaultMfData = {
    investment: "",
    annualRate: "",
    years: "",
    expenseRatio: "",
    incomeSlabRate: "30",
    fundType: "equity" as "equity" | "debt" | "other",
    holdingPeriod: "",
    currentValue: "",
    funds: [
      {
        id: 1,
        name: "",
        investment: "",
        returns: "",
        expenseRatio: "",
        years: "",
        fundType: "equity" as "equity" | "debt" | "other",
      },
      {
        id: 2,
        name: "",
        investment: "",
        returns: "",
        expenseRatio: "",
        years: "",
        fundType: "equity" as "equity" | "debt" | "other",
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
      } else if (activeTab === "fd") {
        if (!fdData.principal || !fdData.annualRate || !fdData.tenure) {
          throw new Error(
            "Please fill in all required fields: Principal, Annual Rate, and Tenure"
          );
        }
      } else if (activeTab === "swp") {
        if (swpMode === "standard") {
          if (
            !swpData.initialAmount ||
            !swpData.monthlyWithdrawal ||
            !swpData.annualRate ||
            !swpData.years
          ) {
            throw new Error(
              "Please fill in all required fields: Initial Amount, Monthly Withdrawal, Annual Rate, and Years"
            );
          }
        } else if (swpMode === "stepUp") {
          if (
            !swpData.initialAmount ||
            !swpData.initialWithdrawal ||
            !swpData.annualRate ||
            !swpData.years
          ) {
            throw new Error(
              "Please fill in all required fields: Initial Amount, Initial Withdrawal, Annual Rate, and Years"
            );
          }
        } else if (swpMode === "perpetual") {
          if (!swpData.initialAmount || !swpData.annualRate) {
            throw new Error(
              "Please fill in all required fields: Initial Amount and Annual Rate"
            );
          }
        }
      } else if (activeTab === "tax") {
        if (taxMode === "regimeComparison" && !taxData.annualIncome) {
          throw new Error(
            "Please fill in Annual Income for tax regime comparison"
          );
        } else if (
          taxMode === "capitalGains" &&
          (!taxData.salePrice || !taxData.purchasePrice)
        ) {
          throw new Error(
            "Please fill in Sale Price and Purchase Price for capital gains calculation"
          );
        }
      } else if (activeTab === "mf") {
        if (!mfData.investment || !mfData.annualRate) {
          throw new Error(
            "Please fill in all required fields: Investment and Annual Rate"
          );
        }
      }

      switch (activeTab) {
        case "sip":
          const taxConfig = {
            investmentType: sipData.investmentType,
            taxSlab: toNumber(sipData.taxSlab),
          };

          if (sipMode === "futureValue") {
            result = sipData.enableStepUp
              ? calculateStepUpSIP(
                  toNumber(sipData.monthlyInvestment),
                  toNumber(sipData.stepUpPercentage),
                  sipData.principal,
                  toNumber(sipData.annualRate),
                  toNumber(sipData.years),
                  taxConfig
                )
              : calculateSIPFutureValue(
                  sipData.principal,
                  toNumber(sipData.monthlyInvestment),
                  toNumber(sipData.annualRate),
                  toNumber(sipData.years),
                  taxConfig
                );

            // Chart data generation for SIP
            const data = [];
            for (let i = 0; i <= toNumber(sipData.years); i++) {
              const yearResult = sipData.enableStepUp
                ? calculateStepUpSIP(
                    toNumber(sipData.monthlyInvestment),
                    toNumber(sipData.stepUpPercentage),
                    sipData.principal,
                    toNumber(sipData.annualRate),
                    i,
                    taxConfig
                  )
                : calculateSIPFutureValue(
                    sipData.principal,
                    toNumber(sipData.monthlyInvestment),
                    toNumber(sipData.annualRate),
                    i,
                    taxConfig
                  );
              data.push({
                Year: i,
                "Total Invested": yearResult.totalInvested,
                "Future Value": yearResult.futureValue,
                "Net Future Value":
                  yearResult.netFutureValue || yearResult.futureValue,
                "Tax Amount": yearResult.taxAmount || 0,
              });
            }

            newChartData = {
              type: "area",
              data: data.slice(1), // Exclude year 0
              areas: [
                { key: "Total Invested", color: "#3b82f6" },
                { key: "Net Future Value", color: "#10b981" },
              ],
              xAxisKey: "Year",
            };
          } else if (sipMode === "targetAmount") {
            const requiredSIP = calculateRequiredSIP(
              toNumber(sipData.targetAmount),
              sipData.principal,
              toNumber(sipData.annualRate),
              toNumber(sipData.years)
            );
            result = { requiredSIP };

            // Chart data showing target breakdown
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
          } else if (sipMode === "taxOptimized") {
            result = calculateTaxOptimizedSIP(
              toNumber(sipData.monthlyInvestment),
              toNumber(sipData.annualRate),
              toNumber(sipData.years),
              toNumber(sipData.taxSlab)
            );

            // Chart showing equity vs debt allocation
            const allocationData = [
              {
                name: "Equity",
                value: result.equityAllocation.futureValue,
                color: "#10b981",
              },
              {
                name: "Debt",
                value: result.debtAllocation.futureValue,
                color: "#3b82f6",
              },
            ];

            newChartData = {
              type: "pie",
              data: allocationData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#10b981", "#3b82f6"],
              },
              xAxisKey: "name",
            };
          } else if (sipMode === "goalBased") {
            result = calculateGoalBasedSIP(
              toNumber(sipData.goalAmount),
              toNumber(sipData.currentAge),
              toNumber(sipData.goalAge),
              sipData.riskProfile,
              toNumber(sipData.existingSavings)
            );

            // Chart showing asset allocation
            const allocationData = [
              {
                name: "Equity",
                value: result.assetAllocation.equity,
                color: "#10b981",
              },
              {
                name: "Debt",
                value: result.assetAllocation.debt,
                color: "#3b82f6",
              },
            ];

            newChartData = {
              type: "pie",
              data: allocationData,
              pieConfig: {
                nameKey: "name",
                valueKey: "value",
                colors: ["#10b981", "#3b82f6"],
              },
              xAxisKey: "name",
            };
          } else if (sipMode === "sipVsLumpSum") {
            result = compareSIPvsLumpSum(
              toNumber(sipData.totalInvestmentAmount),
              toNumber(sipData.annualRate),
              toNumber(sipData.years)
            );

            // Chart showing comparison
            const comparisonData = [
              {
                name: "SIP",
                value: result.sipResult.futureValue,
                color: "#10b981",
              },
              {
                name: "Lump Sum",
                value: result.lumpSumResult.futureValue,
                color: "#3b82f6",
              },
            ];

            newChartData = {
              type: "bar",
              data: comparisonData,
              bars: [{ key: "value", color: "#10b981" }],
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
          } else if (fdMode === "laddering") {
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
                colors: radialData.map((d: any) => d.fill),
              },
              xAxisKey: "name",
            };
          } else if (fdMode === "optimalTenure") {
            result = calculateOptimalFDTenure(
              toNumber(fdData.principal),
              fdData.rateSlabs
            );

            // Bar chart showing different tenure options
            const tenureData = result.allOptions.map((option: any) => ({
              name: option.tenureRange,
              "Annualized Return": option.annualizedReturn,
              "Maturity Amount": option.maturityAmount,
            }));

            newChartData = {
              type: "bar",
              data: tenureData,
              bars: [
                { key: "Annualized Return", color: "#10b981" },
                { key: "Maturity Amount", color: "#3b82f6" },
              ],
              xAxisKey: "name",
            };
          } else if (fdMode === "prematureWithdrawal") {
            result = calculatePrematureWithdrawal(
              toNumber(fdData.principal),
              toNumber(fdData.annualRate),
              toNumber(fdData.originalTenure),
              toNumber(fdData.actualTenure),
              toNumber(fdData.penaltyRate)
            );

            // Comparison chart showing normal vs penalized maturity
            const withdrawalData = [
              {
                name: "Maturity",
                "Normal Maturity": result.normalMaturityAmount,
                "Penalized Amount": result.penalizedMaturityAmount,
                "Penalty Loss":
                  result.penaltyAmount + result.estimatedInterestLoss,
              },
            ];

            newChartData = {
              type: "bar",
              data: withdrawalData,
              bars: [
                { key: "Normal Maturity", color: "#10b981" },
                { key: "Penalized Amount", color: "#ef4444" },
                { key: "Penalty Loss", color: "#f59e0b" },
              ],
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

            // Enhanced bar chart with consistent colors
            newChartData = {
              type: "bar",
              data: [
                {
                  Regime: "Old Regime",
                  Tax: result.oldRegime.totalTax,
                },
                {
                  Regime: "New Regime",
                  Tax: result.newRegime.totalTax,
                },
              ],
              bars: [{ key: "Tax", color: "#f97316" }],
              xAxisKey: "Regime",
            };
          } else if (taxMode === "capitalGains") {
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
          } else if (taxMode === "tds") {
            result = calculateTDS(
              toNumber(taxData.annualIncome) / 12, // Monthly salary
              toNumber(taxData.annualIncome),
              {
                section80C: toNumber(taxData.deductions.section80C),
                section80D: toNumber(taxData.deductions.section80D),
                section80E: toNumber(taxData.deductions.section80E),
                section24B: toNumber(taxData.deductions.section24B),
                section80G: toNumber(taxData.deductions.section80G),
              },
              "new" // Tax regime
            );

            // Bar chart showing TDS breakdown
            const tdsData = [
              {
                name: "Breakdown",
                "Annual Tax": result.annualTax,
                "Monthly TDS": result.monthlyTDS * 12,
                "Net Annual Salary": result.netAnnualSalary,
              },
            ];

            newChartData = {
              type: "bar",
              data: tdsData,
              bars: [
                { key: "Annual Tax", color: "#ef4444" },
                { key: "Monthly TDS", color: "#f59e0b" },
                { key: "Net Annual Salary", color: "#10b981" },
              ],
              xAxisKey: "name",
            };
          } else if (taxMode === "advanceTax") {
            // First calculate annual tax liability
            const taxResult = compareTaxRegimes(
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

            const annualTax = Math.min(
              taxResult.newRegime.totalTax,
              taxResult.oldRegime.totalTax
            );
            result = calculateAdvanceTax(
              annualTax,
              toNumber(taxData.tdsDeducted || "0")
            );

            // Line chart showing advance tax payment schedule
            if (result.paymentSchedule) {
              const advanceData = result.paymentSchedule.map(
                (payment: any) => ({
                  date: payment.dueDate,
                  "Cumulative Payment": payment.cumulativeAmount,
                  "Required Payment": payment.requiredAmount,
                })
              );

              newChartData = {
                type: "line",
                data: advanceData,
                lines: [
                  { key: "Cumulative Payment", color: "#10b981" },
                  { key: "Required Payment", color: "#3b82f6" },
                ],
                xAxisKey: "date",
              };
            }
          }
          break;
        case "swp":
          const swpTaxConfig = {
            investmentType: swpData.investmentType,
            taxSlab: toNumber(swpData.taxSlab),
          };

          if (swpMode === "standard") {
            result = calculateSWP(
              toNumber(swpData.initialAmount),
              toNumber(swpData.monthlyWithdrawal),
              toNumber(swpData.annualRate),
              toNumber(swpData.years),
              swpTaxConfig,
              toNumber(swpData.expenseRatio),
              toNumber(swpData.initialNAV)
            );
            const swpChartData = [];
            for (let i = 1; i <= toNumber(swpData.years); i++) {
              const yearResult = calculateSWP(
                toNumber(swpData.initialAmount),
                toNumber(swpData.monthlyWithdrawal),
                toNumber(swpData.annualRate),
                i,
                swpTaxConfig,
                toNumber(swpData.expenseRatio),
                toNumber(swpData.initialNAV)
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
          } else if (swpMode === "stepUp") {
            result = calculateStepUpSWP(
              toNumber(swpData.initialAmount),
              toNumber(swpData.initialWithdrawal),
              toNumber(swpData.stepUpPercentage),
              toNumber(swpData.annualRate),
              toNumber(swpData.years),
              swpTaxConfig,
              toNumber(swpData.expenseRatio)
            );

            // Add chart visualization for step-up progression
            const stepUpData =
              result.yearWiseBreakdown?.map((year: any) => ({
                Year: year.year,
                "Withdrawal Amount": year.withdrawalAmount,
                "End Balance": year.endBalance,
                "Tax Deducted": year.totalTax,
              })) || [];

            newChartData = {
              type: "area",
              data: stepUpData,
              areas: [
                { key: "Withdrawal Amount", color: "#f59e0b" },
                { key: "End Balance", color: "#10b981" },
              ],
              xAxisKey: "Year",
            };
          } else if (swpMode === "swpVsFd") {
            result = compareSWPvsFD(
              toNumber(swpData.initialAmount),
              toNumber(swpData.monthlyWithdrawal),
              toNumber(swpData.annualRate),
              toNumber(swpData.fdRate),
              toNumber(swpData.taxSlab),
              toNumber(swpData.years)
            );

            // Comparison chart
            const comparisonData = [
              {
                Investment: "SWP",
                "Total Income": result.swpResult.totalIncome,
                "Final Corpus": result.swpResult.finalCorpus,
                "Total Tax": result.swpResult.totalTax,
              },
              {
                Investment: "FD",
                "Total Income": result.fdResult.totalIncome,
                "Final Corpus": 0,
                "Total Tax": result.fdResult.totalTax,
              },
            ];

            newChartData = {
              type: "bar",
              data: comparisonData,
              bars: [
                { key: "Total Income", color: "#10b981" },
                { key: "Total Tax", color: "#ef4444" },
              ],
              xAxisKey: "Investment",
            };
          } else if (swpMode === "perpetual") {
            result = calculatePerpetualWithdrawal(
              toNumber(swpData.initialAmount),
              toNumber(swpData.annualRate),
              swpTaxConfig
            );

            // Standard withdrawal rates chart - Fixed property mapping
            const standardRates = Object.entries(
              result.standardOptions || {}
            ).map(([rate, values]: [string, any]) => ({
              Rate: `${rate}`,
              "Monthly Amount": values.netMonthly || 0,
              "Annual Amount": values.netAnnual || 0,
            }));

            newChartData = {
              type: "bar",
              data: standardRates,
              bars: [
                { key: "Monthly Amount", color: "#10b981" },
                { key: "Annual Amount", color: "#3b82f6" },
              ],
              xAxisKey: "Rate",
            };
          } else if (swpMode === "sustainable") {
            const sustainableResult = calculateSustainableWithdrawal(
              toNumber(swpData.initialAmount),
              toNumber(swpData.annualRate),
              swpTaxConfig,
              toNumber(swpData.years),
              toNumber(swpData.expenseRatio)
            );
            const sustainableAmount =
              sustainableResult.grossMonthlyWithdrawal * 12;
            result = { sustainableAmount, ...sustainableResult };

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
            for (let i = 1; i <= toNumber(mfData.years); i++) {
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
          } else if (mfMode === "comparison") {
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
          } else if (mfMode === "taxAdjusted") {
            result = calculateTaxAdjustedReturns(
              toNumber(mfData.investment),
              toNumber(
                mfData.currentValue ||
                  (
                    toNumber(mfData.investment) *
                    Math.pow(
                      1 + toNumber(mfData.annualRate) / 100,
                      toNumber(mfData.years)
                    )
                  ).toString()
              ),
              toNumber(mfData.holdingPeriod),
              mfData.fundType,
              toNumber(mfData.incomeSlabRate)
            );

            // Comparison chart showing pre-tax vs post-tax returns
            const taxComparisonData = [
              {
                name: "Pre-Tax Value",
                value: result.preTaxValue,
                color: "#3b82f6",
              },
              {
                name: "Tax Liability",
                value: result.taxLiability,
                color: "#ef4444",
              },
              {
                name: "Post-Tax Value",
                value: result.postTaxValue,
                color: "#10b981",
              },
            ];

            newChartData = {
              type: "bar",
              data: taxComparisonData,
              bars: [{ key: "value", color: "#3b82f6" }],
              xAxisKey: "name",
            };
          } else if (mfMode === "incomeSlabRate") {
            // For income slab rate mode, we'll use the tax adjusted returns with different income levels
            const incomeSlabs = [
              { income: 300000, name: "Up to ₹3L" },
              { income: 600000, name: "₹3L - ₹6L" },
              { income: 900000, name: "₹6L - ₹9L" },
              { income: 1200000, name: "₹9L - ₹12L" },
              { income: 1500000, name: "Above ₹15L" },
            ];

            const slabResults = incomeSlabs.map((slab) => {
              const taxRate =
                slab.income <= 300000
                  ? 0
                  : slab.income <= 600000
                  ? 5
                  : slab.income <= 900000
                  ? 10
                  : slab.income <= 1200000
                  ? 15
                  : slab.income <= 1500000
                  ? 20
                  : 30;

              const slabResult = calculateTaxAdjustedReturns(
                toNumber(mfData.investment),
                toNumber(
                  mfData.currentValue ||
                    (
                      toNumber(mfData.investment) *
                      Math.pow(
                        1 + toNumber(mfData.annualRate) / 100,
                        toNumber(mfData.years)
                      )
                    ).toString()
                ),
                toNumber(mfData.holdingPeriod),
                mfData.fundType,
                taxRate
              );

              return {
                incomeRange: slab.name,
                effectiveTaxRate: taxRate,
                postTaxReturns: slabResult.postTaxReturns,
                postTaxValue: slabResult.postTaxValue,
              };
            });

            result = { taxSlabBreakdown: slabResults };

            // Chart showing effective tax rates by income slab
            const slabData = slabResults.map((slab: any) => ({
              name: slab.incomeRange,
              "Effective Tax Rate": slab.effectiveTaxRate,
              "Post-Tax Returns": slab.postTaxReturns,
            }));

            newChartData = {
              type: "bar",
              data: slabData,
              bars: [
                { key: "Effective Tax Rate", color: "#ef4444" },
                { key: "Post-Tax Returns", color: "#10b981" },
              ],
              xAxisKey: "name",
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
                colors: pieData.map((d: any) => d.color),
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
          fundType: "equity" as "equity" | "debt" | "other",
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
          <div>
            {results.futureValue !== undefined ? (
              <div className="flex gap-3">
                <ResultCard
                  label="Total Invested"
                  value={`₹${results.totalInvested?.toLocaleString()}`}
                  horizontal={true}
                />
                <ResultCard
                  label="Wealth Gained"
                  value={`₹${results.wealthGained?.toLocaleString()}`}
                  isPrimary
                  horizontal={true}
                />
                <ResultCard
                  label="Future Value"
                  value={`₹${results.futureValue?.toLocaleString()}`}
                  isLarge
                  horizontal={true}
                />
              </div>
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
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Net Maturity Amount"
                value={`₹${results.netMaturityAmount?.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Total Interest"
                value={`₹${results.netInterest?.toLocaleString()}`}
                isPrimary
                horizontal
              />
              <ResultCard
                label="Total TDS Deducted"
                value={`₹${results.totalTDS?.toLocaleString()}`}
                horizontal
              />
            </div>
          );
        if (results.comparison)
          return (
            <div className="space-y-4">
              <h4 className="font-semibold mb-3">Investment Comparison:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investment</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Maturity Amount</TableHead>
                    <TableHead>Interest Earned</TableHead>
                    <TableHead>Liquidity</TableHead>
                    <TableHead>Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.comparison.map((item: any, index: number) => (
                    <TableRow
                      key={item.name}
                      className={index === 0 ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.rate}%</TableCell>
                      <TableCell className="font-semibold">
                        ₹{item.maturityAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{item.totalInterest.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            item.liquidity === "High"
                              ? "bg-green-100 text-green-800"
                              : item.liquidity === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {item.liquidity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            item.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : item.rank <= 3
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          #{item.rank}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        if (results.fdDetails)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ResultCard
                  label="Total Maturity"
                  value={`₹${results.totalMaturityAmount.toLocaleString()}`}
                  isLarge
                />
                <ResultCard
                  label="Average Rate"
                  value={`${results.averageRate}%`}
                  isPrimary
                />
                <ResultCard
                  label="Total Interest"
                  value={`₹${results.totalInterest.toLocaleString()}`}
                />
              </div>
              <div>
                <h4 className="font-semibold mb-3">FD Ladder Details:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FD #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tenure</TableHead>
                      <TableHead>Maturity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.fdDetails.map((fd: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          FD {fd.fdNumber}
                        </TableCell>
                        <TableCell>₹{fd.principal.toLocaleString()}</TableCell>
                        <TableCell>{fd.rate}%</TableCell>
                        <TableCell>{fd.tenure}Y</TableCell>
                        <TableCell>
                          ₹{fd.maturityAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        if (results.bestOption)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Best Tenure"
                value={results.bestOption.tenureRange}
                isLarge
                horizontal
              />
              <ResultCard
                label="Annualized Return"
                value={`${results.bestOption.annualizedReturn}%`}
                isPrimary
                horizontal
              />
              <ResultCard
                label="Maturity Amount"
                value={`₹${results.bestOption.maturityAmount.toLocaleString()}`}
                horizontal
              />
            </div>
          );
        if (results.penalizedMaturityAmount !== undefined)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Normal Maturity"
                value={`₹${results.normalMaturityAmount.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Penalized Amount"
                value={`₹${results.penalizedMaturityAmount.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Total Penalty"
                value={`₹${results.penaltyAmount.toLocaleString()}`}
                isPrimary
                horizontal
              />
              <ResultCard
                label="Interest Loss"
                value={`₹${results.estimatedInterestLoss.toLocaleString()}`}
                horizontal
              />
            </div>
          );
        return null;

      case "tax":
        if (results.betterRegime)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label={`Better Regime: ${results.betterRegime}`}
                value={`Saves ₹${results.taxSavings.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Tax (New Regime)"
                value={`₹${results.newRegime.totalTax.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Tax (Old Regime)"
                value={`₹${results.oldRegime.totalTax.toLocaleString()}`}
                isPrimary
                horizontal
              />
            </div>
          );
        if (results.capitalGain !== undefined)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Capital Gains Tax"
                value={`₹${results.tax.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Net Gain"
                value={`₹${results.netGain.toLocaleString()}`}
                isPrimary
                horizontal
              />
              <ResultCard
                label={`Type: ${results.gainType}`}
                value={`Rate: ${results.taxRate}%`}
                horizontal
              />
            </div>
          );
        if (results.monthlyTDS !== undefined)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Monthly TDS"
                value={`₹${results.monthlyTDS.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Annual Tax"
                value={`₹${results.annualTax.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Net Monthly Salary"
                value={`₹${results.netMonthlySalary.toLocaleString()}`}
                isPrimary
                horizontal
              />
              <ResultCard
                label="TDS Percentage"
                value={`${results.tdsPercentage}%`}
                horizontal
              />
            </div>
          );
        if (results.advanceTaxRequired !== undefined)
          return (
            <div className="space-y-4">
              {results.advanceTaxRequired ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <ResultCard
                      label="Net Tax Liability"
                      value={`₹${results.netTaxLiability?.toLocaleString()}`}
                      isLarge
                    />
                    <ResultCard
                      label="Annual Tax"
                      value={`₹${results.annualTax?.toLocaleString()}`}
                    />
                    <ResultCard
                      label="TDS Deducted"
                      value={`₹${results.tdsDeducted?.toLocaleString()}`}
                    />
                  </div>
                  {results.paymentSchedule && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3">
                        Quarterly Payment Schedule:
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Quarterly Amount</TableHead>
                            <TableHead>Cumulative %</TableHead>
                            <TableHead>Cumulative Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.paymentSchedule.map(
                            (payment: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {payment.period}
                                </TableCell>
                                <TableCell>
                                  ₹{payment.quarterlyAmount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {payment.cumulativePercentage}%
                                </TableCell>
                                <TableCell>
                                  ₹{payment.cumulativeAmount.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              ) : (
                <ResultCard
                  label="Status"
                  value={results.message || "No advance tax required"}
                  isLarge
                />
              )}
            </div>
          );
        return null;

      case "swp":
        // Standard SWP results
        if (results.finalBalance !== undefined)
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 justify-between">
                <ResultCard
                  label="Final Balance"
                  value={`₹${results.finalBalance.toLocaleString()}`}
                  isLarge
                  horizontal
                />
                <ResultCard
                  label="Total Withdrawn"
                  value={`₹${results.totalWithdrawn.toLocaleString()}`}
                  isPrimary
                  horizontal
                />
                <ResultCard
                  label="Corpus Lasts For"
                  value={`${results.yearsUntilDepletion} years`}
                  horizontal
                />
              </div>
              <div className="flex flex-wrap gap-3 justify-between">
                <ResultCard
                  label="Tax Deducted"
                  value={`₹${results.totalTaxDeducted?.toLocaleString() || 0}`}
                  horizontal
                />
                <ResultCard
                  label="Avg Monthly Tax"
                  value={`₹${results.averageMonthlyTax?.toLocaleString() || 0}`}
                  horizontal
                />
                <ResultCard
                  label="Effective Rate"
                  value={`${results.effectiveWithdrawalRate?.toFixed(2) || 0}%`}
                  horizontal
                />
                <ResultCard
                  label="Is Perpetual"
                  value={results.isPerpetual ? "Yes" : "No"}
                  horizontal
                />
              </div>
            </div>
          );

        // Step-Up SWP results
        if (results.finalWithdrawalAmount !== undefined)
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 justify-between">
                <ResultCard
                  label="Final Balance"
                  value={`₹${results.finalBalance.toLocaleString()}`}
                  isLarge
                  horizontal
                />
                <ResultCard
                  label="Total Withdrawn"
                  value={`₹${results.totalWithdrawn.toLocaleString()}`}
                  isPrimary
                  horizontal
                />
                <ResultCard
                  label="Final Withdrawal"
                  value={`₹${results.finalWithdrawalAmount.toLocaleString()}`}
                  horizontal
                />
              </div>
              {results.yearWiseBreakdown && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    Year-wise Breakdown (Sample):
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Withdrawal Amount</TableHead>
                        <TableHead>Tax Deducted</TableHead>
                        <TableHead>End Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.yearWiseBreakdown
                        .slice(0, 5)
                        .map((year: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{year.year}</TableCell>
                            <TableCell>
                              ₹{year.withdrawalAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹{year.totalTax.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              ₹{year.endBalance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );

        // SWP vs FD comparison results
        if (results.swpResult && results.fdResult)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-strong rounded-lg p-4 border border-border/20">
                  <h4 className="font-semibold mb-3 text-primary">
                    SWP Strategy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Income:
                      </span>
                      <span className="font-medium">
                        ₹{results.swpResult.totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Final Corpus:
                      </span>
                      <span className="font-medium">
                        ₹{results.swpResult.finalCorpus.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tax Paid:
                      </span>
                      <span className="font-medium text-red-600">
                        ₹{results.swpResult.totalTax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="glass-strong rounded-lg p-4 border border-border/20">
                  <h4 className="font-semibold mb-3 text-secondary">
                    FD Strategy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Income:
                      </span>
                      <span className="font-medium">
                        ₹{results.fdResult.totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Final Corpus:
                      </span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Tax Paid:
                      </span>
                      <span className="font-medium text-red-600">
                        ₹{results.fdResult.totalTax.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Recommendation:</h4>
                <p className="text-sm text-muted-foreground">
                  {results.recommendation}
                </p>
              </div>
            </div>
          );

        // Sustainable withdrawal results
        if (
          results.sustainableAmount !== undefined &&
          results.grossMonthlyWithdrawal
        )
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <ResultCard
                  label="Sustainable Monthly"
                  value={`₹${results.sustainableAmount.toLocaleString()}`}
                  isLarge
                />
                <ResultCard
                  label="Gross Monthly"
                  value={`₹${results.grossMonthlyWithdrawal.toLocaleString()}`}
                  isPrimary
                />
                <ResultCard
                  label="Sustainability Rate"
                  value={`${results.sustainabilityRate?.toFixed(2) || 0}%`}
                />
              </div>
              {results.recommendations && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {results.recommendations.map(
                      (rec: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          );

        // Perpetual withdrawal results
        if (results.standardOptions)
          return (
            <div className="space-y-4">
              <h4 className="font-semibold mb-3">
                Standard Withdrawal Options:
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Withdrawal Rate</TableHead>
                    <TableHead>Monthly Amount</TableHead>
                    <TableHead>Annual Amount</TableHead>
                    <TableHead>Tax Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(results.standardOptions).map(
                    ([rate, values]: [string, any]) => (
                      <TableRow key={rate}>
                        <TableCell className="font-medium">{rate}%</TableCell>
                        <TableCell>
                          ₹{values.netMonthly?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          ₹{values.netAnnual?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-red-600">
                          ₹{values.taxImpact?.toLocaleString() || 0}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
              {results.recommendations && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {results.recommendations.map(
                      (rec: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          );

        return null;

      case "mf":
        if (results.netFutureValue !== undefined)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Net Value (After Expenses)"
                value={`₹${results.netFutureValue.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label="Expense Impact"
                value={`₹${results.expenseImpact.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Net Return Rate"
                value={`${results.netReturn}%`}
                isPrimary
                horizontal
              />
            </div>
          );
        if (results.comparison)
          return (
            <div className="space-y-4">
              <h4 className="font-semibold mb-3">Fund Comparison Analysis:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fund Name</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Final Value</TableHead>
                    <TableHead>Total Gains</TableHead>
                    <TableHead>Gross Return</TableHead>
                    <TableHead>Expense Ratio</TableHead>
                    <TableHead>Net Return</TableHead>
                    <TableHead>Absolute Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.comparison.map((fund: any, index: number) => (
                    <TableRow
                      key={index}
                      className={index === 0 ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">
                        {fund.name || `Fund ${index + 1}`}
                        {index === 0 && (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Best
                          </span>
                        )}
                      </TableCell>
                      <TableCell>₹{fund.investment.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{fund.futureValue.toLocaleString()}
                      </TableCell>
                      <TableCell>₹{fund.totalGains.toLocaleString()}</TableCell>
                      <TableCell>{fund.grossReturn}%</TableCell>
                      <TableCell className="text-red-600">
                        {fund.expenseRatio}%
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {fund.netReturn}%
                      </TableCell>
                      <TableCell>{fund.absoluteReturn.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  * Funds are ranked by total gains. Consider risk factors along
                  with returns.
                </p>
              </div>
            </div>
          );
        if (results.postTaxValue !== undefined)
          return (
            <div className="flex flex-wrap gap-3 justify-between">
              <ResultCard
                label="Pre-Tax Value"
                value={`₹${results.preTaxValue.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Tax Liability"
                value={`₹${results.taxLiability.toLocaleString()}`}
                horizontal
              />
              <ResultCard
                label="Post-Tax Value"
                value={`₹${results.postTaxValue.toLocaleString()}`}
                isLarge
                horizontal
              />
              <ResultCard
                label={`Tax Rate: ${results.applicableTaxRate}%`}
                value={`Type: ${results.taxType}`}
                isPrimary
                horizontal
              />
            </div>
          );
        if (results.taxSlabBreakdown)
          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Income Range</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Post-Tax Returns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.taxSlabBreakdown.map((slab: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{slab.incomeRange}</TableCell>
                    <TableCell>{slab.effectiveTaxRate}%</TableCell>
                    <TableCell>
                      ₹{slab.postTaxReturns.toLocaleString()}
                    </TableCell>
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
                              { value: "futureValue", label: "Future Value" },
                              { value: "targetAmount", label: "Target Plan" },
                              { value: "taxOptimized", label: "Tax-Optimized" },
                              { value: "goalBased", label: "Goal-Based" },
                              {
                                value: "sipVsLumpSum",
                                label: "SIP vs Lump Sum",
                              },
                            ]}
                          />

                          {/* Common SIP Inputs */}
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

                          {/* Target Amount Mode */}
                          {sipMode === "targetAmount" && (
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

                          {/* Goal-Based SIP Mode */}
                          {sipMode === "goalBased" && (
                            <div className="space-y-3">
                              <InputWithLabel
                                label="Goal Amount (₹)"
                                type="number"
                                placeholder="5000000"
                                value={sipData.goalAmount}
                                onChange={(e) =>
                                  setSipData({
                                    ...sipData,
                                    goalAmount: e.target.value,
                                  })
                                }
                              />
                              <div className="grid md:grid-cols-2 gap-3">
                                <InputWithLabel
                                  label="Current Age"
                                  type="number"
                                  placeholder="30"
                                  value={sipData.currentAge}
                                  onChange={(e) =>
                                    setSipData({
                                      ...sipData,
                                      currentAge: e.target.value,
                                    })
                                  }
                                />
                                <InputWithLabel
                                  label="Goal Age"
                                  type="number"
                                  placeholder="50"
                                  value={sipData.goalAge}
                                  onChange={(e) =>
                                    setSipData({
                                      ...sipData,
                                      goalAge: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Risk Profile</Label>
                                <Select
                                  value={sipData.riskProfile}
                                  onValueChange={(value) =>
                                    setSipData({
                                      ...sipData,
                                      riskProfile: value as
                                        | "conservative"
                                        | "moderate"
                                        | "aggressive",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="conservative">
                                      Conservative (8-10%)
                                    </SelectItem>
                                    <SelectItem value="moderate">
                                      Moderate (10-12%)
                                    </SelectItem>
                                    <SelectItem value="aggressive">
                                      Aggressive (12-15%)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* SIP vs Lump Sum Mode */}
                          {sipMode === "sipVsLumpSum" && (
                            <div className="space-y-3">
                              <InputWithLabel
                                label="Total Investment Amount (₹)"
                                type="number"
                                placeholder="1200000"
                                value={sipData.totalInvestmentAmount}
                                onChange={(e) =>
                                  setSipData({
                                    ...sipData,
                                    totalInvestmentAmount: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Expected Return Rate (%)"
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
                            </div>
                          )}

                          {/* Common SIP Inputs (excluding mode-specific ones) */}
                          <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Investment Tenure (Years)"
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
                                label="Expected Return Rate (%)"
                                type="number"
                                placeholder="15"
                                value={sipData.annualRate}
                                onChange={(e) =>
                                  setSipData({
                                    ...sipData,
                                    annualRate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          {/* Tax Configuration */}
                          {(sipMode === "futureValue" ||
                            sipMode === "taxOptimized") && (
                            <div className="space-y-3 border-t pt-3">
                              <Label className="text-sm font-medium">
                                Tax Configuration
                              </Label>
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Investment Type</Label>
                                  <Select
                                    value={sipData.investmentType}
                                    onValueChange={(value) =>
                                      setSipData({
                                        ...sipData,
                                        investmentType: value as
                                          | "equity"
                                          | "debt"
                                          | "hybrid",
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equity">
                                        Equity
                                      </SelectItem>
                                      <SelectItem value="debt">Debt</SelectItem>
                                      <SelectItem value="hybrid">
                                        Hybrid
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <InputWithLabel
                                  label="Tax Slab (%)"
                                  type="number"
                                  placeholder="30"
                                  value={sipData.taxSlab}
                                  onChange={(e) =>
                                    setSipData({
                                      ...sipData,
                                      taxSlab: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
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
                              {
                                value: "optimalTenure",
                                label: "Optimal Tenure",
                              },
                              {
                                value: "prematureWithdrawal",
                                label: "Premature Withdrawal",
                              },
                            ]}
                          />
                          {fdMode === "simple" && (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Principal Amount (₹)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Amount to be invested in Fixed
                                            Deposit
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[toNumber(fdData.principal)]}
                                      onValueChange={([value]) =>
                                        setFdData({
                                          ...fdData,
                                          principal: value.toString(),
                                        })
                                      }
                                      max={5000000}
                                      min={10000}
                                      step={10000}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="100000"
                                      value={fdData.principal}
                                      onChange={(e) =>
                                        setFdData({
                                          ...fdData,
                                          principal: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Tenure (Years)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Fixed deposit lock-in period</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[toNumber(fdData.tenure)]}
                                      onValueChange={([value]) =>
                                        setFdData({
                                          ...fdData,
                                          tenure: value.toString(),
                                        })
                                      }
                                      max={10}
                                      min={1}
                                      step={0.5}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="5"
                                      value={fdData.tenure}
                                      onChange={(e) =>
                                        setFdData({
                                          ...fdData,
                                          tenure: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Annual Rate (%)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Annual interest rate offered by the
                                            bank
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[toNumber(fdData.annualRate)]}
                                      onValueChange={([value]) =>
                                        setFdData({
                                          ...fdData,
                                          annualRate: value.toString(),
                                        })
                                      }
                                      max={12}
                                      min={4}
                                      step={0.1}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="7.5"
                                      value={fdData.annualRate}
                                      onChange={(e) =>
                                        setFdData({
                                          ...fdData,
                                          annualRate: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Tax Rate (%)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Your income tax slab rate for TDS
                                            calculation
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[toNumber(fdData.taxRate)]}
                                      onValueChange={([value]) =>
                                        setFdData({
                                          ...fdData,
                                          taxRate: value.toString(),
                                        })
                                      }
                                      max={30}
                                      min={0}
                                      step={5}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="10"
                                      value={fdData.taxRate}
                                      onChange={(e) =>
                                        setFdData({
                                          ...fdData,
                                          taxRate: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                              </div>
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

                          {fdMode === "optimalTenure" && (
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
                          )}

                          {fdMode === "prematureWithdrawal" && (
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
                                label="Interest Rate (%)"
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
                                label="Original Tenure (Years)"
                                placeholder="5"
                                value={fdData.originalTenure}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    originalTenure: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Actual Tenure (Years)"
                                placeholder="3"
                                value={fdData.actualTenure}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    actualTenure: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="Penalty Rate (%)"
                                placeholder="1"
                                value={fdData.penaltyRate}
                                onChange={(e) =>
                                  setFdData({
                                    ...fdData,
                                    penaltyRate: e.target.value,
                                  })
                                }
                                tooltip="Penalty percentage deducted from the interest rate"
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
                              { value: "capitalGains", label: "Capital Gains" },
                              {
                                value: "tdsCalculator",
                                label: "TDS Calculator",
                              },
                              { value: "advanceTax", label: "Advance Tax" },
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

                          {taxMode === "tdsCalculator" && (
                            <div className="space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <InputWithLabel
                                  label="Monthly Salary (₹)"
                                  placeholder="100000"
                                  value={taxData.monthlySalary}
                                  onChange={(e) =>
                                    setTaxData({
                                      ...taxData,
                                      monthlySalary: e.target.value,
                                    })
                                  }
                                />
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
                              </div>
                              <div className="space-y-2">
                                <Label>Tax Regime</Label>
                                <Select
                                  value={taxData.regime}
                                  onValueChange={(value) =>
                                    setTaxData({
                                      ...taxData,
                                      regime: value as "new" | "old",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">
                                      New Regime
                                    </SelectItem>
                                    <SelectItem value="old">
                                      Old Regime
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {taxData.regime === "old" && (
                                <div className="grid md:grid-cols-2 gap-3">
                                  <InputWithLabel
                                    label="80C Deductions (₹)"
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
                                    label="80D Deductions (₹)"
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
                            </div>
                          )}

                          {taxMode === "advanceTax" && (
                            <div className="grid md:grid-cols-2 gap-3">
                              <InputWithLabel
                                label="Annual Tax Liability (₹)"
                                placeholder="120000"
                                value={taxData.annualTax}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    annualTax: e.target.value,
                                  })
                                }
                              />
                              <InputWithLabel
                                label="TDS Already Deducted (₹)"
                                placeholder="60000"
                                value={taxData.tdsDeducted}
                                onChange={(e) =>
                                  setTaxData({
                                    ...taxData,
                                    tdsDeducted: e.target.value,
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
                              { value: "standard", label: "SWP Calculator" },
                              {
                                value: "sustainable",
                                label: "Sustainable Withdrawal",
                              },
                              {
                                value: "perpetual",
                                label: "Perpetual Withdrawal",
                              },
                              { value: "stepUp", label: "Step-Up SWP" },
                              {
                                value: "swpVsFd",
                                label: "SWP vs FD Comparison",
                              },
                            ]}
                          />
                          <div className="space-y-3">
                            {/* Common SWP Inputs */}
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                  Initial Investment (₹)
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Total amount to be invested initially
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={[toNumber(swpData.initialAmount)]}
                                    onValueChange={([value]) =>
                                      setSwpData({
                                        ...swpData,
                                        initialAmount: value.toString(),
                                      })
                                    }
                                    max={10000000}
                                    min={100000}
                                    step={50000}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="1000000"
                                    value={swpData.initialAmount}
                                    onChange={(e) =>
                                      setSwpData({
                                        ...swpData,
                                        initialAmount: e.target.value,
                                      })
                                    }
                                    className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                  Expected Annual Return (%)
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Expected annual return from your
                                          investments
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={[toNumber(swpData.annualRate)]}
                                    onValueChange={([value]) =>
                                      setSwpData({
                                        ...swpData,
                                        annualRate: value.toString(),
                                      })
                                    }
                                    max={25}
                                    min={5}
                                    step={0.5}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="10"
                                    value={swpData.annualRate}
                                    onChange={(e) =>
                                      setSwpData({
                                        ...swpData,
                                        annualRate: e.target.value,
                                      })
                                    }
                                    className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Mode-specific inputs */}
                            {(swpMode === "standard" ||
                              swpMode === "swpVsFd") && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                  Monthly Withdrawal (₹)
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Amount you want to withdraw monthly
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={[
                                      toNumber(swpData.monthlyWithdrawal),
                                    ]}
                                    onValueChange={([value]) =>
                                      setSwpData({
                                        ...swpData,
                                        monthlyWithdrawal: value.toString(),
                                      })
                                    }
                                    max={50000}
                                    min={1000}
                                    step={500}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="8000"
                                    value={swpData.monthlyWithdrawal}
                                    onChange={(e) =>
                                      setSwpData({
                                        ...swpData,
                                        monthlyWithdrawal: e.target.value,
                                      })
                                    }
                                    className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                  />
                                </div>
                              </div>
                            )}

                            {swpMode === "stepUp" && (
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Initial Monthly Withdrawal (₹)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Starting withdrawal amount, will
                                            increase annually
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[
                                        toNumber(swpData.initialWithdrawal),
                                      ]}
                                      onValueChange={([value]) =>
                                        setSwpData({
                                          ...swpData,
                                          initialWithdrawal: value.toString(),
                                        })
                                      }
                                      max={50000}
                                      min={1000}
                                      step={500}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="8000"
                                      value={swpData.initialWithdrawal}
                                      onChange={(e) =>
                                        setSwpData({
                                          ...swpData,
                                          initialWithdrawal: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium flex items-center gap-1">
                                    Annual Step-Up (%)
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Yearly increase in withdrawal amount
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Label>
                                  <div className="space-y-2">
                                    <Slider
                                      value={[
                                        toNumber(swpData.stepUpPercentage),
                                      ]}
                                      onValueChange={([value]) =>
                                        setSwpData({
                                          ...swpData,
                                          stepUpPercentage: value.toString(),
                                        })
                                      }
                                      max={15}
                                      min={0}
                                      step={0.5}
                                      className="flex-1"
                                    />
                                    <Input
                                      placeholder="5"
                                      value={swpData.stepUpPercentage}
                                      onChange={(e) =>
                                        setSwpData({
                                          ...swpData,
                                          stepUpPercentage: e.target.value,
                                        })
                                      }
                                      className="bg-muted/50 border-border text-foreground h-9 focus-ring"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {swpMode === "swpVsFd" && (
                              <InputWithLabel
                                label="FD Interest Rate (%)"
                                placeholder="7"
                                value={swpData.fdRate}
                                onChange={(e) =>
                                  setSwpData({
                                    ...swpData,
                                    fdRate: e.target.value,
                                  })
                                }
                              />
                            )}

                            {(swpMode === "standard" ||
                              swpMode === "sustainable" ||
                              swpMode === "stepUp" ||
                              swpMode === "swpVsFd") && (
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

                            {/* Tax Configuration */}
                            <div className="space-y-3 border-t pt-3">
                              <Label className="text-sm font-medium">
                                Tax Configuration
                              </Label>
                              <div className="grid md:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                  <Label>Investment Type</Label>
                                  <Select
                                    value={swpData.investmentType}
                                    onValueChange={(value) =>
                                      setSwpData({
                                        ...swpData,
                                        investmentType: value as
                                          | "equity"
                                          | "debt"
                                          | "hybrid",
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equity">
                                        Equity
                                      </SelectItem>
                                      <SelectItem value="debt">Debt</SelectItem>
                                      <SelectItem value="hybrid">
                                        Hybrid
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <InputWithLabel
                                  label="Tax Slab (%)"
                                  placeholder="30"
                                  value={swpData.taxSlab}
                                  onChange={(e) =>
                                    setSwpData({
                                      ...swpData,
                                      taxSlab: e.target.value,
                                    })
                                  }
                                />
                                <InputWithLabel
                                  label="Expense Ratio (%)"
                                  placeholder="1.5"
                                  value={swpData.expenseRatio}
                                  onChange={(e) =>
                                    setSwpData({
                                      ...swpData,
                                      expenseRatio: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
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
                              {
                                value: "taxAdjusted",
                                label: "Tax-Adjusted Returns",
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

                          {mfMode === "taxAdjusted" && (
                            <div className="space-y-3">
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
                                  label="Current Value (₹)"
                                  placeholder="180000"
                                  value={mfData.currentValue}
                                  onChange={(e) =>
                                    setMfData({
                                      ...mfData,
                                      currentValue: e.target.value,
                                    })
                                  }
                                />
                                <InputWithLabel
                                  label="Holding Period (Years)"
                                  placeholder="3"
                                  value={mfData.holdingPeriod}
                                  onChange={(e) =>
                                    setMfData({
                                      ...mfData,
                                      holdingPeriod: e.target.value,
                                    })
                                  }
                                />
                                <div className="space-y-2">
                                  <Label>Fund Type</Label>
                                  <Select
                                    value={mfData.fundType}
                                    onValueChange={(value) =>
                                      setMfData({
                                        ...mfData,
                                        fundType: value as
                                          | "equity"
                                          | "debt"
                                          | "other",
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equity">
                                        Equity Fund
                                      </SelectItem>
                                      <SelectItem value="debt">
                                        Debt Fund
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              {(mfData.fundType === "debt" ||
                                mfData.fundType === "other") && (
                                <InputWithLabel
                                  label="Income Slab Rate (%)"
                                  placeholder="30"
                                  value={mfData.incomeSlabRate}
                                  onChange={(e) =>
                                    setMfData({
                                      ...mfData,
                                      incomeSlabRate: e.target.value,
                                    })
                                  }
                                  tooltip="Your income tax slab rate - required for debt fund tax calculations"
                                />
                              )}
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
  horizontal = false,
}: {
  label: string;
  value: string;
  isPrimary?: boolean;
  isLarge?: boolean;
  horizontal?: boolean;
}) => (
  <div
    className={cn(
      "glass-strong rounded-lg p-3 border border-border/20",
      horizontal ? "text-center flex-1" : "text-center"
    )}
  >
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
