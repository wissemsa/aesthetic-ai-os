"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { revalidatePath } from "next/cache";
import {
  ConversationChannel,
  ConversationStatus,
  MessageDirection,
  MessageSenderType,
} from "@/types/communications";

export async function getConversations(filters?: {
  channel?: ConversationChannel | "all";
  status?: ConversationStatus | "all";
  search?: string;
  patientId?: string;
}) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  let query = supabase
    .from("conversations")
    .select(`
      *,
      patients (id, first_name, last_name, email, phone),
      leads (id, first_name, last_name, email, phone),
      appointments (id, start_time, end_time, status, treatment_type)
    `)
    .eq("clinic_id", ctx.clinicId)
    .order("last_message_at", { ascending: false });

  if (filters?.channel && filters.channel !== "all") {
    query = query.eq("channel", filters.channel);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  const { data: conversations, error } = await query;

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  if (!conversations || conversations.length === 0) {
    return [];
  }

  // Fetch last message for each conversation
  const conversationIds = conversations.map((c) => c.id);
  const { data: lastMessages } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  // Map last message to each conversation
  const lastMessageMap = new Map();
  if (lastMessages) {
    for (const msg of lastMessages) {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg);
      }
    }
  }

  let result = conversations.map((c) => ({
    ...c,
    last_message: lastMessageMap.get(c.id) || null,
  }));

  // Client-side search filtering if query present
  if (filters?.search && filters.search.trim() !== "") {
    const s = filters.search.toLowerCase().trim();
    result = result.filter((c) => {
      const patientName = `${c.patients?.first_name || ""} ${c.patients?.last_name || ""}`.toLowerCase();
      const leadName = `${c.leads?.first_name || ""} ${c.leads?.last_name || ""}`.toLowerCase();
      const subject = (c.subject || "").toLowerCase();
      const lastMsgContent = (c.last_message?.content || "").toLowerCase();

      return (
        patientName.includes(s) ||
        leadName.includes(s) ||
        subject.includes(s) ||
        lastMsgContent.includes(s)
      );
    });
  }

  return result;
}

export async function getConversationDetails(conversationId: string) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select(`
      *,
      patients (id, first_name, last_name, email, phone),
      leads (id, first_name, last_name, email, phone),
      appointments (id, start_time, end_time, status, treatment_type)
    `)
    .eq("id", conversationId)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (convError || !conversation) {
    console.error("Error fetching conversation details:", convError);
    return null;
  }

  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select(`
      *,
      profiles (full_name, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .eq("clinic_id", ctx.clinicId)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("Error fetching conversation messages:", msgError);
  }

  return {
    ...conversation,
    messages: messages || [],
  };
}

export async function createConversation(input: {
  patient_id?: string;
  lead_id?: string;
  appointment_id?: string;
  channel?: ConversationChannel;
  subject?: string;
  initial_message: string;
}) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  if (!input.initial_message || input.initial_message.trim() === "") {
    return { success: false, error: "Initial message content is required." };
  }

  // Create conversation record
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      clinic_id: ctx.clinicId,
      patient_id: input.patient_id || null,
      lead_id: input.lead_id || null,
      appointment_id: input.appointment_id || null,
      channel: input.channel || "internal",
      status: "open",
      subject: input.subject || null,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    })
    .select()
    .single();

  if (convError || !conversation) {
    console.error("Error creating conversation:", convError);
    return { success: false, error: "Failed to create conversation." };
  }

  // Create initial message
  const { error: msgError } = await supabase.from("messages").insert({
    clinic_id: ctx.clinicId,
    conversation_id: conversation.id,
    sender_type: "staff",
    sender_id: ctx.user.id,
    direction: "outbound",
    content: input.initial_message.trim(),
    status: "sent",
    metadata: {},
    is_read: true,
  });

  if (msgError) {
    console.error("Error creating initial message:", msgError);
    return { success: false, error: "Failed to send initial message." };
  }

  // Log timeline activity if associated with a patient
  if (input.patient_id) {
    await supabase.from("activities").insert({
      clinic_id: ctx.clinicId,
      patient_id: input.patient_id,
      type: "communication",
      title: `Started conversation (${input.channel || "internal"})`,
      content: input.initial_message.trim().substring(0, 100),
      performed_by: ctx.user.id,
    });
  }

  revalidatePath("/conversations");
  if (input.patient_id) {
    revalidatePath(`/patients/${input.patient_id}`);
  }

  return { success: true, conversationId: conversation.id };
}

export async function sendMessage(input: {
  conversationId: string;
  content: string;
  direction?: MessageDirection;
  senderType?: MessageSenderType;
  metadata?: Record<string, unknown>;
  isInternalNote?: boolean;
}) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  if (!input.content || input.content.trim() === "") {
    return { success: false, error: "Message content cannot be empty." };
  }

  // Fetch conversation to verify clinic ownership and get patient_id
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, patient_id, clinic_id")
    .eq("id", input.conversationId)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (convError || !conversation) {
    return { success: false, error: "Conversation not found or unauthorized." };
  }

  const senderType = input.senderType || "staff";
  const direction = input.direction || "outbound";
  const now = new Date().toISOString();

  // Create message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      clinic_id: ctx.clinicId,
      conversation_id: conversation.id,
      sender_type: senderType,
      sender_id: senderType === "staff" ? ctx.user.id : null,
      direction: direction,
      content: input.content.trim(),
      status: "sent",
      metadata: {
        ...(input.metadata || {}),
        is_internal_note: !!input.isInternalNote,
      },
      is_read: direction === "outbound",
    })
    .select()
    .single();

  if (msgError || !message) {
    console.error("Error inserting message:", msgError);
    return { success: false, error: "Failed to send message." };
  }

  // Update conversation last_message_at and unread_count if inbound
  await supabase
    .from("conversations")
    .update({
      last_message_at: now,
      updated_at: now,
    })
    .eq("id", conversation.id);

  // Log activity if patient linked
  if (conversation.patient_id) {
    await supabase.from("activities").insert({
      clinic_id: ctx.clinicId,
      patient_id: conversation.patient_id,
      type: "communication",
      title: input.isInternalNote ? "Added internal note" : "Sent message",
      content: input.content.trim().substring(0, 100),
      performed_by: ctx.user.id,
    });
  }

  revalidatePath("/conversations");
  revalidatePath(`/conversations/${conversation.id}`);
  if (conversation.patient_id) {
    revalidatePath(`/patients/${conversation.patient_id}`);
  }

  return { success: true, message };
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus
) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("conversations")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    console.error("Error updating conversation status:", error);
    return { success: false, error: "Failed to update status." };
  }

  revalidatePath("/conversations");
  return { success: true };
}

export async function markConversationAsRead(conversationId: string) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("clinic_id", ctx.clinicId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    return { success: false };
  }

  revalidatePath("/conversations");
  return { success: true };
}
