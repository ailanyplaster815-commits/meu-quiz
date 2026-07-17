"use client";

export default function ProgressCard() {
  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow">

      <div className="flex justify-between">

        <div>

          <h2 className="font-bold text-lg">
            🔥 Progresso do dia
          </h2>

          <p className="text-gray-500 text-sm">
            Continue assim!
          </p>

        </div>

        <h3 className="text-2xl font-bold text-green-600">
          65%
        </h3>

      </div>

      <div className="mt-5 h-3 w-full rounded-full bg-gray-200">

        <div className="h-3 w-2/3 rounded-full bg-green-600"></div>

      </div>

    </div>
  );
}