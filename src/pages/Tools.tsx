import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyConverterTool } from "@/components/tools/CurrencyConverterTool";
import { PackageCalculatorTool } from "@/components/tools/PackageCalculatorTool";

const Tools = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyConverterTool />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Price Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <PackageCalculatorTool />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tools;