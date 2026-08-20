import {
  getConversations,
  getConversationDetails,
} from "./actions";
import { CommunicationsHub } from "@/components/communications/communications-hub";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const conversations = await getConversations();
  const selectedConversation = id
    ? await getConversationDetails(id)
    : conversations.length > 0
    ? await getConversationDetails(conversations[0].id)
    : null;

  return (
    <div className="space-y-6">
      <CommunicationsHub
        conversations={conversations}
        selectedConversation={selectedConversation}
      />
    </div>
  );
}
