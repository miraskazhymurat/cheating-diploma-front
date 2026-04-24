import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../api/employee";

export function useEmployeeActivities() {
  return useQuery({
    queryKey: ["employee", "activities"],
    queryFn: employeeApi.getActivities,
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["employee", "me"],
    queryFn: employeeApi.getMe,
  });
}

export function useAllEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeeApi.getAll,
  });
}

export function useBoardEmployees(id: number) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: () => employeeApi.getByBoardId(id),
    enabled: id > 0,
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => employeeApi.update(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => employeeApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
    },
  });
}

export function useDeleteMember(boardId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardMemberId: number) => employeeApi.deleteMember(boardMemberId),
    onSuccess: (_, boardMemberId) => {
      queryClient.setQueryData<any[]>(["employees", boardId], (old) =>
        old ? old.filter((m) => m.board_member_id !== boardMemberId) : old
      );
    },
  });
}
