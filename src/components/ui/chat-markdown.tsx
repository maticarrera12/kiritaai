"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { cn } from "@/lib/utils";

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

// Componente de bloque de código con syntax highlighting
const CodeBlock = memo(function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-border/50">
      {/* Header del bloque de código */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <span className="text-xs font-mono text-neutral-400 uppercase">{language || "code"}</span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-neutral-700"
        >
          Copiar
        </button>
      </div>
      {/* Código con syntax highlighting */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#1e1e1e",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
        }}
        showLineNumbers={children.split("\n").length > 3}
        wrapLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
});

// Componente inline code
const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <code className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-[0.8125rem]">
    {children}
  </code>
);

export const ChatMarkdown = memo(function ChatMarkdown({ content, className }: ChatMarkdownProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          // Bloques de código
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            // Si tiene lenguaje especificado o es multilínea, renderizar como bloque
            if (match || codeString.includes("\n")) {
              return <CodeBlock language={match?.[1] || "text"}>{codeString}</CodeBlock>;
            }

            // Código inline
            return <InlineCode {...props}>{children}</InlineCode>;
          },
          // Pre - ya manejado por code
          pre({ children }) {
            return <>{children}</>;
          },
          // Párrafos
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          // Listas
          ul({ children }) {
            return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          // Headers
          h1({ children }) {
            return <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>;
          },
          // Strong/Bold
          strong({ children }) {
            return <strong className="font-semibold text-foreground">{children}</strong>;
          },
          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-primary/50 pl-3 my-2 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
