import React, { useState, useRef, useEffect } from 'react';
import { askSchemeAssistant } from '../services/api';
import { 
  FiSend, 
  FiX, 
  FiUser, 
  FiExternalLink, 
  FiArrowRight, 
  FiShield, 
  FiCpu 
} from 'react-icons/fi';
import { TbSparkles } from 'react-icons/tb';

export default function AiAssistantDrawer({ isOpen, onClose, onSelectScheme }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! I am the SchemeForge Assistant. Ask me anything about Indian government schemes, eligibility requirements, or official application processes in natural language.',
      intent: 'GENERAL_SCHEME_QUESTION',
      schemes: [],
      sources: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const chatEndRef = useRef(null);

  const samplePrompts = [
    "I am a 30 year old farmer from Tamil Nadu earning ₹2 Lakh. Am I eligible for PM-KISAN?",
    "Find education schemes for college students",
    "What government support exists for women entrepreneurs?",
    "Explain PM Vishwakarma in simple language"
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await askSchemeAssistant(textToSend);
      if (response && response.success) {
        const assistantMsg = {
          role: 'assistant',
          content: response.answer,
          intent: response.intent,
          schemes: response.schemes || [],
          sources: response.sources || [],
          evaluations: response.eligibilityEvaluations || [],
          missingFields: response.missingFields || [],
          disclaimer: response.disclaimer
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(response?.message || 'Failed to receive response');
      }
    } catch (err) {
      setErrorMsg(err.message || 'AI Assistant is temporarily unavailable.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Scheme Assistant is temporarily unavailable. You can still search and browse verified schemes using the main navigation.',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#CFBB99]">
        
        {/* Header */}
        <div className="p-4 bg-[#F7F4EF] border-b border-[#CFBB99] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#4C3D19] text-[#E8DCC4] flex items-center justify-center shadow-sm">
              <TbSparkles className="w-5 h-5 text-[#CFBB99]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-[#4C3D19] text-lg">SchemeForge Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-[#E8DCC4] text-[#4C3D19] rounded-full">
                  Grounded AI
                </span>
              </div>
              <p className="text-xs text-[#786642]">Source-aware scheme discovery & natural language guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#786642] hover:text-[#4C3D19] hover:bg-[#E8DCC4]/50 rounded-full transition-colors"
            aria-label="Close Assistant"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white selection:bg-[#CFBB99]">
          
          {/* Sample Suggestion Chips */}
          {messages.length === 1 && (
            <div className="my-2 p-3 bg-[#F7F4EF] rounded-xl border border-[#CFBB99]/40 space-y-2">
              <p className="text-xs font-semibold text-[#4C3D19] uppercase tracking-wider">Suggested Queries:</p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs bg-white text-[#4C3D19] hover:bg-[#4C3D19] hover:text-white border border-[#CFBB99] px-3 py-1.5 rounded-lg transition-all duration-150 shadow-sm cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#4C3D19] text-[#E8DCC4] flex items-center justify-center flex-shrink-0 mt-1">
                  <FiCpu className="w-4 h-4 text-[#CFBB99]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#4C3D19] text-[#F7F4EF] rounded-br-none'
                    : 'bg-[#F7F4EF] text-[#4C3D19] border border-[#CFBB99]/60 rounded-bl-none shadow-sm'
                }`}
              >
                {/* Intent Tag */}
                {msg.intent && msg.intent !== 'GENERAL_SCHEME_QUESTION' && (
                  <div className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold uppercase tracking-wider bg-[#E8DCC4] text-[#4C3D19] rounded">
                    {msg.intent.replace('_', ' ')}
                  </div>
                )}

                {/* Body Text */}
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Deterministic Eligibility Evaluations */}
                {msg.evaluations && msg.evaluations.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[#CFBB99]/40 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4C3D19]">
                      Deterministic Eligibility Engine Handoff:
                    </p>
                    {msg.evaluations.map((ev, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-lg border border-[#CFBB99]/50 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[#4C3D19]">{ev.schemeName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.status === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800' :
                            ev.status === 'POTENTIALLY_ELIGIBLE' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {ev.status === 'ELIGIBLE' ? 'ELIGIBLE' : ev.status === 'POTENTIALLY_ELIGIBLE' ? 'POTENTIALLY ELIGIBLE' : 'DOES NOT MATCH'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#786642]">Rule Match Score: {ev.matchScore}%</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grounded Scheme Cards */}
                {msg.schemes && msg.schemes.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-[#CFBB99]/40 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4C3D19]">
                      Retrieved Verified Schemes ({msg.schemes.length}):
                    </p>
                    <div className="space-y-2">
                      {msg.schemes.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 bg-white rounded-xl border border-[#CFBB99] hover:border-[#4C3D19] transition-all flex justify-between items-center group cursor-pointer shadow-sm"
                          onClick={() => {
                            onSelectScheme(s);
                            onClose();
                          }}
                        >
                          <div>
                            <h4 className="font-serif font-bold text-xs text-[#4C3D19] group-hover:underline">
                              {s.name}
                            </h4>
                            <p className="text-[11px] text-[#786642] line-clamp-1">{s.shortDescription}</p>
                            <span className="text-[10px] text-[#4C3D19] font-medium mt-1 inline-block">
                              {s.type} • {s.state} • {s.subsidyAmount}
                            </span>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-[#786642] group-hover:text-[#4C3D19] transition-transform group-hover:translate-x-1 flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Provenance Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 border-t border-[#CFBB99]/40 pt-2 space-y-1">
                    <p className="text-[11px] font-bold text-[#4C3D19] flex items-center space-x-1">
                      <FiShield className="w-3.5 h-3.5 text-emerald-700 inline" />
                      <span>Official Sources Cited:</span>
                    </p>
                    <div className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#4C3D19] hover:underline block truncate flex items-center space-x-1"
                        >
                          <FiExternalLink className="w-3 h-3 text-[#786642] inline flex-shrink-0" />
                          <span className="truncate">{src.sourceTitle} ({src.sourceAuthority})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                {msg.disclaimer && (
                  <p className="mt-2 text-[10px] text-[#786642] italic border-t border-[#CFBB99]/30 pt-1">
                    {msg.disclaimer}
                  </p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#E8DCC4] text-[#4C3D19] flex items-center justify-center flex-shrink-0 mt-1">
                  <FiUser className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex space-x-3 items-center text-[#786642] text-xs p-2">
              <TbSparkles className="w-4 h-4 animate-spin text-[#4C3D19]" />
              <span>Retrieving verified schemes & constructing grounded response...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F7F4EF] border-t border-[#CFBB99]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about schemes, eligibility, documents..."
              maxLength={1000}
              className="flex-1 bg-white border border-[#CFBB99] rounded-xl px-4 py-2.5 text-sm text-[#4C3D19] placeholder-[#786642]/60 focus:outline-none focus:ring-2 focus:ring-[#4C3D19]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-[#4C3D19] text-[#F7F4EF] p-2.5 rounded-xl hover:bg-[#382d13] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              aria-label="Send query"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
