/* eslint-disable react/no-unescaped-entities */
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { marked } from "marked";
import { ReactTyped } from "react-typed";
import { GiInjustice } from "react-icons/gi";
import { FiSend, FiCpu, FiUser, FiRefreshCw, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isResponseComplete, setIsResponseComplete] = useState(false);
  const textareaRef = useRef(null);
  const responseContainerRef = useRef(null);

  // Handle tab visibility change to fix background generation issue
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && currentIndex !== null && !isResponseComplete) {
        setIsResponseComplete(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentIndex, isResponseComplete]);

  const handleSubmit = useCallback(async () => {
    if (inputValue.trim() === "") {
      setErrorMessage("Please ask something.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setIsResponseComplete(false);
    const requestData = { prompt: inputValue };

    try {
      const {
        data: { response, citations },
      } = await axios.post(
        "https://jurissmart-backend-60a68e25334a.herokuapp.com/generate",
        requestData
      );

      setHistory((prevHistory) => [
        ...prevHistory,
        { question: inputValue, response, citations },
      ]);

      setInputValue("");
      setCurrentIndex(history.length);
    } catch (error) {
      console.log(error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, history]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [history, isLoading, isResponseComplete]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setErrorMessage("");
  };

  const handlePredefinedQuestionClick = (question) => {
    setInputValue(question);
    setErrorMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Process response to replace [docN] with [N] and map citations uniquely
  const processResponse = (text, citations) => {
    if (!text) return { processedText: "", usedCitations: [] };

    let processedText = text;
    const uniqueCitationsMap = new Map(); // Key: pdf_link (or title), Value: { ...citation, newIndex }
    let citationCounter = 1;

    // Find all [docN] patterns
    const matches = [...text.matchAll(/\[doc(\d+)\]/g)];
    
    // First pass: Identify unique citations and assign numbers
    matches.forEach((match) => {
      const docId = parseInt(match[1]);
      // Assuming citations are 0-indexed in the array, but docId is 1-based from backend logic usually.
      // Let's stick to the previous assumption: citations array corresponds to doc1, doc2...
      const citation = citations[docId - 1]; 
      
      if (citation) {
        const uniqueKey = citation.pdf_link || citation.title; // Use link as unique identifier, fallback to title
        
        if (!uniqueCitationsMap.has(uniqueKey)) {
          uniqueCitationsMap.set(uniqueKey, { ...citation, newIndex: citationCounter++ });
        }
      }
    });

    // Second pass: Replace [docN] with [newIndex] based on the unique key
    processedText = processedText.replace(/\[doc(\d+)\]/g, (match, docId) => {
      const id = parseInt(docId);
      const citation = citations[id - 1];
      if (citation) {
        const uniqueKey = citation.pdf_link || citation.title;
        const uniqueCitation = uniqueCitationsMap.get(uniqueKey);
        return uniqueCitation ? `[${uniqueCitation.newIndex}]` : match;
      }
      return match;
    });

    // Convert map to array and sort by newIndex
    const usedCitations = Array.from(uniqueCitationsMap.values()).sort((a, b) => a.newIndex - b.newIndex);

    return { processedText, usedCitations };
  };

  const convertMarkdownToHtml = (markdown) => {
    return marked(markdown, { breaks: true, gfm: true });
  };

  return (
    <div className="flex flex-col h-screen pt-20 pb-6 max-w-5xl mx-auto px-4 md:px-8">
      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full" />
            <GiInjustice className="relative text-9xl text-slate-900 dark:text-white drop-shadow-2xl" />
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Legal Clarity in Seconds
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              Get precise answers about IP law from trusted legal texts across Nigeria, the US, and the UK.
            </p>
          </div>

          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              "How do I register a trademark in USA?",
              "How do I register an Industrial design in Nigeria?",
              "What is the duration of Copyright in the UK?"
            ].map((q, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePredefinedQuestionClick(q)}
                className="p-6 text-left bg-slate-900/50 border border-slate-800 hover:border-gold-500/50 rounded-2xl transition-all group"
              >
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {q}
                </p>
                <FiArrowRight className="mt-4 text-slate-600 group-hover:text-gold-400 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <div 
          ref={responseContainerRef}
          className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >
          {history.map((entry, index) => {
             const { processedText, usedCitations } = processResponse(entry.response, entry.citations || []);
             const isCurrent = index === currentIndex;
             // Show references if it's a past message OR if it's current and typing is complete
             const showReferences = !isCurrent || isResponseComplete;

             return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="flex items-end gap-3 max-w-[80%]">
                    <div className="bg-slate-800 text-white p-4 rounded-2xl rounded-br-sm shadow-lg border border-slate-700">
                      <p className="text-base leading-relaxed">{entry.question}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                      <FiUser className="text-slate-300" />
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[90%]">
                    <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0 mt-1">
                      <FiCpu className="text-gold-400" />
                    </div>
                    <div className="space-y-4 w-full">
                      <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-6 prose-headings:font-bold prose-headings:text-gold-400 prose-a:text-gold-400 hover:prose-a:text-gold-300 max-w-none">
                        {isCurrent && !isResponseComplete ? (
                          <ReactTyped
                            strings={[convertMarkdownToHtml(processedText)]}
                            typeSpeed={5}
                            showCursor={false}
                            onComplete={() => setIsResponseComplete(true)}
                          />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(processedText) }} />
                        )}
                      </div>

                      {/* Citations - Only show when response is complete */}
                      {showReferences && usedCitations.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 pt-4 border-t border-slate-800"
                        >
                          <h4 className="text-sm font-semibold text-slate-400 mb-3">References</h4>
                          <div className="grid gap-2">
                            {usedCitations.map((citation, i) => (
                              <a
                                key={i}
                                href={citation.pdf_link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-gold-500/30 hover:bg-slate-800/50 transition-all group"
                              >
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 text-xs font-bold text-gold-400 bg-gold-500/10 rounded-full border border-gold-500/20">
                                  {citation.newIndex}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-300 group-hover:text-white truncate transition-colors">
                                    {citation.title}
                                  </p>
                                </div>
                                <FiArrowRight className="text-slate-600 group-hover:text-gold-400 opacity-0 group-hover:opacity-100 transition-all" />
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-slate-500 ml-11"
            >
              <div className="flex space-x-1">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-gold-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gold-500 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gold-500 rounded-full" />
              </div>
              <span className="text-sm font-medium">Thinking...</span>
            </motion.div>
          )}
          
          <div className="h-4" /> {/* Spacer */}
        </div>
      )}

      {/* Input Area */}
      <div className={clsx(
        "mt-auto transition-all duration-500 ease-out",
        history.length === 0 ? "w-full max-w-2xl mx-auto" : "w-full"
      )}>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-end gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question..."
              rows={1}
              className="w-full max-h-32 px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none scrollbar-hide"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-gold-500 text-slate-950 rounded-xl hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gold-500/20"
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <FiRefreshCw className="text-xl" />
                </motion.div>
              ) : (
                <FiSend className="text-xl" />
              )}
            </button>
          </div>
        </div>
        
        {errorMessage && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center mt-2"
          >
            {errorMessage}
          </motion.p>
        )}

        {history.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <FiRefreshCw /> Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
