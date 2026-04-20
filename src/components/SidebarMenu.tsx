import { useState } from "react";

type Props = {
  current: string;
  onChange: (page: string) => void;
  menuOptions: { name: string; content: string }[]; // 👈 Esto es un array, no una tupla
};

export default function SidebarMenu({ current, onChange, menuOptions }: Props) {
  // El estado se define DENTRO del componente
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">MiniPOS</h2>
      <nav className="flex flex-col gap-2">
        {menuOptions.map((option) => (
          <button
            key={option.name}
            className={`text-left p-2 rounded ${current === option.name
                ? "bg-black text-white"
                : "hover:bg-red-100"
              }`}
            onClick={() => onChange(option.name)}
          >
            {option.content}
          </button>
        ))}
      </nav>
    </div>
  );
}