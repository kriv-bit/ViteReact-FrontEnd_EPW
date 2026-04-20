import { useDeferredValue, useMemo, useState } from "react";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../api/customers.queries";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "../api/customers";

export default function CustomersPage() {
  const { data = [], isLoading, isError, error, refetch } = useCustomers();
  const createMut = useCreateCustomer();
  const deleteMut = useDeleteCustomer();
  const updateMut = useUpdateCustomer();

  // Estados para creación
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Estados para edición (modal)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Estado para búsqueda
  const [q, setQ] = useState("");

  const debouncedQ = useDebouncedValue(q, 250);
  const deferredQ = useDeferredValue(debouncedQ);

  // Filtrado de datos
  const filtered = useMemo(() => {
    const term = deferredQ.trim().toLowerCase();
    if (!term) return data;
    return data.filter((c) =>
      `${c.fullName} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(term),
    );
  }, [data, deferredQ]);

  // Función para crear cliente
  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const dto: CreateCustomerDto = { fullName, email };
    if (phone.trim()) {
      dto.phone = phone;
    }
    await createMut.mutateAsync(dto);
    setFullName("");
    setEmail("");
    setPhone("");
  }

  // Función para abrir modal de edición
  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);
    setEditFullName(customer.fullName);
    setEditEmail(customer.email);
    setEditPhone(customer.phone || "");
  }

  // Función para cerrar modal de edición
  function closeEditModal() {
    setEditingCustomer(null);
    setEditFullName("");
    setEditEmail("");
    setEditPhone("");
  }

  // Función para guardar edición
  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCustomer) return;

    const dto: UpdateCustomerDto = {
      fullName: editFullName,
      email: editEmail,
    };

    if (editPhone.trim()) {
      dto.phone = editPhone;
    }
    // Si editPhone está vacío, no enviamos el campo phone
    // El backend decidirá qué hacer (mantener el valor anterior o poner null)

    await updateMut.mutateAsync({ id: editingCustomer.id, dto });
    closeEditModal();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Customers</h1>
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? "Refrescando…" : "Reintentar/Refrescar"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        {/* Búsqueda */}
        <div className="rounded-xl border bg-white p-4">
          <label className="block text-sm font-medium mb-2">Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nombre, email o teléfono…"
            className="w-full rounded-lg border bg-white px-3 py-2"
          />
          <p className="mt-2 text-xs text-slate-500">
            Debounce + Deferred + TanStack Query: filtra en cliente sin efectos
            secundarios.
          </p>
        </div>

        {/* Formulario de creación (POST) */}
        <form
          onSubmit={onCreate}
          className="rounded-xl border bg-white p-4 space-y-3"
        >
          <p className="text-sm text-slate-600">
            <b>Mutation (POST)</b>: crea customer y luego invalida cache para
            refrescar listado.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Teléfono (opcional)
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 123 456 7890"
              />
            </div>
          </div>
          <button
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? "Creando…" : "Crear"}
          </button>
          {createMut.isError && (
            <p className="text-sm text-red-600">
              Error creando: {String(createMut.error)}
            </p>
          )}
        </form>

        {/* Modal de edición (PUT) - Solo visible cuando editingCustomer no es null */}
        {editingCustomer && (
          <form
            onSubmit={onUpdate}
            className="rounded-xl border-2 border-blue-500 bg-white p-4 space-y-3"
          >
            <p className="text-sm text-slate-600">
              <b>Mutation (PUT)</b>: actualiza customer completamente y luego
              invalida cache.
              <span className="block text-xs text-blue-600 mt-1">
                PUT reemplaza TODO el recurso. Todos los campos son requeridos.
              </span>
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+57 123 456 7890"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                disabled={updateMut.isPending}
              >
                {updateMut.isPending ? "Actualizando…" : "PUT - Actualizar"}
              </button>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 hover:bg-slate-50"
                onClick={closeEditModal}
                disabled={updateMut.isPending}
              >
                Cancelar
              </button>
            </div>

            {updateMut.isError && (
              <p className="text-sm text-red-600">
                Error actualizando: {String(updateMut.error)}
              </p>
            )}
          </form>
        )}

        {/* Tabla de clientes */}
        <div className="rounded-xl border bg-white">
          <div className="p-4 border-b">
            {isLoading && <p className="text-sm text-slate-600">Cargando…</p>}
            {isError && (
              <p className="text-sm text-red-600">Error: {String(error)}</p>
            )}
            {!isLoading && !isError && (
              <p className="text-sm text-slate-600">
                Mostrando {filtered.length} de {data.length} registro(s)
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Teléfono</th>
                  <th className="p-3 w-40">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">{c.fullName}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone || "-"}</td>
                    <td className="p-3 space-x-2">
                      <button
                        className="rounded-md border px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                        onClick={() => openEditModal(c)}
                        disabled={deleteMut.isPending || updateMut.isPending}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-md border px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (
                            !confirm("¿Seguro que deseas borrar este customer?")
                          )
                            return;
                          deleteMut.mutate(c.id);
                        }}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}

                {!isLoading && !isError && filtered.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan={4}>
                      {q
                        ? "No hay resultados para tu búsqueda."
                        : "No hay registros."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Errores de mutaciones */}
          {deleteMut.isError && (
            <div className="p-4">
              <p className="text-sm text-red-600">
                Error borrando: {String(deleteMut.error)}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
