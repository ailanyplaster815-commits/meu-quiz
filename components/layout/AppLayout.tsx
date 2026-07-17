import GreenHeader from "./GreenHeader";
import BottomNavigation from "./BottomNavigation";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-gray-100">

      <GreenHeader />

      <div className="mx-auto max-w-md px-4 py-6 pb-24">

        {children}

      </div>

      <BottomNavigation />

    </main>
  );
}