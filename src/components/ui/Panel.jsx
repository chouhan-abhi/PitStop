import React from "react";

const Panel = ({ className = "", children, accent = false }) => {
  return (
    <section
      className={`panel f1-card ${accent ? "border-red-500/35" : ""} ${className}`.trim()}
    >
      {children}
    </section>
  );
};

export default Panel;
