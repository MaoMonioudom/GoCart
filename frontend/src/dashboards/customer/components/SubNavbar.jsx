import { useState } from "react";

function SubNavbar({ categories }) {
  const [activeCat, setActiveCat] = useState("");

  const handleClick = (cat) => {
    setActiveCat(cat);

    const el = document.getElementById(cat.replace(/\s+/g, "-"));
    if (el) {
      const yOffset = -130; // adjust based on sticky NavCustomer + SubNavbar height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-[60px] z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors duration-200
              ${
                activeCat === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubNavbar;
