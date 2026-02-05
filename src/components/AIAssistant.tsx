"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  appContext: Record<string, unknown>;
}

const QUICK_PROMPTS = [
  "Which property is the best deal right now?",
  "Show me RV-friendly land under $10k",
  "Explain tax deed vs sheriff sale",
  "How does the NACA program work?",
  "What are the risks of flood zone properties?",
];

export default function AIAssistant({ appContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm Scout, your LandScout AI assistant. I can see all the properties and data in the app right now. Ask me anything — which property is the best deal, how auctions work, what zoning codes mean, or help with your NACA loan calculation. What can I help you with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build messages for the API (exclude the welcome message)
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          appContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) {
        setHasNewMessage(true);
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Something went wrong";
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I ran into an issue: ${errMsg}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewMessage(false);
          }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)] hover:scale-110 transition-all cursor-pointer border-none group"
        >
          <Sparkles
            size={24}
            className="text-white group-hover:rotate-12 transition-transform"
          />
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#0b1120] border border-blue-500/30 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-300 ${
            isExpanded
              ? "bottom-0 right-0 w-full h-full rounded-none sm:bottom-6 sm:right-6 sm:w-[600px] sm:h-[700px] sm:rounded-2xl"
              : "bottom-6 right-6 w-[380px] h-[560px] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/20 bg-[rgba(15,23,42,0.9)] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Scout AI
                </h3>
                <p className="text-[0.65rem] text-emerald-400">
                  Online — reading app data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-7 rounded-md bg-transparent border-none text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 cursor-pointer flex items-center justify-center transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 size={14} />
                ) : (
                  <Maximize2 size={14} />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-md bg-transparent border-none text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      : "bg-slate-700"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={14} className="text-blue-400" />
                  ) : (
                    <User size={14} className="text-slate-300" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-[rgba(30,41,59,0.6)] text-slate-200 rounded-tl-sm"
                      : "bg-blue-600/30 text-blue-100 rounded-tr-sm"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 shrink-0">
                  <Bot size={14} className="text-blue-400" />
                </div>
                <div className="bg-[rgba(30,41,59,0.6)] px-4 py-3 rounded-xl rounded-tl-sm">
                  <Loader2
                    size={16}
                    className="text-blue-400 animate-spin"
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[0.65rem] text-slate-500 uppercase tracking-wider mb-2">
                Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-1.5 bg-[rgba(30,41,59,0.6)] border border-blue-500/15 rounded-lg text-[0.7rem] text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 cursor-pointer transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-blue-500/20 bg-[rgba(15,23,42,0.9)] rounded-b-2xl shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Scout anything about these properties..."
              disabled={isLoading}
              className="flex-1 py-2.5 px-3.5 bg-[rgba(30,41,59,0.8)] border border-blue-500/20 rounded-xl text-sm text-slate-200 font-sans transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] placeholder:text-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all hover:shadow-[0_2px_12px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
