"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Xls02Icon, SentIcon, Message01Icon, UserIcon, Loading03Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { sendMessageAction, getRemainingMessagesAction, getChatHistory } from "@/actions/chat";
import Logo from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  appName: string;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatSidebar({ isOpen, onClose, analysisId, appName }: ChatSidebarProps) {
  const t = useTranslations("chatSidebar");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMsgs, setRemainingMsgs] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Cargar Créditos
      getRemainingMessagesAction().then(setRemainingMsgs);

      // 2. Cargar Historial Real de la BD
      const loadHistory = async () => {
        setIsLoading(true); // Opcional: mostrar un mini spinner inicial
        try {
          const history = await getChatHistory(analysisId);

          if (history.length > 0) {
            setMessages(history as Message[]);
          } else {
            setMessages([
              {
                role: "assistant",
                content: t("greeting", { appName }),
              },
            ]);
          }
        } catch {
          // History load failed silently
        } finally {
          setIsLoading(false);
        }
      };

      loadHistory();
    }
  }, [isOpen, analysisId, appName, t]);
  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");

    // Optimistic Update
    const newHistory = [...messages, { role: "user", content: userMsg } as Message];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Llamada al Server Action
      const result = await sendMessageAction(userMsg, analysisId, newHistory);

      if (result.error === "LIMIT_REACHED") {
        toast.error(t("errors.limitReached"));
        return;
      }

      if (result.success && result.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
        setRemainingMsgs((prev) => (prev ? prev - 1 : 0));
      }
    } catch (error) {
      toast.error(t("errors.sendFailed"), { description: error as string });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-background border-l border-border shadow-2xl z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Logo className="w-9 h-9 rounded-full" />
                <div>
                  <h3 className="font-bold text-sm">{t("header.title")}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {t("header.context", { appName })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Xls02Icon size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/5 custom-scrollbar"
            >
              {remainingMsgs !== null && (
                <div className="flex justify-center mb-6">
                  <span className="text-[10px] font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">
                    {t("remaining", { count: remainingMsgs })}
                  </span>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                      msg.role === "assistant"
                        ? "bg-white dark:bg-neutral-800 border-border"
                        : "bg-primary text-white border-transparent"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Message01Icon size={14} className="text-primary" />
                    ) : (
                      <UserIcon size={14} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === "assistant"
                        ? "bg-white dark:bg-neutral-800 border border-border text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {/* Renderizamos Markdown básico simple (negritas) */}
                    <p
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[90%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-border flex items-center justify-center">
                    <Loading03Icon className="animate-spin w-4 h-4 text-primary" />
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 text-xs text-muted-foreground flex items-center">
                    {t("thinking")}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("placeholder")}
                  className="w-full pl-4 pr-12 py-3 rounded-full bg-muted/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <SentIcon size={18} />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[10px] text-muted-foreground">{t("disclaimer")}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
