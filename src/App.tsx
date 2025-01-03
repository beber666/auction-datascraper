import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Tools from "@/pages/Tools";
import ZenScraper from "@/pages/ZenScraper";

// Component to conditionally render sidebar based on route
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <div className="flex w-full">
          {!isLoginPage && <AppSidebar />}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/zen-scraper" element={<ZenScraper />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  );
}

export default App;