// src/views/driver/components/DriverHeader.jsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DriverHeader({ driver }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 bg-black/80 backdrop-blur-lg py-4 px-4 border-b border-gray-800 flex items-center gap-3 z-50">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-300 hover:text-white transition"
      >
        <ArrowLeft size={22} />
      </button>
      <h1 className="text-xl font-semibold tracking-wide uppercase">
        {driver.full_name}
      </h1>
    </div>
  );
}
