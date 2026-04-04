'use client';

import { useState, useEffect, useRef } from 'react';

interface LazyRenderProps {
  children: React.ReactNode;
  estimatedHeight?: number;
  rootMargin?: string;
  className?: string;
}

/**
 * 延迟渲染组件
 * 只有当组件快要进入视口时才渲染实际内容，以提升大列表性能
 */
export function LazyRender({ 
    children, 
    estimatedHeight = 320, 
    rootMargin = '600px',
    className = ""
}: LazyRenderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用变量保存当前 ref，确保清理函数使用的是同一个元素
    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // 一旦可见就停止观察（除非需要实现真正的虚拟列表，滚动出去后再卸载）
          // 对于题目列表，初次渲染通常是最消耗性能的，保持渲染状态可以避免滑动时的闪烁
          observer.unobserve(currentRef);
        }
      },
      {
        rootMargin,
        threshold: 0.01
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div 
        ref={containerRef} 
        className={className}
        style={{ 
            minHeight: isVisible ? undefined : `${estimatedHeight}px` 
        }}
    >
      {isVisible ? children : (
        <div 
          className="w-full bg-white/50 animate-pulse rounded-[40px] border border-[#EDEEEF]/50 flex flex-col gap-6 p-10"
          style={{ height: `${estimatedHeight}px` }}
        >
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-slate-100 rounded-lg" />
            <div className="flex gap-2">
               <div className="h-10 w-10 bg-slate-100 rounded-xl" />
               <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
          <div className="h-8 w-2/3 bg-slate-100 rounded-xl" />
          <div className="space-y-3 pt-4">
            <div className="h-12 w-full bg-slate-50/50 rounded-2xl" />
            <div className="h-12 w-full bg-slate-50/50 rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
