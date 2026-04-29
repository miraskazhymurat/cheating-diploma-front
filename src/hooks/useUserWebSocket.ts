import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, type WsEvent } from "./useWebSocket";
import type { InviteResponse } from "../api/types";

export function useUserWebSocket() {
  const queryClient = useQueryClient();

  useWebSocket("/users/ws", {
    onMessage: (event: WsEvent) => {
      const { type, data } = event;

      switch (type) {
        case "invite_received": {
          const invite = data as InviteResponse;
          queryClient.setQueryData<InviteResponse[]>(["invites"], (old) => {
            if (!old) return [invite];
            const alreadyExists = old.some((i) => i.id === invite.id);
            if (alreadyExists) return old;
            return [invite, ...old];
          });
          break;
        }

        case "member_added": {
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          break;
        }
      }
    },
  });
}
