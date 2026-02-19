// src/components/common/Button.jsx
import React from "react";
import "./Button.css";

function Button({ text, onClick, className = "" }) {
  return (
    <button className={`btn ${className}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
