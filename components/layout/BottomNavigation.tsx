"use client";

import Link from "next/link";
import { Home, UtensilsCrossed, User } from "lucide-react";

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white shadow-lg">

      <div className="mx-auto flex max-w-md justify-around py-3">

        <Link
          href="/dashboard"
          className="flex flex-col items-center text-green-600"
        >
          <Home size={24} />
          <span className="text-xs mt-1">
            Início
          </span>
        </Link>

        <Link
          href="/dieta"
          className="flex flex-col items-center text-gray-500"
        >
          <UtensilsCrossed size={24} />
          <span className="text-xs mt-1">
            Dieta
          </span>
        </Link>

        <Link
          href="/perfil"
          className="flex flex-col items-center text-gray-500"
        >
          <User size={24} />
          <span className="text-xs mt-1">
            Perfil
          </span>
        </Link>

      </div>

    </nav>
  );
}