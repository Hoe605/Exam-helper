import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Badge } from "@/components/ui/badge";

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
    options: [] as string[],
    tags: [] as string[],
    remains: content
  };

  // 提取 question
  const questionMatch = content.match(/<question>([\s\S]*?)<\/question>/);
  if (questionMatch) {
    result.question = questionMatch[1].trim();
    result.remains = result.remains.replace(questionMatch[0], '');
  }

  // 提取 options
  const optionMatches = content.matchAll(/<option>([\s\S]*?)<\/option>/g);
  for (const match of optionMatches) {
    let opt = match[1].trim();
    // 过滤掉自带的 A. B. C. D. 前缀以防双重编号
    opt = opt.replace(/^[A-Za-z]\.\s*/, '');
    result.options.push(opt);
    result.remains = result.remains.replace(match[0], '');
  }


  // 提取 tags
  const tagMatch = content.match(/<tag>([\s\S]*?)<\/tag>/);
  if (tagMatch) {
    result.tags = tagMatch[1].split(/,\s*|，\s*/).map(t => t.trim()).filter(Boolean);
    result.remains = result.remains.replace(tagMatch[0], '');
  }

  result.remains = result.remains.trim();
  return result;
}

export default function SmartContent({ content, className = "" }: SmartContentProps) {
  const parsed = parseSmartTags(content);
  const hasTags = parsed.question || parsed.options.length > 0 || parsed.tags.length > 0;

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

