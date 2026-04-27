'use client';

import type { Message } from 'ai';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (!message.content && !message.toolInvocations?.length) return null;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isUser ? 'bg-gray-900 text-white' : 'bg-brand-100 text-brand-600'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-gray-900 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm'
        }`}
      >
        {/* Tool calls indicator */}
        {message.toolInvocations && message.toolInvocations.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolInvocations.map((inv) => (
              <ToolCallBadge key={inv.toolCallId} invocation={inv} />
            ))}
          </div>
        )}

        <div className="whitespace-pre-wrap leading-relaxed">{message.content as string}</div>
      </div>
    </div>
  );
}

function ToolCallBadge({ invocation }: { invocation: NonNullable<Message['toolInvocations']>[number] }) {
  const labels: Record<string, string> = {
    searchNotes: 'Searching notes',
    listNotes: 'Listing notes',
    saveNote: 'Saving note',
    updateNote: 'Updating note',
    deleteNote: 'Deleting note',
  };

  const isDone = invocation.state === 'result';
  const label = labels[invocation.toolName] ?? invocation.toolName;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-1">
      {isDone ? (
        <span className="text-green-500">✓</span>
      ) : (
        <span className="w-3 h-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
      )}
      {label}
    </div>
  );
}
