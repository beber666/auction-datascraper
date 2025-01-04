import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Tools from "@/pages/Tools";
import ZenScraper from "@/pages/ZenScraper";
import PackageManager from "@/pages/PackageManager";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <div className="flex">
            <AppSidebar />
            <div className="flex-1 min-w-0">
              <main className="w-full overflow-x-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/zen-scraper" element={<ZenScraper />} />
                  <Route path="/package-manager" element={<PackageManager />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;