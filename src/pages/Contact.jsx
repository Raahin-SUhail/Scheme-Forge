import React, { useState } from 'react';
import { submitContactForm } from '../services/api';
import { FiMail, FiSend, FiCheckCircle, FiShield, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('General Enquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!message.trim()) {
      setError("Message content is required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        type,
        subject: subject.trim() || 'Scheme Enquiry',
        message: message.trim()
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      setError(err.message || "Failed to send message to backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setType('General Enquiry');
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#4C3D19] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F7F3ED] border border-[#CFBB99]/60 text-[#4C3D19] text-xs font-bold uppercase tracking-wider mb-3">
            <FiMail className="w-3.5 h-3.5 text-[#889063]" />
            <span>Citizen Help Desk</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#4C3D19] tracking-tight">
            Contact & Support
          </h1>
          <p className="text-sm text-[#4C3D19]/80 mt-2 max-w-lg mx-auto">
            Have questions regarding scheme eligibility or portal guidance? Submit your enquiry directly to our support desk.
          </p>
        </div>

        {/* Card Container */}
        <div className="card-white p-8 sm:p-12 rounded-3xl border border-[#CFBB99] shadow-xl bg-white relative overflow-hidden">
          
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <FiCheckCircle className="w-12 h-12 text-[#889063] mx-auto" />
              <h3 className="text-2xl font-bold text-[#4C3D19]">Enquiry Submitted Successfully</h3>
              <p className="text-xs text-[#4C3D19]/75 max-w-md mx-auto">
                Thank you, <strong className="text-[#4C3D19]">{name}</strong>. Your enquiry has been received and logged in our support database. Our team will review your query shortly.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full btn-cafe text-xs font-bold inline-block cursor-pointer mt-4"
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-3.5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-xs font-medium text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full p-3.5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-xs font-medium text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Enquiry Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-xs font-semibold text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Eligibility Calculation Query">Eligibility Calculation Query</option>
                    <option value="Scheme Data Discrepancy">Scheme Data Discrepancy</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4C3D19] block">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject description..."
                    className="w-full p-3.5 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-xs font-medium text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4C3D19] block">Message Details *</label>
                <textarea
                  required
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or feedback..."
                  className="w-full p-4 rounded-2xl bg-[#F7F3ED] border border-[#CFBB99] text-xs font-medium text-[#4C3D19] focus:outline-none focus:ring-2 focus:ring-[#889063]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full btn-cafe text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    <span>Submit Enquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
