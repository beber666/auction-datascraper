import * as React from "react";
import type { SidebarContextType } from "./types";

export const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export const SidebarProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = React.useState<"expanded" | "collapsed">("expanded");
  const [isMobile, setIsMobile] = React.useState(false);

  return (
    <SidebarContext.Provider
      value={{
        state,
        setState,
        isMobile,
        setIsMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};