export default function NextMealCard() {
  return (
    <div className="mt-5 rounded-3xl bg-white p-5 shadow">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-lg font-bold">
            🍽 Próxima refeição
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Almoço
          </p>

        </div>

        <div className="text-right">

          <p className="text-3xl font-bold text-green-600">
            12:30
          </p>

        </div>

      </div>

    </div>
  );
}