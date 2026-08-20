"use client";

import { useState } from "react";
import { createConversation } from "@/app/(dashboard)/conversations/actions";
import { Button } from "@/components/ui/button";
import { ConversationChannel } from "@/types/communications";
import {
  MessageSquare,
  Plus,
  X,
  Radio,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

export function NewConversationModal({
  patientId,
  patientName,
}: {
  patientId?: string;
  patientName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<ConversationChannel>("internal");
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialMessage.trim() || loading) return;

    setLoading(true);
    setError(null);

    const res = await createConversation({
      patient_id: patientId,
      channel,
      subject: subject.trim() || undefined,
      initial_message: initialMessage,
    });

    setLoading(false);

    if (res.success) {
      setOpen(false);
      setSubject("");
      setInitialMessage("");
    } else {
      setError(res.error || "Failed to create conversation.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" /> New Conversation
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    New Conversation
                  </h3>
                  {patientName && (
                    <p className="text-xs text-zinc-500">
                      With patient: {patientName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Channel
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "internal", label: "Internal", icon: Radio },
                    { id: "sms", label: "SMS", icon: MessageSquare },
                    { id: "email", label: "Email", icon: Mail },
                    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                    { id: "phone", label: "Phone", icon: Phone },
                  ].map((item) => {
                    const Icon = item.icon;
                    const selected = channel === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setChannel(item.id as ConversationChannel)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                          selected
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject / Title (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Post-treatment check-in"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10"
                />
              </div>

              {/* Initial Message */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Type message content here..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !initialMessage.trim()}>
                  {loading ? "Creating..." : "Start Conversation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
