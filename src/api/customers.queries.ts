import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi, type CreateCustomerDto, type UpdateCustomerDto } from "./customers";
const keys = {
    all: ["customers"] as const,
};
export function useCustomers() {
    return useQuery({
        queryKey: keys.all,
        queryFn: customersApi.list,
    });
}
export function useCreateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateCustomerDto) => customersApi.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
export function useUpdateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: UpdateCustomerDto }) =>
            customersApi.update(id, dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}
export function useDeleteCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => customersApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
}