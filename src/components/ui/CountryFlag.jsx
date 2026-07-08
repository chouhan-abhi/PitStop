import React from "react";

const CountryFlag = ({ countryCode, size = "md", className = "" }) => {
  if (!countryCode) return null;

  const sizeClass =
    size === "lg" ? "w-8 h-6" : size === "sm" ? "w-5 h-4" : "w-6 h-5";

  return (
    <img
      src={`https://flagsapi.com/${countryCode}/flat/64.png`}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${sizeClass} rounded-[var(--shape-xs)] object-cover shrink-0 ${className}`}
    />
  );
};

export default CountryFlag;
