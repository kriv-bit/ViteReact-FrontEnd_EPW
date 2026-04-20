export default function DepartamentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Departments Page</h1>
      <div className="bg-white rounded-lg border p-6">
        <p className="text-gray-600">
          Esta página está en construcción. Aquí se mostrará la gestión de
          departamentos.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded border">
          <h2 className="font-semibold mb-2">Funcionalidades planeadas:</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Listar departamentos</li>
            <li>Crear nuevos departamentos</li>
            <li>Editar departamentos existentes</li>
            <li>Eliminar departamentos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
