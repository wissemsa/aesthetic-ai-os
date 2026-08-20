"use client";

import { MessageSquare, Phone, Mail, MessageCircle, Radio } from "lucide-react";
import { ConversationChannel, ConversationStatus } from "@/types/communications";

export function ChannelBadge({ channel }: { channel: ConversationChannel }) {
  switch (channel) {
    case "sms":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <MessageSquare className="h-3 w-3" /> SMS
        </span>
      );
    case "email":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Mail className="h-3 w-3" /> Email
        </span>
      );
    case "whatsapp":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <MessageCircle className="h-3 w-3" /> WhatsApp
        </span>
      );
    case "phone":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-300 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
          <Phone className="h-3 w-3" /> Phone
        </span>
      );
    case "internal":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          <Radio className="h-3 w-3" /> Internal
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: ConversationStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Open
        </span>
      );
    case "escalated":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Escalated
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
          Closed
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-500">
          Archived
        </span>
      );
  }
}
