import { cn } from "@/lib/utils";

interface PackageBalanceProps {
  balance: number;
  formatAmount: (amount: number) => string;
}

export const PackageBalance = ({ balance, formatAmount }: PackageBalanceProps) => {
  const isProfit = balance >= 0;
  
  return (
    <div className="mb-6">
      <p className="text-sm font-medium">
        Balance: <span className={cn(
          "font-bold",
          isProfit ? "text-green-600" : "text-red-600"
        )}>
          {formatAmount(balance)}
        </span>
      </p>
    </div>
  );
};