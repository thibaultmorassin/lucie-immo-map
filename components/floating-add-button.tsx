"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-10">
      <Button
        onClick={onClick}
        size="lg"
        className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95"
        aria-label="Ajouter un bien immobilier"
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    </div>
  );
}
