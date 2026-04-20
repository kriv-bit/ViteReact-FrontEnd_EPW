import { useState } from "react";

type Props = {
  current: string;
  onChange: (page: string) => void;
};

export default function SidebarMenu({ current, onChange }: Props) {
  // El estado se define DENTRO del componente
  const [menuOptions] = useState([
    { name: "customers", content: "Customers" },
    { name: "departments", content: "Departments" },
    { name: "test", content: "Prueba" },
    { name: "abtme", content: "About Me" },
  ]);

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