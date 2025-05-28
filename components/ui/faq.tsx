'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // 获取本地化的FAQ数据
  const getFAQData = (): FAQItem[] => [
    {
      question: t('components.faq.questions.q1.question'),
      answer: t('components.faq.questions.q1.answer')
    },
    {
      question: t('components.faq.questions.q2.question'),
      answer: t('components.faq.questions.q2.answer')
    },
    {
      question: t('components.faq.questions.q3.question'),
      answer: t('components.faq.questions.q3.answer')
    },
    {
      question: t('components.faq.questions.q4.question'),
      answer: t('components.faq.questions.q4.answer')
    },
    {
      question: t('components.faq.questions.q5.question'),
      answer: t('components.faq.questions.q5.answer')
    },
    {
      question: t('components.faq.questions.q6.question'),
      answer: t('components.faq.questions.q6.answer')
    },
    {
      question: t('components.faq.questions.q7.question'),
      answer: t('components.faq.questions.q7.answer')
    },
    {
      question: t('components.faq.questions.q8.question'),
      answer: t('components.faq.questions.q8.answer')
    }
  ];

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
          {t('components.faq.title')}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('components.faq.description')}
        </p>
      </div>

      <div className="space-y-4">
        {getFAQData().map((item, index) => (
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
          <h3 className="text-xl font-semibold mb-3">{t('components.faq.contactSection.title')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('components.faq.contactSection.description')}
          </p>
          <a
            href="mailto:support@aivoice.com"
            className="btn-primary inline-flex items-center gap-2"
          >
            {t('components.faq.contactSection.contactButton')}
          </a>
        </div>
      </div>
    </div>
  );
} 