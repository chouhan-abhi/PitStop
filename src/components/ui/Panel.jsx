import React from "react";

import Surface from "./Surface";

const Panel = ({ className = "", children, accent = false, tier = "container", ...props }) => {
  return (
    <Surface
      tier={tier}
      className={`${accent ? "ring-1 ring-[var(--md-primary)]/30" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Surface>
  );
};

export default Panel;
