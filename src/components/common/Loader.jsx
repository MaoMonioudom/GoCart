import React from "react";

function Loader() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-9 h-9 border-4 border-gray-200 border-t-4 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;