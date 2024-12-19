import type { TooltipContentProps } from "@radix-ui/react-tooltip";

export type SidebarContextType = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export type SidebarMenuButtonProps = {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | TooltipContentProps;
};