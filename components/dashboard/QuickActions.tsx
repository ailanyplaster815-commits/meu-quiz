"use client";

import {
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  User,
} from "lucide-react";

export default function QuickActions() {
  const items = [
    {
      icon: UtensilsCrossed,
      title: "Minha Dieta",
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Dumbbell,
      title: "Treinos",
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: BookOpen,
      title: "Receitas",
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: User,
      title: "Perfil",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mt-6">

      {items.map((item) => (
        <button
          key={item.title}
          className="flex flex-col items-center"
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${item.color}`}
          >
            <item.icon size={28} />
          </div>

          <span className="text-xs mt-2 text-gray-700 text-center">
            {item.title}
          </span>
        </button>
      ))}

    </div>
  );
}