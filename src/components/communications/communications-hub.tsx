"use client";

import { useState } from "react";
import {
  ConversationWithDetails,
  ConversationChannel,
  ConversationStatus,
} from "@/types/communications";
import { ChannelBadge, StatusBadge } from "./channel-badge";
import { MessageTimeline } from "./message-timeline";
import { NewConversationModal } from "./new-conversation-modal";
import {
  updateConversationStatus,
  markConversationAsRead,
} from "@/app/(dashboard)/conversations/actions";
import {
  Search,
  MessageSquare,
  Calendar,
} from "lucide-react";

export function CommunicationsHub({
  conversations,
  selectedConversation,
}: {
  conversations: ConversationWithDetails[];
  selectedConversation: ConversationWithDetails | null;
}) {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<
    ConversationChannel | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<
    ConversationStatus | "all"
  >("open");

  // Client side filtering
  const filteredConversations = conversations.filter((c) => {
    if (selectedChannel !== "all" && c.channel !== selectedChannel) return false;
    if (selectedStatus !== "all" && c.status !== selectedStatus) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const patientName = `${c.patients?.first_name || ""} ${
        c.patients?.last_name || ""
      }`.toLowerCase();
      const leadName = `${c.leads?.first_name || ""} ${
        c.leads?.last_name || ""
      }`.toLowerCase();
      const subject = (c.subject || "").toLowerCase();
      const lastMsg = (c.last_message?.content || "").toLowerCase();

      return (
        patientName.includes(q) ||
        leadName.includes(q) ||
        subject.includes(q) ||
        lastMsg.includes(q)
      );
    }

    return true;
  });

  const handleStatusChange = async (
    conversationId: string,
    status: ConversationStatus
  ) => {
    await updateConversationStatus(conversationId, status);
  };

  const handleSelectConversation = async (c: ConversationWithDetails) => {
    if (c.unread_count > 0) {
      await markConversationAsRead(c.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 md:w-96 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
        {/* Header & New Button */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Conversations
            </h1>
            <NewConversationModal />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10"
            />
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                "all",
                "internal",
                "sms",
                "email",
                "whatsapp",
                "phone",
              ] as (ConversationChannel | "all")[]
            ).map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition shrink-0 ${
                  selectedChannel === ch
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
            {(["open", "escalated", "closed", "all"] as (
              | ConversationStatus
              | "all"
            )[]).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`capitalize font-medium transition px-2 py-1 rounded-md ${
                  selectedStatus === st
                    ? "text-zinc-900 font-semibold border-b-2 border-zinc-900 dark:text-zinc-50 dark:border-zinc-50"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedConversation?.id === c.id;
              const contactName = c.patients
                ? `${c.patients.first_name} ${c.patients.last_name}`
                : c.leads
                ? `${c.leads.first_name} ${c.leads.last_name}`
                : "Internal Note / Guest";

              return (
                <a
                  key={c.id}
                  href={`/conversations?id=${c.id}`}
                  onClick={() => handleSelectConversation(c)}
                  className={`flex flex-col p-3.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                    isSelected
                      ? "bg-zinc-100/80 dark:bg-zinc-800/80"
                      : "bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[170px]">
                      {contactName}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(c.last_message_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {c.subject && (
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate mb-1">
                      {c.subject}
                    </p>
                  )}

                  <p className="text-xs text-zinc-500 line-clamp-1 mb-2">
                    {c.last_message?.content || "No messages yet"}
                  </p>

                  <div className="flex items-center justify-between">
                    <ChannelBadge channel={c.channel} />
                    <StatusBadge status={c.status} />
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area - Conversation Workspace */}
      <div className="flex-1 flex flex-col bg-zinc-50/30 dark:bg-zinc-950/30">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                  {selectedConversation.patients?.first_name?.[0] || "C"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedConversation.patients
                        ? `${selectedConversation.patients.first_name} ${selectedConversation.patients.last_name}`
                        : "Internal Thread"}
                    </h2>
                    <ChannelBadge channel={selectedConversation.channel} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    {selectedConversation.patients?.email && (
                      <span>{selectedConversation.patients.email}</span>
                    )}
                    {selectedConversation.patients?.phone && (
                      <span>{selectedConversation.patients.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status Selector */}
              <div className="flex items-center gap-2">
                {selectedConversation.appointments && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Appt:{" "}
                      {new Date(
                        selectedConversation.appointments.start_time
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedConversation.id, "open")
                    }
                    title="Mark Open"
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      selectedConversation.status === "open"
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedConversation.id, "escalated")
                    }
                    title="Escalate to Human"
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      selectedConversation.status === "escalated"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedConversation.id, "closed")
                    }
                    title="Mark Closed"
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      selectedConversation.status === "closed"
                        ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Message Timeline */}
            <div className="flex-1 overflow-hidden">
              <MessageTimeline
                messages={selectedConversation.messages || []}
                conversationId={selectedConversation.id}
              />
            </div>
          </>
        ) : (
          /* Empty Workspace State */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-16 w-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Select a conversation
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1.5">
              Choose an existing thread from the left list or create a new
              conversation to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
