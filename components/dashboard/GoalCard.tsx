interface Props {
  objetivo: string;
}

export default function GoalCard({
  objetivo,
}: Props) {
  return (
    <div className="mt-5 rounded-3xl bg-white p-5 shadow">

      <h2 className="text-lg font-bold">

        🎯 Seu objetivo

      </h2>

      <p className="mt-3 text-2xl font-bold text-green-600">

        {objetivo}

      </p>

      <p className="text-gray-500 mt-2">

        Sua dieta será personalizada para este objetivo.

      </p>

    </div>
  );
}