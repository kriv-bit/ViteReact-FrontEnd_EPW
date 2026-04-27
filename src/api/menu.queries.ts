import { useQuery } from "@tanstack/react-query";
import { menuApi } from "./menu";

const keys = {
  menu: (roleId: number) => ["menu", roleId] as const,
};

export function useMenuOptions(roleId: number | null) {
  return useQuery({
    queryKey: keys.menu(roleId ?? 0),
    queryFn: () => {
      console.log("[menu.queries] Ejecutando query para roleId:", roleId);
      return menuApi.getByRole(roleId!);
    },
    enabled: roleId !== null,
  });
}
