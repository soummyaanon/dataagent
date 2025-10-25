"use client";

import { useEffect } from "react";
import ChatBotDemo from "@/components/chat/ChatLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { VisualizationCanvas } from "@/components/canvas/VisualizationCanvas";
import { useCanvasVisibility } from "@/hooks/useCanvasVisibility";
import { useCanvasStore } from "@/hooks/useCanvasStore";

export default function HomePage() {
  const { isOpen, openCanvas, closeCanvas } = useCanvasVisibility();
  const visualizationCount = useCanvasStore(
    (state) => state.visualizations.size
  );

  useEffect(() => {
    if (visualizationCount > 0 && !isOpen) {
      openCanvas();
    }
  }, [visualizationCount, isOpen, openCanvas]);

  return (
    <AppLayout
      showCanvas={isOpen}
      onCanvasToggle={(open) => (open ? openCanvas() : closeCanvas())}
      canvasContent={<VisualizationCanvas />}
    >
      <ChatBotDemo />
    </AppLayout>
  );
}
