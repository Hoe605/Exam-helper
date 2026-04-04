import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";



interface SmartContentProps {
  content: string;
  className?: string;
}

/**
 * 智能内容解析器
 * 解析 <question>, <option>, <tag> 等 XML 式标签
 */
function parseSmartTags(content: string) {
  const result = {
    question: '',
    thinking: '',
    options: [] as string[],
    tags: [] as string[],
    remains: content
  };

  // 辅助函数：安全、低内存提取 XML 块
  const extractBlock = (tagName: string) => {
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;

    const startIndex = result.remains.indexOf(startTag);
    if (startIndex === -1) return '';

    const contentStart = startIndex + startTag.length;
    let endIndex = result.remains.indexOf(endTag, contentStart);

    let blockContent = '';
    let removeEnd = 0;

    if (endIndex !== -1) {
      blockContent = result.remains.substring(contentStart, endIndex).trim();
      removeEnd = endIndex + endTag.length;
    } else {
      // 未闭合，匹配到结尾
      blockContent = result.remains.substring(contentStart).trim();
      removeEnd = result.remains.length;
    }

    // 从 remains 中删除该块
    result.remains = result.remains.substring(0, startIndex) + result.remains.substring(removeEnd);
    return blockContent;
  };

  // 1. 提取 thinking 和 question (支持未闭合)
  result.thinking = extractBlock('thinking');
  result.question = extractBlock('question');

  // 2. 提取 options (循环提取多个闭合的 option)
  while (true) {
    const optStart = result.remains.indexOf('<option>');
    if (optStart === -1) break;
    const optEnd = result.remains.indexOf('</option>', optStart);
    if (optEnd === -1) break; // 仅处理闭合的选项

    let opt = result.remains.substring(optStart + 8, optEnd).trim();
    opt = opt.replace(/^[A-Za-z]\.\s*/, '');
    result.options.push(opt);

    result.remains = result.remains.substring(0, optStart) + result.remains.substring(optEnd + 9);
  }

  // 3. 提取 tags
  const tagsText = extractBlock('tag');
  if (tagsText) {
    result.tags = tagsText.split(/,\s*|，\s*/).map(t => t.trim()).filter(Boolean);
  }

  result.remains = result.remains.trim();
  return result;
}

export default function SmartContent({ content, className = "" }: SmartContentProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const parsed = parseSmartTags(content);
  const hasTags = !!(parsed.question || parsed.thinking || parsed.options.length > 0 || parsed.tags.length > 0);



  if (!hasTags) {
    return (
      <div className={`smart-content prose prose-slate max-w-none dark:prose-invert ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-8 ${className} smart-content`}>
      {/* Reasoning (Thinking) */}
      {parsed.thinking && (
        <div className="bg-indigo-50/40 rounded-[30px] p-6 border border-indigo-100/30 transition-all duration-300">
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2 text-indigo-600/60 font-black text-[10px] uppercase tracking-[0.2em]">
              <Brain className="w-4 h-4" />
              Reasoning Logic
            </div>
            <div className="flex items-center gap-1 text-indigo-600/40 group-hover:text-indigo-600/60 transition-colors">
              <span className="text-[9px] font-bold uppercase tracking-wider">{isCollapsed ? '展开' : '收起'}</span>
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </div>
          </div>

          {!isCollapsed && (
            <div className="prose prose-indigo prose-xs mt-4 text-indigo-900/40 font-medium text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {parsed.thinking}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}


      {/* Question Text */}

      {parsed.question && (
        <div className="text-2xl font-bold leading-relaxed text-[#000666]">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {parsed.question}
          </ReactMarkdown>
        </div>
      )}

      {/* Options Grid */}
      {parsed.options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parsed.options.map((opt, idx) => (
            <div key={idx} className="bg-white rounded-[24px] p-6 border border-[#EDEEEF] hover:border-indigo-500/20 shadow-sm transition-all flex items-center gap-4">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shrink-0 uppercase">
                {String.fromCharCode(65 + idx)}
              </span>
              <div className="font-bold text-[#1A237E] flex-1">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {opt}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Meta Tags */}
      {parsed.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 opacity-60">
          {parsed.tags.map((t, idx) => (
            <Badge key={idx} variant="outline" className="bg-[#F8F9FA] px-3 py-1 rounded-lg border-[#EDEEEF] text-[#767683] font-bold text-[10px] uppercase tracking-widest">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* Remaining content or Fallback */}
      {parsed.remains && (
        <div className="prose prose-slate max-w-none dark:prose-invert mt-4 border-t border-dashed border-[#EDEEEF] pt-6">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {parsed.remains}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

