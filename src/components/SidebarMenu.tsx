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
  loginError: string | null;
  isLoggingIn: boolean;
  onLogin: (role: string) => void;
  onLogout: () => void;
};

type LoginButton = {
  role: string;
  label: string;
  color: string;
};

const LOGIN_BUTTONS: LoginButton[] = [
  {
    role: "admin",
    label: "Ingresar como Admin",
    color: "bg-black text-white hover:bg-gray-800",
  },
  {
    role: "customer",
    label: "Ingresar como Customer",
    color: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    role: "provider",
    label: "Ingresar como Provider",
    color: "bg-green-600 text-white hover:bg-green-700",
  },
];

export default function SidebarMenu({
  current,
  onChange,
  token,
  username,
  menuOptions,
  menuLoading,
  menuError,
  menuErrorMsg,
  loginError,
  isLoggingIn,
  onLogin,
  onLogout,
}: Props) {
  // ─── Estado: SIN sesión ─────────────────────────────────
  if (!token) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">MiniPOS</h2>

        {/* Botones de ingreso rápido */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Ingresar como…
          </p>
          {LOGIN_BUTTONS.map((btn) => (
            <button
              key={btn.role}
              disabled={isLoggingIn}
              className={`w-full text-left p-2 rounded text-sm font-medium transition-colors ${btn.color} disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => onLogin(btn.role)}
            >
              {isLoggingIn ? "Ingresando…" : btn.label}
            </button>
          ))}
        </div>

        {/* Error de login */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded">
            {loginError}
          </div>
        )}

        {/* Separador */}
        <hr className="border-slate-200" />

        {/* Opción fija: About Me (sin login) */}
        <nav className="flex flex-col gap-2">
          <button
            className={`text-left p-2 rounded ${
              current === "abtme" ? "bg-black text-white" : "hover:bg-red-100"
            }`}
            onClick={() => onChange("abtme")}
          >
            About Me
          </button>
        </nav>
      </div>
    );
  }

  // ─── Estado: CON sesión ─────────────────────────────────
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
