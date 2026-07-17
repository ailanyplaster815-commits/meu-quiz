interface Props {
  plano: string;
}

export default function PlanCard({ plano }: Props) {
  return (
    <div className="mt-5 rounded-3xl bg-white p-5 shadow">

      <h2 className="text-lg font-bold">
        ⭐ Seu plano
      </h2>

      <div className="mt-4 flex justify-between items-center">

        <div>

          <p className="font-bold text-green-600">
            {plano}
          </p>

          <p className="text-sm text-gray-500">
            Você pode fazer upgrade quando desejar.
          </p>

        </div>

        <button className="rounded-full bg-green-600 px-5 py-2 text-white hover:bg-green-700 transition">
          Upgrade
        </button>

      </div>

    </div>
  );
}