import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeContext';

const faqs = [
  {
    question: "Are there any limits to how many messages I can forward?",
    answer: "On the Free Tier, you can route up to 50 logs per day. Our Pro Monthly, Pro Yearly, and Enterprise plans offer unlimited message forwarding with zero daily restrictions."
  },
  {
    question: "Do I need to leave my browser open for this to work?",
    answer: "No. Once you configure your pipeline rules, our autonomous backend engine continuously monitors the MTProto network and handles forwarding 24/7. Your browser can be closed safely."
  },
  {
    question: "Can I connect my personal Telegram account instead of a Bot?",
    answer: "Yes! TeleFlow supports both Bot API and User Client (API ID/Hash + Session String) authentication, allowing you to forward from channels even without administrator permissions."
  },
  {
    question: "How secure is my Telegram session data?",
    answer: "Extremely secure. All Telegram session strings and Bot tokens are encrypted automatically before they reach our database. We only hold the minimum connection tokens necessary to dispatch messages to your defined targets."
  },
  {
    question: "Can I filter messages or strip promotional links?",
    answer: "Yes. Every pipeline supports RegEx Find & Replace along with keyword whitelists and blacklists. This gives you precise control to remove competitor names, affiliate links, or alter specific phrases on the fly."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  return (
    <div id="faq_block" className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Frequently Asked Questions
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Everything you need to know about TeleFlow routing.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                theme === 'dark' 
                  ? isOpen ? 'border-indigo-500/50 bg-[#0d0e12]' : 'border-[#1e2230] bg-[#0d0e12]'
                  : isOpen ? 'border-indigo-500 bg-white' : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between focus:outline-none cursor-pointer"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className={`font-semibold text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
                />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className={`px-6 pb-5 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
