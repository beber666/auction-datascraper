import type { TooltipContentProps } from "@radix-ui/react-tooltip";

export interface SidebarContextType {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

export interface SidebarMenuButtonProps {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | TooltipContentProps;
}