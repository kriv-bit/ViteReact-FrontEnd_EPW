import type { MenuOption } from "../api/menu";

type Props = {
  current: string;
  onChange: (page: string) => void;
  token: string | null;
  username: string | null;
  menuOptions: MenuOption[];
  menuLoading: boolean;
  menuError: boolean;
  menuErrorMsg: string;
  onLogout: () => void;
};

export default function SidebarMenu({
  current,
  onChange,
  token,
  username,
  menuOptions,
  menuLoading,
  menuError,
  menuErrorMsg,
  onLogout,
}: Props) {
  // Si por algún motivo no hay token, no renderizamos nada
  // (PrivateRoute ya debería estar mostrando LoginPage)
  if (!token) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">MiniPOS</h2>

      {/* Info del usuario logueado */}
      <div className="bg-slate-50 border rounded p-3 text-sm">
        <p className="text-slate-500 text-xs">Conectado como</p>
        <p className="font-medium truncate">{username}</p>
      </div>

      {/* Opciones de menú desde la API */}
      <nav className="flex flex-col gap-2">
        {/* Estado: cargando */}
        {menuLoading && (
          <p className="text-xs text-slate-400 text-center py-4">
            Cargando opciones del menú…
          </p>
        )}

        {/* Estado: error al cargar */}
        {menuError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded">
            Error al cargar menú: {menuErrorMsg}
          </div>
        )}

        {/* Estado: cargado pero vacío */}
        {!menuLoading && !menuError && menuOptions.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">
            No hay opciones disponibles para este rol.
          </p>
        )}

        {/* Opciones del menú */}
        {!menuLoading &&
          menuOptions.map((option) => (
            <button
              key={option.name}
              className={`text-left p-2 rounded ${
                current === option.name
                  ? "bg-black text-white"
                  : "hover:bg-red-100"
              }`}
              onClick={() => onChange(option.name)}
            >
              {option.content}
            </button>
          ))}
      </nav>

      {/* Separador */}
      <hr className="border-slate-200" />

      {/* Botón de Log Out */}
      <button
        className="w-full text-left p-2 rounded text-red-600 hover:bg-red-50 font-medium text-sm"
        onClick={onLogout}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
