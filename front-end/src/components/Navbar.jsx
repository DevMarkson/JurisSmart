import { useState } from "react";
import emailjs from "emailjs-com";
import { GiInjustice } from "react-icons/gi";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFeedbackChange = (e) => setFeedback(e.target.value);
  const handleEmailChange = (e) => setUserEmail(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback || !userEmail) {
      alert("Please provide your email and feedback.");
      return;
    }

    setIsSending(true);

    const serviceID = "service_7wx0mpp";
    const templateID = "template_7c3tjgy";
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <h2 
            onClick={() => window.location.reload()}
            className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            JurisSmart
            <GiInjustice className="text-gold-400 text-3xl" />
          </h2>
        </div>
        <button
          onClick={openModal}
          className="px-6 py-2.5 text-sm font-semibold text-slate-950 bg-gold-400 rounded-full hover:bg-gold-500 transition-all shadow-lg shadow-gold-500/20 active:scale-95"
        >
          Send Feedback
        </button>
      </nav>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Send Feedback</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={userEmail}
                    onChange={handleEmailChange}
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                  <textarea
                    placeholder="How can we improve?"
                    rows="4"
                    value={feedback}
                    onChange={handleFeedbackChange}
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2 text-sm font-semibold text-slate-950 bg-gold-400 rounded-xl hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSending ? "Sending..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
