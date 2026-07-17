"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export default function Header({
  title = "Seu Nutri",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/maca-4.png"
            alt="Seu Nutri"
            width={42}
            height={42}
            priority
          />

          <div>
            <h1 className="text-lg font-bold text-green-600">
              {title}
            </h1>

            <p className="text-xs text-gray-500">
              Sua alimentação inteligente
            </p>
          </div>
        </div>

        {/* Menu */}
        <button
          className="rounded-full p-2 transition hover:bg-gray-100"
        >
          <Menu
            size={26}
            className="text-green-600"
          />
        </button>

      </div>
    </header>
  );
}