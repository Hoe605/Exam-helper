'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface SmartContentProps {
  content: string;
  className?: string;
}

/**
 * 智能内容渲染组件
 * 支持 Markdown, LaTeX (remark-math + rehype-katex), KaTeX 样式
 */
export default function SmartContent({ content, className = "" }: SmartContentProps) {
  return (
    <div className={`smart-content prose prose-slate max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 优化段落间距
          p: ({ children }) => <p className="leading-relaxed my-0">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
      
      <style jsx global>{`
        .smart-content .katex-display {
          margin: 1.5em 0;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.5em 0;
        }
        .smart-content .katex {
          font-size: 1.1em;
        }
      `}</style>
    </div>
  );
}
