"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * The `activeTab === "preview"` branch. It renders the draft the way the public
 * post page will, which is the whole point of the tab — the component map here has
 * to stay in step with that page or the preview lies about the result.
 */
export function PostPreview({ title, content }: { title: string; content: string }) {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-4xl font-bold text-[#181A2A] mb-6">{title}</h1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-4xl font-bold text-[#181A2A] mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-3xl font-bold text-[#181A2A] mt-8 mb-4 pb-2 border-b-2 border-gray-200">{children}</h2>,
          h3: ({ children }) => <h3 className="text-2xl font-bold text-[#181A2A] mt-6 mb-3">{children}</h3>,
          p: ({ children }) => <p className="text-xl text-[#3B3C4A] mb-6 leading-relaxed">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="bg-[#F6F6F7] border-l-4 border-[#1E88E5] p-6 my-8 rounded-r-lg">
              <div className="text-[#181A2A] text-xl italic">{children}</div>
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside text-xl text-[#3B3C4A] mb-6 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-xl text-[#3B3C4A] mb-6 space-y-2">{children}</ol>,
          hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-full border-collapse bg-white text-left text-base">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-100 text-slate-900">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-slate-200">{children}</tbody>,
          tr: ({ children }) => <tr className="divide-x divide-slate-200">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 align-top text-[#3B3C4A]">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>  );
}
