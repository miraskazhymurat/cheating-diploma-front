import { axiosInstance } from "./axiosInstance";

export interface ChatAuthor {
  full_name: string;
  id: number;
  photo: string;
}

export interface ChatAttachment {
  file_name: string;
  file_size: number;
  id: number;
  mime_type: string;
  url: string;
}

export interface ChatReplyTo {
  author: ChatAuthor;
  id: number;
  text: string;
}

export interface ChatMessage {
  id: number;
  board_id: number;
  text: string;
  created_at: string;
  author: ChatAuthor;
  attachments: ChatAttachment[];
  reply_to: ChatReplyTo | null;
  poll: null | {
    id: number;
    question: string;
    options: { id: number; text: string; vote_count: number; voters: ChatAuthor[] }[];
  };
}

export interface SendMessageParams {
  text: string;
  reply_to_id?: number;
  files?: File[];
}

export const chatApi = {
  getMessages: async (boardId: number, limit = 50, offset = 0): Promise<ChatMessage[]> => {
    const res = await (axiosInstance.get(`/boards/${boardId}/chat`, { params: { limit, offset } }) as unknown as Promise<unknown>);
    if (Array.isArray(res)) return res as ChatMessage[];
    if (res && typeof res === "object") {
      const obj = res as Record<string, unknown>;
      const inner = obj.messages ?? obj.data ?? obj.items ?? obj.results;
      if (Array.isArray(inner)) return inner as ChatMessage[];
    }
    return [];
  },

  sendMessage: async (boardId: number, params: SendMessageParams): Promise<ChatMessage> => {
    const form = new FormData();
    form.append("text", params.text);
    if (params.reply_to_id != null) form.append("reply_to_id", String(params.reply_to_id));
    params.files?.forEach((f) => form.append("files", f));
    return axiosInstance.post(`/boards/${boardId}/chat`, form) as unknown as ChatMessage;
  },

  deleteMessage: async (boardId: number, msgId: number): Promise<void> => {
    await axiosInstance.delete(`/boards/${boardId}/chat/${msgId}`);
  },

  createPoll: async (boardId: number, question: string, options: string[]): Promise<void> => {
    await axiosInstance.post(`/boards/${boardId}/chat/polls`, { question, options });
  },

  votePoll: async (boardId: number, optionId: number): Promise<void> => {
    await axiosInstance.post(`/boards/${boardId}/chat/polls/vote`, { option_id: optionId });
  },

  unvotePoll: async (boardId: number, optionId: number): Promise<void> => {
    await axiosInstance.post(`/boards/${boardId}/chat/polls/unvote`, { option_id: optionId });
  },
};
