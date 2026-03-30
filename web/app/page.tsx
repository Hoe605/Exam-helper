import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  FileText, 
  Zap,
  Globe,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">ExamHelper</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              功能特性
            </Link>
            <Link href="#solutions" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              解决方案
            </Link>
            <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
              常见问题
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/board" className="hidden sm:block">
              <Button variant="ghost" className="text-sm font-medium">登录</Button>
            </Link>
            <Link href="/board">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5">
                立即开始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e0e7ff_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#09090b_40%,#1e1b4b_100%)]"></div>
          
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 px-4 py-1 rounded-full animate-bounce">
              ✨ 下一代 AI 助考助手已上线
            </Badge>
            
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl md:text-7xl">
              让考试准备变得 <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">
                从未如此轻松
              </span>
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
              ExamHelper 结合前沿 AI 技术，为您提供智能试题解析、考纲提取与备考建议，助您从容应对各类复杂考试。
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/board">
                <Button size="lg" className="h-14 rounded-full bg-indigo-600 px-8 text-lg font-semibold hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                  免费试用
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-lg font-semibold dark:border-zinc-800 dark:hover:bg-zinc-900">
                查看演示视频
              </Button>
            </div>
            
            {/* Mock Dashboard Preview */}
            <div className="mt-20 flex justify-center px-4 md:px-0">
               <div className="relative w-full max-w-5xl rounded-2xl border border-zinc-200 bg-zinc-100/50 p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-indigo-500/20 blur-3xl"></div>
                  <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-violet-500/20 blur-3xl"></div>
                  <div className="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    <div className="flex h-10 items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                       <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                          <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                       </div>
                       <div className="h-5 w-1/3 rounded-md bg-zinc-100 dark:bg-zinc-800"></div>
                       <div className="w-8"></div>
                    </div>
                    <div className="grid grid-cols-12 gap-4 p-6 sm:p-8">
                       <div className="col-span-12 sm:col-span-3">
                          <div className="space-y-4">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="h-8 rounded-md bg-zinc-100 dark:bg-zinc-900"></div>
                             ))}
                          </div>
                       </div>
                       <div className="col-span-12 sm:col-span-9">
                          <div className="h-64 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center">
                             <LayoutDashboard className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">核心功能</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">我们将复杂的备考流程简化为几个智能步骤</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "智能考纲提取", 
                  desc: "一键上传历年真题，AI 自动为您梳理考点、题型分布及难度权重。", 
                  icon: BrainCircuit,
                  color: "text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400"
                },
                { 
                  title: "深度解析引擎", 
                  desc: "不仅仅是答案，我们提供详细的解题思路、相关知识点串联及易错预警。", 
                  icon: FileText,
                  color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400"
                },
                { 
                  title: "个性化备考计划", 
                  desc: "根据您的弱项和考试倒计时，量身定制最高效的复习路径和刷题方案。", 
                  icon: Zap,
                  color: "text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400"
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
                  <CardHeader>
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{feature.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl mb-6">更安全、更准确的 AI 服务</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                  我们深知考试的严肃性，因此 ExamHelper 采用了多重模型验证机制，确保每一个知识点的准确传递。
                </p>
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "工业级数据脱敏，保护隐私安全" },
                    { icon: CheckCircle2, text: "多模型交叉比对，准确率提升 40%" },
                    { icon: Globe, text: "支持全球主流考试系统 (考公、考证、语言类)" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="aspect-square rounded-3xl bg-indigo-600 flex items-center justify-center overflow-hidden">
                   {/* Abstract background for "Security/Accuracy" */}
                   <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_center,#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                   <ShieldCheck className="h-40 w-40 text-white animate-pulse" />
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-3xl bg-zinc-900 border-4 border-white dark:border-zinc-950 p-6 flex flex-col justify-end">
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">准度保障</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl mb-12">常见问题</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "ExamHelper 支持哪些类型的考试？", a: "我们目前已覆盖公务员考试、各类执业资格证、托福/雅思等语言考试以及大部分高等院校专业课程。" },
                { q: "它是如何做到高准确率的？", a: "我们采用了 RAG (检索增强生成) 技术，结合行业资深教研人员审核的知识库，对 AI 输出进行实时纠偏。" },
                { q: "我的试题数据会被泄露吗？", a: "绝不。我们遵循最为严格的数据加密标准，所有用户上传的数据均为高度离散化存储，仅供为您个人生成备考报告使用。" },
                { q: "是否有移动端版本？", a: "目前提供 H5 适配版以及微信小程序版，通过手机也能随时随地查看您的刷题周报。" }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-zinc-600 dark:text-zinc-400">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-4">
          <div className="rounded-3xl bg-indigo-600 px-8 py-16 text-center text-white shadow-2xl overflow-hidden relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl"></div>
            
            <h2 className="text-4xl font-bold mb-6">开启您的智慧备考之旅</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
              立即加入上万名备考者的行列，用 AI 赋能学习，事半功倍。
            </p>
            <Link href="/board">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100 rounded-full h-14 px-8 text-lg font-bold">
                免费创建账号
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold">ExamHelper</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 ExamHelper Inc. 保留所有权利。
          </p>
          <div className="flex gap-6">
            {["Twitter", "GitHub", "Discord"].map(social => (
              <a key={social} href="#" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
