"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import StepNav from "@/features/design/components/shared/StepNav";
import { getLocalAnswer } from "../neufertKB";

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

const KB_TOPICS = [
  { icon: "📏", label: "Space Planning", desc: "Room dimensions, clearances" },
  { icon: "🪑", label: "Furniture Layout", desc: "Ergonomic spacing standards" },
  { icon: "🏗️", label: "Modular System", desc: "3×3m module specifications" },
  { icon: "🇷🇴", label: "Romanian Regulations", desc: "Building permits, CU, setbacks" },
  { icon: "🌿", label: "Sustainability", desc: "CLT, passive design, orientation" },
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

  const sendMessage = useCallback(
    async (text: string) => {
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
          const localReply = getLocalAnswer(text);
          setMessages([...updated, { role: "assistant", content: localReply }]);
          return;
        }

        const data = await res.json();
        setMessages([...updated, { role: "assistant", content: data.reply }]);
      } catch {
        const localReply = getLocalAnswer(text);
        setMessages([...updated, { role: "assistant", content: localReply }]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, loading],
  );

  return (
    <div className="flex h-screen flex-col bg-brand-bone-100">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-brand-bone-300/60 bg-white px-6 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-charcoal">
            Modul<span className="text-brand-olive-700">CA</span>
          </span>
        </Link>
        <StepNav activeStep={8} />
        <Link
          href="/project/demo/technical"
          className="shrink-0 rounded-[12px] bg-brand-olive-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-olive-800 transition-colors"
        >
          Back to Technical
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-shrink-0 flex-col border-r border-brand-bone-300/60 bg-white overflow-y-auto p-5">
          {/* AI Identity */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-[12px] bg-brand-olive-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-olive-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-charcoal">AI Architect</h2>
                <p className="text-[10px] text-brand-gray">Neufert Standards</p>
              </div>
            </div>
            <p className="text-xs text-brand-gray leading-relaxed">
              Powered by Neufert&apos;s Architects&apos; Data — the definitive reference for
              architectural planning standards, adapted for modular construction.
            </p>
          </div>

          {/* Knowledge Base */}
          <div className="mb-6">
            <h3 className="label-caps mb-3">Knowledge Base</h3>
            <div className="space-y-2">
              {KB_TOPICS.map((kb) => (
                <div
                  key={kb.label}
                  className="flex items-start gap-2.5 rounded-[12px] border border-brand-bone-300/60 bg-brand-bone-100 p-3 transition-colors hover:border-brand-olive-300"
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">{kb.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-brand-charcoal">{kb.label}</div>
                    <div className="text-[10px] text-brand-gray">{kb.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Questions */}
          <div className="flex-1">
            <h3 className="label-caps mb-3">Quick Questions</h3>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="w-full text-left rounded-[12px] border border-brand-bone-300/60 bg-white px-3 py-2.5 text-[11px] text-brand-gray hover:border-brand-olive-400 hover:bg-brand-olive-50 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 rounded-[12px] border border-brand-olive-200 bg-brand-olive-50 p-3">
            <p className="text-[10px] text-brand-olive-700 leading-relaxed">
              <strong>Note:</strong> This AI provides general architectural guidance based on
              Neufert standards. Always verify with a licensed architect for your specific project.
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="h-16 w-16 rounded-full bg-brand-olive-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-brand-olive-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-brand-charcoal mb-2 tracking-heading">
                  Neufert AI Architect
                </h2>
                <p className="text-sm text-brand-gray max-w-md mb-8">
                  Ask me anything about architectural planning, room dimensions,
                  furniture layout, or modular home design.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-[12px] border border-brand-bone-300 bg-white px-4 py-3.5 text-xs text-brand-gray hover:border-brand-olive-400 hover:bg-brand-olive-50 hover:text-brand-charcoal transition-all text-left shadow-card"
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
                    className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-olive-700 text-white shadow-subtle"
                        : "bg-white border border-brand-bone-300/60 text-brand-charcoal shadow-card"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-5 w-5 rounded-md bg-brand-olive-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-brand-olive-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-brand-olive-600 uppercase tracking-[0.05em]">
                          Neufert AI
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-bone-300/60 rounded-[16px] px-4 py-3 shadow-card">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="h-5 w-5 rounded-md bg-brand-olive-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-brand-olive-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-brand-olive-600 uppercase tracking-[0.05em]">
                        Neufert AI
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-olive-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-brand-olive-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-brand-olive-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Quick Actions (visible only on small screens) */}
          {messages.length === 0 && (
            <div className="md:hidden border-t border-brand-bone-300/60 bg-white p-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {KB_TOPICS.map((kb) => (
                  <button
                    key={kb.label}
                    onClick={() => sendMessage(`Tell me about ${kb.label.toLowerCase()}`)}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-brand-bone-300 bg-brand-bone-100 px-3 py-1.5 text-[11px] text-brand-gray hover:border-brand-olive-400 transition-colors"
                  >
                    <span className="text-xs">{kb.icon}</span>
                    {kb.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-brand-bone-300/60 bg-white p-3 md:p-4">
            <div className="max-w-3xl mx-auto flex gap-2 md:gap-3">
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
                className="flex-1 resize-none rounded-[12px] border border-brand-bone-300 px-4 py-3 text-sm bg-brand-bone-100 focus:bg-white focus:border-brand-olive-500 focus:outline-none focus:ring-1 focus:ring-brand-olive-500 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-[12px] bg-brand-olive-700 px-5 md:px-6 py-3 text-sm font-semibold text-white hover:bg-brand-olive-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="max-w-3xl mx-auto mt-2 text-[10px] text-brand-gray/60 text-center">
              Based on Neufert&apos;s Architects&apos; Data. Press Enter to send, Shift+Enter for new line.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
