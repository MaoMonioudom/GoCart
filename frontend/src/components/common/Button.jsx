// src/components/common/Button.jsx
function Button({ text, onClick, className = "" }) {
  return (
    <button
      className={`bg-black text-white px-5 py-1.5 rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-800 ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;