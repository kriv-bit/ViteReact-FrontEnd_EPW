# 🧭 Guía Completa del Flujo: Login + Menú Dinámico por Rol

## 📋 Índice
1. [Visión General](#1-visión-general)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Backend (SpringBoot) - Resumen Rápido](#3-backend-springboot---resumen-rápido)
4. [Frontend (React/Vite) - El Flujo Paso a Paso](#4-frontend-reactvite---el-flujo-paso-a-paso)
5. [Explicación Detallada de Cada Archivo del Frontend](#5-explicación-detallada-de-cada-archivo-del-frontend)
6. [Diagrama de Flujo Completo](#6-diagrama-de-flujo-completo)
7. [Glosario de Términos](#7-glosario-de-términos)

---

## 1. Visión General

La aplicación ahora permite:

1. **3 botones en el sidebar** para ingresar como Admin, Customer o Provider
2. **Login real** contra el backend (`POST /api/auth/login`)
3. **Menú dinámico** que se carga desde la base de datos según el rol del usuario
4. **Log Out** que limpia todo y vuelve al estado inicial
5. **Todas las llamadas a la API** usan el token JWT automáticamente

### Roles y sus IDs

| RoleId | Rol | Usuario | Contraseña |
|--------|-----|---------|------------|
| 1 | ADMIN | `admin_user` | `123` |
| 2 | CUSTOMER | `customer_user` | `123` |
| 3 | PROVIDER | `provider_user` | `123` |

---

## 2. Arquitectura del Proyecto

```
FRONTEND (React/Vite)                    BACKEND (SpringBoot)
─────────────────────                    ────────────────────
src/
├── api/
│   ├── http.ts          ←── llamadas ──→  localhost:8080
│   ├── menu.ts                           ├── AuthController  (/api/auth)
│   ├── menu.queries.ts                   ├── MenuController  (/api/menu)
│   ├── customers.ts                      ├── CustomerController (/customers)
│   └── customers.queries.ts              └── ... otros
├── components/
│   └── SidebarMenu.tsx
├── layouts/
│   └── MainLayout.tsx
├── pages/
│   ├── CustomersPage.tsx
│   ├── AboutMePage.tsx
│   └── ...
├── App.tsx               ←── cerebro principal
└── main.tsx
```

---

## 3. Backend (SpringBoot) - Resumen Rápido

### Archivos creados/modificados

| Archivo | ¿Qué hace? |
|---------|------------|
| `entity/Role.java` | Enum con `USER, ADMIN, CUSTOMER, PROVIDER` |
| `entity/MenuOption.java` | Entidad JPA con `name`, `content`, `roleId` |
| `dto/MenuOptionDto.java` | DTO con `name` y `content` para la respuesta JSON |
| `repository/MenuOptionRepository.java` | Busca opciones por `roleId` |
| `service/MenuService.java` + `impl/MenuServiceImpl.java` | Lógica de negocio: consulta BD y mapea a DTO |
| `controller/MenuController.java` | Endpoint `GET /api/menu/{roleId}` con validación de token |
| `security/JwtService.java` | Ahora guarda el `role` dentro del token JWT |
| `security/JwtAuthFilter.java` | Extrae el rol real del token (ya no hardcodea `ROLE_USER`) |
| `controller/AuthController.java` | Login ahora devuelve el rol y lo incluye en el token |
| `dto/AuthResponse.java` | Ahora incluye campo `role` |
| `creador.sql` | Inserts de usuarios + opciones de menú |

### Endpoints relevantes

```
POST /api/auth/login    →  { token, username, role }   ← público
GET  /api/menu/{roleId} →  [{ name, content }, ...]     ← requiere token
GET  /customers         →  [ ... ]                      ← requiere token
```

### Validación de rol en el backend

El `MenuController` hace esto:

1. Recibe el `roleId` de la URL (ej: 1)
2. Lo mapea a nombre de rol: `1 → "ADMIN"`
3. Obtiene el rol del token JWT del usuario autenticado
4. Compara: si no coinciden → **403 Forbidden**

---

## 4. Frontend (React/Vite) - El Flujo Paso a Paso

### 🟢 Estado Inicial (sin sesión)

Cuando la aplicación carga por primera vez:

1. `App.tsx` se ejecuta
2. Todos los estados de autenticación están en `null`:
   ```tsx
   const [token, setToken] = useState<string | null>(null);
   const [roleId, setRoleId] = useState<number | null>(null);
   const [username, setUsername] = useState<string | null>(null);
   ```
3. `useMenuOptions(roleId)` se llama con `roleId = null`
   - El `enabled: roleId !== null` es `false`
   - **La query NO se ejecuta** → `menuOptions = []`
4. `SidebarMenu` recibe `token = null`
   - Renderiza la **vista "sin sesión"**
   - Muestra: 3 botones de login + About Me

### 🔵 Usuario hace clic en "Ingresar como Admin"

```
SidebarMenu.tsx
  └─ onClick={() => onLogin("admin")}
       │
       ▼
App.tsx — handleLogin("admin")
```

**Paso a paso dentro de `handleLogin`:**

```tsx
const handleLogin = useCallback(async (role: string) => {
    // 1. Obtiene credenciales del mapa
    const creds = LOGIN_CREDENTIALS["admin"];
    // → { username: "admin_user", password: "123" }

    // 2. Muestra loading y limpia errores
    setIsLoggingIn(true);
    setLoginError(null);

    // 3. Llama a la API de login
    const res = await menuApi.login("admin_user", "123");
    // → POST http://localhost:8080/api/auth/login
    // → Response: { token, username: "admin_user", role: "ADMIN" }

    // 4. Configura el token GLOBAL (para todas las futuras llamadas HTTP)
    setAuthToken(res.token);

    // 5. Actualiza estados de React
    setToken(res.token);      // ← para saber si hay sesión
    setUsername(res.username); // ← "admin_user"
    setRoleId(1);             // ← ADMIN = 1 (dispara la query del menú)
    setPage("abtme");         // ← va a About Me

    setIsLoggingIn(false);
}, []);
```

### 🟡 ¿Qué pasa después de `setRoleId(1)`?

Cuando React re-renderiza:

```tsx
const { data: menuOptions = [] } = useMenuOptions(roleId);
// roleId ahora es 1 (ya no es null)
```

Esto ejecuta el hook:

```tsx
// menu.queries.ts
export function useMenuOptions(roleId: number | null) {
  return useQuery({
    queryKey: ["menu", roleId],   // ["menu", 1]
    queryFn: () => menuApi.getByRole(roleId!),
    enabled: roleId !== null,      // → true ✅
  });
}
```

Que llama a:

```tsx
// menu.ts
getByRole: async (roleId: number) => {
    return http<MenuOption[]>(`/api/menu/${roleId}`);
    // → GET http://localhost:8080/api/menu/1
    // → Incluye Authorization: Bearer <token> (automático)
};
```

### 🟠 El token viaja automáticamente en TODAS las llamadas

Esto pasa gracias a `http.ts`:

```tsx
// Variable GLOBAL del módulo (no es estado de React)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;  // ← se guarda aquí
}

export async function http<T>(path, options) {
    const headers = { "Content-Type": "application/json" };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
        // ← SE AGREGA AUTOMÁTICAMENTE A CADA REQUEST
    }

    const res = await fetch(`${API_URL}${path}`, { headers, ...options });
    // ...
}
```

**Esto significa que NO necesitas pasar el token manualmente a cada función API.** 
`customersApi.list()`, `menuApi.getByRole()`, etc. todas heredan el token.

### 🔴 SidebarMenu se re-renderiza con las opciones

```tsx
// SidebarMenu.tsx - Vista "con sesión"
<div className="space-y-4">
    <h2 className="text-xl font-bold">MiniPOS</h2>
    
    {/* Info del usuario */}
    <div>Conectado como admin_user</div>
    
    {/* Opciones del menú desde la API */}
    <nav>
        {menuOptions.map(option => (
            <button onClick={() => onChange(option.name)}>
                {option.content}  {/* "Customers", "Departments", etc. */}
            </button>
        ))}
    </nav>

    {/* Log Out */}
    <button onClick={onLogout}>Cerrar Sesión</button>
</div>
```

### ⚫ Usuario hace clic en "Customers"

1. `onChange("customers")` → `setPage("customers")`
2. `App.tsx` renderiza: `case "customers": return <CustomersPage />`
3. `CustomersPage` se monta
4. Ejecuta `useCustomers()` → `customersApi.list()` → `http("/customers")`
5. **El token se incluye automáticamente** → ¡Ya no da 403! ✅

### ⚪ Usuario hace clic en "Cerrar Sesión"

```tsx
const handleLogout = useCallback(() => {
    setAuthToken(null);    // ← elimina el token global
    setToken(null);        // ← React sabe que no hay sesión
    setRoleId(null);
    setUsername(null);
    setLoginError(null);
    setPage("abtme");      // ← vuelve a About Me
}, []);
```

El `SidebarMenu` recibe `token = null` y vuelve a mostrar la **vista "sin sesión"** con los 3 botones de login.

---

## 5. Explicación Detallada de Cada Archivo del Frontend

### 📁 `src/api/http.ts` — El transportador HTTP

```tsx
// 1. URL base del backend (desde variable de entorno)
export const API_URL = import.meta.env.VITE_API_URL;
// → "http://localhost:8080"

// 2. Token global (variable de módulo, NO estado de React)
let authToken: string | null = null;

// 3. Función para configurar el token
export function setAuthToken(token: string | null) {
    authToken = token;
}

// 4. Función genérica para hacer peticiones HTTP
export async function http<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // 🔑 Aquí se agrega el token automáticamente
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_URL}${path}`, { headers, ...options });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
```

**¿Por qué es importante?** Porque cada vez que cualquier parte de la app llama a `http("/customers")` o `http("/api/menu/1")`, el token se agrega automáticamente. No hay que pensar en ello.

### 📁 `src/api/menu.ts` — La API del menú

```tsx
export type MenuOption = {
    name: string;     // ← identificador interno (ej: "customers")
    content: string;  // ← texto visible (ej: "Customers")
};

export type AuthResponse = {
    token: string;
    username: string;
    role: string;     // ← "ADMIN", "CUSTOMER", o "PROVIDER"
};

export const menuApi = {
    // 1. Login (usa fetch directo porque es público)
    login: async (username, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        return res.json(); // → { token, username, role }
    },

    // 2. Obtener menú (usa http() que ya tiene el token)
    getByRole: async (roleId) => {
        return http<MenuOption[]>(`/api/menu/${roleId}`);
    },
};
```

### 📁 `src/api/menu.queries.ts` — El hook de TanStack Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { menuApi } from "./menu";

const keys = {
    menu: (roleId: number) => ["menu", roleId] as const,
};

export function useMenuOptions(roleId: number | null) {
    return useQuery({
        queryKey: keys.menu(roleId ?? 0),  // cache key único por roleId
        queryFn: () => menuApi.getByRole(roleId!),  // función que obtiene datos
        enabled: roleId !== null,  // ← solo se ejecuta si hay roleId
    });
}
```

**¿Por qué `enabled: roleId !== null`?** Porque cuando la app carga por primera vez, no hay usuario logueado. El `roleId` es `null`. No tiene sentido hacer una petición al backend. Cuando el usuario hace login, `roleId` cambia a `1`, `2` o `3`, y la query se **activa automáticamente**.

### 📁 `src/App.tsx` — El cerebro de la aplicación

```tsx
function App() {
    // ─── Estados de autenticación ─────────────────────
    const [token, setToken] = useState<string | null>(null);
    const [roleId, setRoleId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // ─── Estado de navegación ─────────────────────────
    const [page, setPage] = useState("abtme");  // página actual

    // ─── Hook del menú ────────────────────────────────
    const { data: menuOptions = [] } = useMenuOptions(roleId);
    // ↑ roleId = null → no se ejecuta
    // ↑ roleId = 1 → se ejecuta y trae opciones de ADMIN

    // ─── Mapa: nombre de rol → roleId ────────────────
    const ROLE_TO_ID = { ADMIN: 1, CUSTOMER: 2, PROVIDER: 3 };

    // ─── Credenciales de los 3 botones ────────────────
    const LOGIN_CREDENTIALS = {
        admin:    { username: "admin_user",    password: "123" },
        customer: { username: "customer_user", password: "123" },
        provider: { username: "provider_user", password: "123" },
    };

    // ─── Handler de login ─────────────────────────────
    const handleLogin = useCallback(async (role: string) => {
        const creds = LOGIN_CREDENTIALS[role];
        setIsLoggingIn(true);
        setLoginError(null);
        try {
            const res = await menuApi.login(creds.username, creds.password);
            setAuthToken(res.token);           // 1. Token global
            setToken(res.token);               // 2. Estado React
            setUsername(res.username);
            setRoleId(ROLE_TO_ID[res.role]);   // 3. Dispara la query
            setPage("abtme");
        } catch (err: any) {
            setLoginError(err.message);
        } finally {
            setIsLoggingIn(false);
        }
    }, []);

    // ─── Handler de logout ────────────────────────────
    const handleLogout = useCallback(() => {
        setAuthToken(null);  // limpia token global
        setToken(null);      // React sabe que no hay sesión
        setRoleId(null);     // desactiva la query del menú
        setUsername(null);
        setLoginError(null);
        setPage("abtme");
    }, []);

    // ─── Render ───────────────────────────────────────
    return (
        <MainLayout
            sidebar={
                <SidebarMenu
                    current={page}
                    onChange={setPage}
                    token={token}              // ¿hay sesión o no?
                    username={username}
                    menuOptions={menuOptions}  // opciones desde la API
                    loginError={loginError}
                    isLoggingIn={isLoggingIn}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                />
            }
            content={renderContent()}
        />
    );
}
```

### 📁 `src/components/SidebarMenu.tsx` — El menú lateral

**Dos caras del mismo componente:**

#### Sin sesión (`token === null`)
```
┌─────────────────────┐
│     MiniPOS          │
│                      │
│  ── Ingresar como… ─ │
│  [Ingresar como     │  ← negro
│   Admin]             │
│  [Ingresar como     │  ← azul
│   Customer]          │
│  [Ingresar como     │  ← verde
│   Provider]          │
│                      │
│  ── Navegación ──── │
│  About Me            │  ← única opción disponible
└─────────────────────┘
```

#### Con sesión (`token !== null`)
```
┌─────────────────────┐
│     MiniPOS          │
│  ┌─────────────────┐ │
│  │ Conectado como   │ │
│  │ admin_user       │ │
│  └─────────────────┘ │
│                      │
│  Customers           │  ← opciones desde la API
│  Departments         │
│  Providers           │
│  Usuarios            │
│  Prueba              │
│  About Me            │
│                      │
│  ──────────────────  │
│  Cerrar Sesión  (rojo)│
└─────────────────────┘
```

---

## 6. Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        INICIO                                    │
│  token = null, roleId = null, page = "abtme"                    │
│  Sidebar muestra: 3 botones + About Me                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Usuario hace clic en
           "Ingresar como Admin"
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  handleLogin("admin")                                            │
│                                                                  │
│  1. Toma credenciales: { username: "admin_user", pass: "123" }  │
│                                                                  │
│  2. Llama a → menuApi.login("admin_user", "123")                │
│     POST http://localhost:8080/api/auth/login                    │
│                                                                  │
│  3. Backend valida credenciales ✓                               │
│     Genera JWT con { subject: "admin_user", role: "ADMIN" }     │
│     Responde: { token: "eyJ...", username: "admin_user",        │
│                 role: "ADMIN" }                                   │
│                                                                  │
│  4. Frontend recibe la respuesta                                 │
│     ┌──────────────────────────────────────────────────────┐    │
│     │  setAuthToken(res.token)  →  token global configurado │    │
│     │  setRoleId(1)             →  dispara useMenuOptions   │    │
│     │  setToken(res.token)      →  sidebar cambia a logged  │    │
│     │  setPage("abtme")         →  muestra About Me         │    │
│     └──────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  useMenuOptions(1) se activa                                    │
│                                                                  │
│  → TanStack Query: queryKey = ["menu", 1]                      │
│  → queryFn: menuApi.getByRole(1)                                │
│  → http("/api/menu/1")                                          │
│    (token se incluye automáticamente en headers)                │
│                                                                  │
│  → Backend: GET /api/menu/1                                     │
│    Valida que el token tenga rol "ADMIN" (roleId=1) ✓          │
│    Busca en BD: SELECT * FROM menu_option WHERE role_id = 1     │
│    Responde: [{ name, content }, ...]                           │
│                                                                  │
│  → React actualiza menuOptions con los datos                    │
│  → SidebarMenu re-renderiza con las opciones                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Usuario hace clic en "Customers"
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  setPage("customers")                                            │
│  App.tsx renderiza <CustomersPage />                             │
│                                                                  │
│  CustomersPage ejecuta useCustomers()                            │
│  → customersApi.list() → http("/customers")                     │
│  → Token se incluye automáticamente (setAuthToken ya lo puso)   │
│  → Backend responde con lista de clientes ✓                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Usuario hace clic en "Cerrar Sesión"
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  handleLogout()                                                  │
│                                                                  │
│  setAuthToken(null)   →  limpia token global                    │
│  setToken(null)       →  sidebar cambia a "sin sesión"          │
│  setRoleId(null)      →  desactiva useMenuOptions               │
│  setUsername(null)                                                │
│  setPage("abtme")     →  muestra About Me                       │
│                                                                  │
│  → SidebarMenu vuelve a mostrar los 3 botones de login          │
│  → Las próximas llamadas http() NO tendrán token                │
│    (si alguien intenta acceder a /customers, dará 403)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Glosario de Términos

| Término | Significado |
|---------|-------------|
| **JWT** | JSON Web Token. String largo (ej: `eyJhbGci...`) que contiene información del usuario y está firmado digitalmente. |
| **Token global** | Variable en `http.ts` que guarda el JWT. Se configura con `setAuthToken()` y se usa automáticamente en cada `http()`. |
| **TanStack Query** | Librería para manejar peticiones al backend con caché, loading states, etc. Antes se llamaba React Query. |
| **Hook** | Función de React que empieza con `use`. Ej: `useMenuOptions()`, `useCustomers()`. |
| **`enabled`** | Opción de TanStack Query que controla si la query se ejecuta o no. Cuando es `false`, la query está "dormida". |
| **`queryKey`** | Identificador único para cada query en TanStack Query. Si cambia, la query se re-ejecuta. |
| **`useCallback`** | Hook de React que memoriza una función para que no se recreé en cada render. |
| **CORS** | Mecanismo de seguridad del navegador. El backend tiene `@CrossOrigin` para permitir peticiones desde `localhost:5173`. |
| **BCrypt** | Algoritmo de hashing para contraseñas. El backend guarda `"123"` como `$2a$10$INS...` |
| **RoleId** | Número que identifica el rol: 1=ADMIN, 2=CUSTOMER, 3=PROVIDER |

---

## 🎯 Resumen de lo que aprendiste

1. **El flujo completo**: Login → Obtener token → Configurar token global → Cargar menú → Navegar
2. **`setAuthToken`** es la pieza clave: configura el token una sola vez y todas las llamadas HTTP lo usan
3. **`useMenuOptions`** se activa SOLO cuando hay un `roleId` válido (gracias a `enabled`)
4. **El Sidebar** tiene dos "personalidades": sin sesión (botones de login) y con sesión (opciones del menú)
5. **Todo está conectado**: `App.tsx` es el cerebro que maneja el estado y se lo pasa a los hijos como props