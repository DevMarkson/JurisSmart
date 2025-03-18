/* eslint-disable react/no-unescaped-entities */
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { marked } from "marked";
import { ReactTyped } from "react-typed";

import { GiInjustice } from "react-icons/gi";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]); // Track history of questions and responses
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [currentIndex, setCurrentIndex] = useState(null); // Track the index of the current animated response
  const [isResponseComplete, setIsResponseComplete] = useState(false); // Track if response is completed
  const textareaRef = useRef(null);
  const responseContainerRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    if (inputValue.trim() === "") {
      setErrorMessage("Please ask something.");
      return;
    }

    setIsLoading(true); // Start loading animation
    setErrorMessage(""); // Clear previous errors
    setIsResponseComplete(false); // Reset response completion state
    const requestData = { prompt: inputValue };

    try {
      const {
        data: { response, citations },
      } = await axios.post(
        "https://legal-advisor-6ru8.onrender.com/generate",
        requestData
      );

      // Update history with the new question and response
      setHistory((prevHistory) => [
        ...prevHistory,
        { question: inputValue, response, citations },
      ]);

      setInputValue(""); // Clear the input field after submission
      setCurrentIndex(history.length); // Set the index for the newly added question
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Stop loading animation
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
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setErrorMessage("");
  };

  const handlePredefinedQuestionClick = (question) => {
    setInputValue(question);
    setErrorMessage("");
  };

  const convertMarkdownToHtml = (markdown) => {
    const htmlOutput = marked(markdown);
    return htmlOutput;
  };

  return (
    <>
      {history.length === 0 ? ( // Show the container only if there are no previous questions
        <div className="container">
          <GiInjustice className="justice" />
          <h1>Get Clarity on Intellectual Property Law in Seconds!</h1>
          <p>
            Don't let legal complexity slow you down. Get clear, concise answers
            about IP law from trusted legal texts across Nigeria, the US, and
            the UK. Start asking questions or dive into common legal scenarios!
          </p>
          <div className="chat-box">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask a question..."
              rows="1"
              className="animated-placeholder"
            />
            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : "Enter"}
            </button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="faq">
            <p className="faq">Common Questions</p>
            <div className="questions">
              <div
                className="question"
                onClick={() => {
                  handlePredefinedQuestionClick(
                    "How do I register a trademark in USA?"
                  );
                }}
              >
                <p>How do I register a trademark in USA?</p>
              </div>
              <div
                className="question"
                onClick={() => {
                  handlePredefinedQuestionClick(
                    "How do I register an Industrial design in Nigeria?"
                  );
                }}
              >
                <p>How do I register an Industrial design in Nigeria?</p>
              </div>
              <div
                className="question"
                onClick={() => {
                  handlePredefinedQuestionClick(
                    "What is the duration of Copyright in the United Kingdom?"
                  );
                }}
              >
                <p>What is the duration of Copyright in the United Kingdom?</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="response-container" ref={responseContainerRef}>
          {history.map((entry, index) => {
            return (
              <div key={index} className="response-entry">
                <div className="selected-question">
                  <p>{entry.question}</p>
                </div>

                <div className="generating-response">
                  {index === currentIndex && !isResponseComplete && (
                    <h3>
                      Generating Response{" "}
                      <span className="dot-animation"></span>
                    </h3>
                  )}
                  <p>
                    {index === currentIndex ? ( // Animate only the current response
                      <ReactTyped
                        strings={[convertMarkdownToHtml(entry.response)]} // The response text to type out
                        typeSpeed={2} // Typing speed in milliseconds
                        backSpeed={0} // No backspace speed
                        showCursor={false} // Hide cursor after typing
                        onComplete={() => setIsResponseComplete(true)} // Set completion state when typing finishes
                      />
                    ) : (
                      <span>{entry.response}</span>
                    )}
                  </p>

                  {/* Only show citations if they exist */}
                  {entry.citations && entry.citations.length > 0 && (
                    <>
                      <h4 style={{ marginTop: "15px" }}>References:</h4>
                      {entry.citations.map(
                        (citation, index) =>
                          entry.response.includes(`[${index + 1}]`) && (
                            <div className="citation" key={index}>
                              <a
                                href={citation.pdf_link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                [{index + 1}]. {citation.title}
                              </a>
                            </div>
                          )
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div className="new-chat-button">
            <button
              className="new-chat-button"
              onClick={() => window.location.reload()}
            >
              New Chat
            </button>
          </div>

          <div className="chat-box">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask question..."
              rows="1"
              className="animated-placeholder"
            />
            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : "Enter"}
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      )}
    </>
  );
};

export default Chat;
