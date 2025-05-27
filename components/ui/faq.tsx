'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "需要多长时间的音频样本来克隆我的声音？",
    answer: "我们的AI技术只需要3-10秒的清晰音频样本就能有效地克隆您的声音。为了获得最佳效果，建议提供高质量、无背景噪音的录音。"
  },
  {
    question: "生成的语音质量如何？",
    answer: "我们使用最先进的AI模型，能够生成接近真实人声的高质量音频。生成的语音保持了原始声音的音色、语调和语速特征。"
  },
  {
    question: "我的声音数据是否安全？",
    answer: "绝对安全。我们采用企业级加密技术保护您的数据，所有音频文件都经过加密存储，且仅用于您授权的用途。我们承诺不会将您的声音数据用于其他目的。"
  },
  {
    question: "支持哪些语言？",
    answer: "目前我们支持中文（普通话）、英语、日语、韩语等多种语言。我们的AI模型能够识别并保持原语言的语音特征。"
  },
  {
    question: "生成的音频可以用于商业用途吗？",
    answer: "是的，根据我们的服务条款，您可以将生成的音频用于个人和商业用途。但请确保遵守当地法律法规，并在必要时告知听众这是AI生成的内容。"
  },
  {
    question: "如何取消订阅？",
    answer: "您可以随时在账户设置中取消订阅。取消后，您仍可以使用服务直到当前计费周期结束，之后将自动转为免费计划。"
  },
  {
    question: "免费计划有什么限制？",
    answer: "免费计划每月可以生成最多5分钟的音频内容，支持基本的语音克隆功能。付费计划提供更多生成时长、高级功能和优先处理。"
  },
  {
    question: "生成失败了怎么办？",
    answer: "如果生成失败，请检查音频质量是否清晰、文本是否过长。您也可以联系我们的客服团队，我们会尽快帮助您解决问题。"
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          常见问题
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          为您解答使用AI语音克隆过程中的常见疑问
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="glass-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
            >
              <span className="font-medium text-foreground pr-4">
                {item.question}
              </span>
              {openItems.has(index) ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200" />
              )}
            </button>
            
            {openItems.has(index) && (
              <div className="px-6 pb-4 border-t border-border bg-muted/30">
                <p className="text-muted-foreground leading-relaxed pt-4">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-3">还有其他问题？</h3>
          <p className="text-muted-foreground mb-4">
            如果您有其他疑问，欢迎联系我们的客服团队
          </p>
          <a
            href="mailto:support@aivoice.com"
            className="btn-primary inline-flex items-center gap-2"
          >
            联系客服
          </a>
        </div>
      </div>
    </div>
  );
} 