/* eslint-disable react/no-unescaped-entities */
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { ReactTyped } from "react-typed";

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]); // Track history of questions and responses
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [currentIndex, setCurrentIndex] = useState(null); // Track the index of the current animated response
  const textareaRef = useRef(null);
  const responseContainerRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    if (inputValue.trim() === "") {
      setErrorMessage("Please ask something.");
      return;
    }

    setIsLoading(true); // Start loading animation
    setErrorMessage(""); // Clear previous errors
    const requestData = { prompt: inputValue };

    try {
      const {
        data: { response, citations },
      } = await axios.post(
        "https://legal-advisor.onrender.com/generate",
        requestData
      );

      // Update history with the new question and response
      setHistory((prevHistory) => [
        ...prevHistory,
        { question: inputValue, response, citations },
      ]);

      console.log(citations[0]);

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

  return (
    <>
      {history.length === 0 ? ( // Show the container only if there are no previous questions
        <div className="container">
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
                onClick={() =>
                  handlePredefinedQuestionClick(
                    "What is intellectual property?"
                  )
                }
              >
                <p>What is intellectual property?</p>
              </div>
              <div
                className="question"
                onClick={() =>
                  handlePredefinedQuestionClick(
                    "How can I protect a trademark?"
                  )
                }
              >
                <p>How can I protect a trademark?</p>
              </div>
              <div
                className="question"
                onClick={() =>
                  handlePredefinedQuestionClick(
                    "What are the steps to register a patent?"
                  )
                }
              >
                <p>What are the steps to register a patent?</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="response-container" ref={responseContainerRef}>
          {history.map((entry, index) => (
            <div key={index} className="response-entry">
              <div className="selected-question">
                <p>{entry.question}</p>
              </div>

              <div className="generating-response">
                <p>
                  {index === currentIndex ? ( // Animate only the current response
                    <ReactTyped
                      strings={[entry.response]} // The response text to type out
                      typeSpeed={2} // Typing speed in milliseconds
                      backSpeed={0} // No backspace speed
                      showCursor={false} // Hide cursor after typing
                    />
                  ) : (
                    <span>{entry.response}</span>
                  )}
                </p>  

                <div className="citation">
                  <a href={entry.citations[0].pdf_link} target="_blank" rel="noreferrer">
                    1. {entry.citations[0].title}
                  </a>
                </div>
              </div>
            </div>
          ))}

          <div className="chat-box">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask another question..."
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
