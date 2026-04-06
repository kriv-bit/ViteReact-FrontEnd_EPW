import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { customersApi, type Customer } from "../api/customers";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
export default function CustomersPage() {
    const [rows, setRows] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const debouncedQ = useDebouncedValue(q, 250);
    const deferredQ = useDeferredValue(debouncedQ);
    // useEffect: cargar datos al entrar
    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await customersApi.list();
                setRows(data);
            } catch (e) {
                setErr(String(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    // useMemo: evita recalcular filtrado si no cambia q o rows
    const filtered = useMemo(() => {
        const term = deferredQ.trim().toLowerCase();
        if (!term) return rows;
        return rows.filter((c) =>
            `${c.fullName} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(term),
        );
    }, [rows, deferredQ]);
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">MiniPOS — Customers</h1>
                    <span className="text-sm text-slate-500">Backend: /customers</span>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
                <div className="rounded-xl border bg-white p-4">
                    <label className="block text-sm font-medium mb-2">Buscar</label>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Nombre, email o teléfono…"
                        className="w-full rounded-lg border bg-white px-3 py-2"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Debounce + Deferred: reduce recalculos y mejora fluidez.
                    </p>
                </div>
                <div className="rounded-xl border bg-white">
                    <div className="p-4 border-b">
                        {loading && <p className="text-sm text-slate-600">Cargando…</p>}
                        {err && <p className="text-sm text-red-600">Error: {err}</p>}
                        {!loading && !err && (
                            <p className="text-sm text-slate-600">{filtered.length} registro(s)</p>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left">
                                <tr>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Teléfono</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id} className="border-t">
                                        <td className="p-3">{c.fullName}</td>
                                        <td className="p-3">{c.email}</td>
                                        <td className="p-3">{c.phone ?? "-"}</td>
                                    </tr>
                                ))}
                                {!loading && !err && filtered.length === 0 && (
                                    <tr>
                                        <td className="p-6 text-center text-slate-500" colSpan={3}>
                                            No hay datos. Crea algunos con Postman (POST
                                            /customers).
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}