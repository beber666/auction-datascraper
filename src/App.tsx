import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Tools from "@/pages/Tools";
import ZenScraper from "@/pages/ZenScraper";
import PackageManager from "@/pages/PackageManager";
import PackageDetails from "@/pages/PackageDetails";

const queryClient = new QueryClient();

// Create a wrapper component to handle the conditional sidebar rendering
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <SidebarProvider>
      {isLoginPage ? (
        <main className="h-screen w-full">
          {children}
        </main>
      ) : (
        <div className="flex min-h-screen bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-x-auto">
            {children}
          </main>
        </div>
      )}
    </SidebarProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/zen-scraper" element={<ZenScraper />} />
            <Route path="/package-manager" element={<PackageManager />} />
            <Route path="/package-manager/new" element={<PackageDetails />} />
            <Route path="/package-manager/:id" element={<PackageDetails />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;