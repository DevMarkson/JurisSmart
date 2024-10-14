<<<<<<< HEAD:front-end/src/components/Navbar.jsx
import { useState } from "react";
import emailjs from "emailjs-com"; // Import EmailJS

import { GiInjustice } from "react-icons/gi";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedback || !userEmail) {
      alert("Please provide your email and feedback.");
      return;
    }

    setIsSending(true);

    // Replace these with your EmailJS service, template, and user IDs
    const serviceID = "service_w6v8837";
    const templateID = "template_tvxgas8";
    const userID = "vh2yeZ68MgfifADF7";

    const templateParams = {
      to_name: "MarkSon",
      from_name: userEmail,
      message: feedback,
    };

    emailjs.send(serviceID, templateID, templateParams, userID).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text);
        alert("Feedback sent successfully!");
        setIsModalOpen(false);
        setFeedback("");
        setUserEmail("");
        setIsSending(false);
      },
      (err) => {
        console.log("FAILED...", err);
        alert("Failed to send feedback.");
        setIsSending(false);
      }
    );
  };

  return (
    <>
      <div className="navbar">
        <h2 className="navbar-title">
          JurisSmart{" "}
          <span>
            {" "}
            <GiInjustice className="justice2" />
          </span>
        </h2>
        <button onClick={openModal}>Send Feedback</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Send Feedback</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email"
                value={userEmail}
                onChange={handleEmailChange}
                required
                className="email-input"
              />
              <textarea
                placeholder="Write your feedback here..."
                rows="4"
                className="feedback-textarea"
                value={feedback}
                onChange={handleFeedbackChange}
                required
              />
              <div className="modal-buttons">
                <button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Submit"}
                </button>
                <button type="button" onClick={closeModal} className="cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
=======
import { useState } from "react";
import emailjs from "emailjs-com"; // Import EmailJS

import { GiInjustice } from "react-icons/gi";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedback || !userEmail) {
      alert("Please provide your email and feedback.");
      return;
    }

    setIsSending(true);

    // Replace these with your EmailJS service, template, and user IDs
    const serviceID = "service_7wx0mpp";
    const templateID = "template_fmd0xbb";
    const userID = "vh2yeZ68MgfifADF7";

    const templateParams = {
      to_name: "MarkSon",
      from_name: userEmail,
      message: feedback,
    };

    emailjs.send(serviceID, templateID, templateParams, userID).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text);
        alert("Feedback sent successfully!");
        setIsModalOpen(false);
        setFeedback("");
        setUserEmail("");
        setIsSending(false);
      },
      (err) => {
        console.log("FAILED...", err);
        alert("Failed to send feedback.");
        setIsSending(false);
      }
    );
  };

  return (
    <>
      <div className="navbar">
        <h2 className="navbar-title">
          JurisSmart{" "}
          <span>
            {" "}
            <GiInjustice className="justice2" />
          </span>
        </h2>
        <button onClick={openModal}>Send Feedback</button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Send Feedback</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email"
                value={userEmail}
                onChange={handleEmailChange}
                required
                className="email-input"
              />
              <textarea
                placeholder="Write your feedback here..."
                rows="4"
                className="feedback-textarea"
                value={feedback}
                onChange={handleFeedbackChange}
                required
              />
              <div className="modal-buttons">
                <button type="submit" disabled={isSending}>
                  {isSending ? "Sending..." : "Submit"}
                </button>
                <button type="button" onClick={closeModal} className="cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
>>>>>>> origin/frontend:src/components/Navbar.jsx
