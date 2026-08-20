"use client";

import { useState } from "react";
import { Message } from "@/types/communications";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/app/(dashboard)/conversations/actions";
import { Send, Lock, Sparkles, Bot, AlertCircle } from "lucide-react";

export function MessageTimeline({
  messages,
  conversationId,
}: {
  messages: Message[];
  conversationId: string;
}) {
  const [content, setContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError(null);

    const res = await sendMessage({
      conversationId,
      content,
      isInternalNote,
      senderType: "staff",
      direction: "outbound",
    });

    setLoading(false);

    if (res.success) {
      setContent("");
    } else {
      setError(res.error || "Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3">
              <Bot className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No messages yet
            </p>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Start the conversation by typing a message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isInternal = msg.metadata?.is_internal_note;
            const isOutbound = msg.direction === "outbound";
            const isAI = msg.sender_type === "ai";
            const isSystem = msg.sender_type === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isOutbound ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {isAI ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      <Sparkles className="h-3 w-3" /> AI Assistant
                    </span>
                  ) : isOutbound ? (
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {msg.profiles?.full_name || "Staff"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                      Patient / Contact
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isInternal
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                      : isAI
                      ? "bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
                      : isOutbound
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-none"
                      : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-none"
                  }`}
                >
                  {isInternal && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      <Lock className="h-3 w-3" /> Internal Note
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  !isInternalNote
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition ${
                  isInternalNote
                    ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Lock className="h-3 w-3" /> Internal Note
              </button>
            </div>
            <span className="text-[11px] text-zinc-400">
              {isInternalNote ? "Visible to clinic staff only" : "Sent to contact"}
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isInternalNote
                  ? "Write an internal note for staff..."
                  : "Type your message..."
              }
              className={`w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 dark:bg-zinc-950 resize-none ${
                isInternalNote
                  ? "border-amber-300 focus:ring-amber-500/20 dark:border-amber-800"
                  : "border-zinc-200 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:ring-zinc-100/10"
              }`}
            />
            <div className="absolute right-3 bottom-3">
              <Button
                type="submit"
                size="sm"
                disabled={loading || !content.trim()}
                className={
                  isInternalNote
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : ""
                }
              >
                <Send className="h-4 w-4 mr-1.5" />
                {loading ? "Sending..." : isInternalNote ? "Add Note" : "Send"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
