"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ChatHistorySidebar } from "@/components/sidebar/ChatHistorySidebar";
import { Button } from "@/components/ui/button";
import { PanelRightIcon, XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: ReactNode;
  canvasContent?: ReactNode;
  showCanvas?: boolean;
  onCanvasToggle?: (open: boolean) => void;
}

export function AppLayout({
  children,
  canvasContent,
  showCanvas = false,
  onCanvasToggle,
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isCanvasOpen, setIsCanvasOpen] = useState(showCanvas);

  useEffect(() => {
    setIsCanvasOpen(showCanvas);
  }, [showCanvas]);

  const handleCanvasToggle = (open: boolean) => {
    setIsCanvasOpen(open);
    onCanvasToggle?.(open);
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarContent>
            <ChatHistorySidebar />
          </SidebarContent>
        </Sidebar>

        <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
          {!isCanvasOpen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 z-10"
              onClick={() => handleCanvasToggle(true)}
            >
              <PanelRightIcon className="mr-2 h-4 w-4" />
              Show Canvas
            </Button>
          )}

          <div className="flex-1 overflow-auto">{children}</div>
        </main>

        {!isMobile && isCanvasOpen && (
          <aside className="flex h-full w-[500px] flex-col border-l bg-background">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-sm font-semibold">Visualizations</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCanvasToggle(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">{canvasContent}</div>
          </aside>
        )}

        {isMobile && (
          <Sheet open={isCanvasOpen} onOpenChange={handleCanvasToggle}>
            <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="text-sm font-semibold">Visualizations</h2>
                </div>
                <div className="flex-1 overflow-auto">{canvasContent}</div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </SidebarProvider>
  );
}
