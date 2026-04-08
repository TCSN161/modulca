"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import StepNav from "@/features/design/components/shared/StepNav";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "What are the minimum room sizes for a 2-bedroom home?",
  "What is the ideal kitchen work triangle?",
  "How many modules do I need for a family of 4?",
  "What are the Romanian building permit requirements?",
  "Explain optimal solar orientation for living spaces",
  "What clearances are needed around a dining table?",
];

export default function ConsultantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages([...updated, {
          role: "assistant",
          content: err.error || "Sorry, I'm temporarily unavailable. Please try again.",
        }]);
        return;
      }

      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [messages, loading]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-teal-800">
            Modul<span className="text-brand-amber-500">CA</span>
          </span>
        </Link>
        <StepNav activeStep={8} />
        <Link
          href="/project/demo/technical"
          className="shrink-0 rounded-lg bg-brand-olive-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-olive-800 transition-colors"
        >
          Back to Technical
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — Knowledge Base Info */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-5">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-brand-olive-100 flex items-center justify-center text-lg">
                📐
              </div>
              <h2 className="text-sm font-bold text-brand-charcoal">AI Architect</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Powered by Neufert&apos;s Architects&apos; Data — the definitive reference for
              architectural planning standards, adapted for modular construction.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Knowledge Base
            </h3>
            <div className="space-y-2">
              {[
                { icon: "📏", label: "Space Planning", desc: "Room dimensions, clearances" },
                { icon: "🪑", label: "Furniture Layout", desc: "Ergonomic spacing standards" },
                { icon: "🏗️", label: "Modular System", desc: "3×3m module specifications" },
                { icon: "🇷🇴", label: "Romanian Regulations", desc: "Building permits, CU, setbacks" },
                { icon: "🌿", label: "Sustainability", desc: "CLT, passive design, orientation" },
              ].map((kb) => (
                <div key={kb.label} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                  <span className="text-sm flex-shrink-0">{kb.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-brand-charcoal">{kb.label}</div>
                    <div className="text-[10px] text-gray-400">{kb.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Quick Questions
            </h3>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left rounded-lg border border-gray-100 bg-white px-3 py-2 text-[11px] text-gray-600 hover:border-brand-olive-300 hover:bg-brand-olive-50 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] text-amber-700 leading-relaxed">
              <strong>Note:</strong> This AI provides general architectural guidance based on
              Neufert standards. Always verify with a licensed architect for your specific project.
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">📐</div>
                <h2 className="text-xl font-bold text-brand-charcoal mb-2">
                  Neufert AI Architect
                </h2>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  Ask me anything about architectural planning, room dimensions,
                  furniture layout, or modular home design. I&apos;m here to help you
                  make informed decisions based on professional standards.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-lg">
                  {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 hover:border-brand-olive-400 hover:bg-brand-olive-50 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-olive-700 text-white"
                        : "bg-white border border-gray-200 text-brand-charcoal shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-brand-olive-600 uppercase tracking-wider">
                        📐 Neufert AI
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-brand-olive-600 uppercase tracking-wider">
                      📐 Neufert AI
                    </div>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-3xl mx-auto flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about room dimensions, layout advice, building regulations..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-olive-500 focus:outline-none focus:ring-1 focus:ring-brand-olive-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-xl bg-brand-olive-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-olive-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <p className="max-w-3xl mx-auto mt-2 text-[10px] text-gray-400 text-center">
              Based on Neufert&apos;s Architects&apos; Data. Press Enter to send, Shift+Enter for new line.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
