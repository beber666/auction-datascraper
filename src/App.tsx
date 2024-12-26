import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Tools from "@/pages/Tools";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <div className="flex w-full">
            <AppSidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/tools" element={<Tools />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;