import type { Metadata } from 'next';
import { ChatInterface } from '@/components/ai/chat-interface';

export const metadata: Metadata = { title: 'AI Chat' };

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <ChatInterface />
    </div>
  );
}
