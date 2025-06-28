"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type ColorPaletteDisplayProps = {
  colors: string[];
  onCopyColor: (color: string) => void;
  children?: React.ReactNode;
};

export function ColorPaletteDisplay({
  colors,
  onCopyColor,
  children,
}: ColorPaletteDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {colors.map((color) => (
          <div key={color} className="group flex flex-col items-center gap-2">
            <div
              className="w-full aspect-square rounded-md shadow-inner border"
              style={{ backgroundColor: color }}
            />
            <div className="text-center">
              <span className="text-sm font-medium text-muted-foreground uppercase">
                {color}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCopyColor(color)}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
        ))}
      </div>
      {children && (
        <div className="flex justify-end pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
