export type ConversationChannel = "internal" | "sms" | "email" | "whatsapp" | "phone";
export type ConversationStatus = "open" | "closed" | "archived" | "escalated";
export type MessageSenderType = "staff" | "patient" | "ai" | "system";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";

export interface Conversation {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  lead_id: string | null;
  appointment_id: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  subject: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface MessageMetadata {
  ai_trace_id?: string;
  ai_model?: string;
  tool_calls?: Record<string, unknown>[];
  provider_message_id?: string;
  is_internal_note?: boolean;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  clinic_id: string;
  conversation_id: string;
  sender_type: MessageSenderType;
  sender_id: string | null;
  direction: MessageDirection;
  content: string;
  status: MessageStatus;
  metadata: MessageMetadata;
  is_read: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ConversationWithDetails extends Conversation {
  patients?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  leads?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  } | null;
  appointments?: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    treatment_type: string | null;
  } | null;
  last_message?: Message | null;
  messages?: Message[];
}
