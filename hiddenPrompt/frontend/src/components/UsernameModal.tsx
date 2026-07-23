import React, { useState, useEffect } from "react";

export default function UsernameModal({ isOpen, onClose, onSubmit }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatus("REDACTED: Name cannot be empty.");
      return;
    }

    onSubmit(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop Blur & Dark Overlay */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. Modal Card Container */}
      <div className="relative z-10 w-full max-w-sm -rotate-1 rounded-sm bg-[#e9dfc4] p-8 font-mono text-neutral-900 shadow-2xl border border-[#d3c5a3] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 text-sm font-bold cursor-pointer text-[#6e6352] hover:text-[#1a1815] transition-colors p-1"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Red Stamp Tag */}
        <div className="absolute -top-3 left-6 -rotate-3 bg-[#b22222] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
          NEW FILE
        </div>

        {/* Header Section */}
        <div className="mt-2 mb-6">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1a1815]">
            Who's asking?
          </h2>
          <p className="mt-1 text-xs text-[#5c5446] leading-relaxed">
            Put a name on the file before you open a case.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6e6352]">
              USERNAME
            </label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (status) setStatus("");
              }}
              placeholder="e.g. Detective Marlowe"
              className="w-full border-b-2 border-[#2c2720] bg-transparent pb-1 pt-1 font-mono text-sm text-[#1a1815] placeholder-[#a09482] outline-none transition-colors focus:border-[#b22222]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-[#3a3228] py-3 cursor-pointer text-xs font-bold uppercase tracking-widest text-[#e9dfc4] transition-all hover:bg-[#201b15] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            CREATE
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p
            className={`mt-4 text-center text-[11px] font-bold uppercase tracking-wider ${
              status.startsWith("ID FILED") ? "text-emerald-800" : "text-red-700"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}