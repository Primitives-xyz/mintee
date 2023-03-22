"use client";
import { useState } from "react";
import { Transition } from "@headlessui/react";

export default function AlphaAnnouncement() {
  const [show, setShow] = useState(true);

  return (
    <>
      <div className="bg-yellow-500 text-white text-xl rounded-lg py-2 px-4 mb-6">
        {`We're in alpha!`}
      </div>
      <div className="absolute top-0 right-0 h-4 w-4 transform translate-x-2 -translate-y-2">
        <svg viewBox="0 0 20 20" fill="currentColor" className="x w-6 h-6">
          <path
            fillRule="evenodd"
            d="M14.95 5.95a1 1 0 00-1.414-1.414L10 8.586 6.464 5.05a1 1 0 00-1.414 1.414L8.586 10l-3.536 3.536a1 1 0 001.414 1.414L10 11.414l3.536 3.536a1 1 0 001.414-1.414L11.414 10l3.536-3.536z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <button
        className="hidden"
        onClick={() => setShow(false)}
        aria-label="Close"
      />
    </>
  );
}
