
"use client";

import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Loader2,
  RefreshCw,
  PanelLeftClose,
  X,
} from "lucide-react";


export default function ConversationSidebar({
  conversations,
  activeConversationId,
  loading,
  error,
  onNewChat,
  onSelect,
  onRefresh,
  onClose,
  drawer = false,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#060606]">
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
          Conversations
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh conversations"
            className="grid h-8 w-8 place-items-center rounded-md text-white/50 transition hover:bg-white/[0.06] hover:text-[#7cf9bd] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={drawer ? "Close conversations" : "Hide conversations"}
              title={drawer ? "Close" : "Hide sidebar"}
              className="grid h-8 w-8 place-items-center rounded-md text-white/50 transition hover:bg-white/[0.06] hover:text-white"
            >
              {drawer ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* the one and only "New chat" button */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#7cf9bd]/30 bg-[#7cf9bd]/10 px-4 py-2.5 text-sm font-medium text-[#7cf9bd] transition hover:bg-[#7cf9bd]/20"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* list */}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/[0.06] px-3 py-3">
        {loading && conversations.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#7cf9bd]" />
          </div>
        )}

        {error && <p className="px-3 py-3 text-xs text-red-400">{error}</p>}

        {!loading && !error && conversations.length === 0 && (
          <p className="px-3 py-5 text-center text-xs text-white/50">
            No conversations yet.
          </p>
        )}

        <div className="space-y-1">
          {conversations.map((conversation) => {
            const active = conversation.id === activeConversationId;

            return (
              <Link
                key={conversation.id}
                href={`/chat/${encodeURIComponent(conversation.id)}`}
                onClick={() => onSelect?.(conversation.id)}
                aria-current={active ? "page" : undefined}
                title={conversation.title || "New conversation"}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
                  active
                    ? "bg-[#7cf9bd]/10 text-[#7cf9bd]"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {conversation.title || "New conversation"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}