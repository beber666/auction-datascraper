import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import CurrencyConverter from "@/pages/tools/CurrencyConverter";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <AppSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tools/currency-converter" element={<CurrencyConverter />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;