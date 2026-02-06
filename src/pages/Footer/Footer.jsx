import React from "react";
import Logo from "../../assets/images/logo.png";

const Footer = () => {
  return (
    <footer className="bg-white font-roboto">
      {/* Top Footer */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row justify-between gap-10">
        {/* Logo and description */}
        <div className="max-w-xs flex flex-col gap-5">
          <img src={Logo} alt="GoCart Logo" className="w-28" />
          <p className="text-gray-900 text-base leading-7">
            High level experience in web design and development knowledge, producing quality work.
          </p>
          <div className="flex gap-4">
            <span className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full cursor-pointer text-xs">FB</span>
            <span className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full cursor-pointer text-xs">IG</span>
            <span className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full cursor-pointer text-xs">YT</span>
            <span className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full cursor-pointer text-xs">IN</span>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap gap-12 justify-between flex-1">
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-lg">Product</h4>
            <p className="text-sm text-gray-900 cursor-pointer">Landing Page</p>
            <p className="text-sm text-gray-900 cursor-pointer">Popup Builder</p>
            <p className="text-sm text-gray-900 cursor-pointer">Web-design</p>
            <p className="text-sm text-gray-900 cursor-pointer">Content</p>
            <p className="text-sm text-gray-900 cursor-pointer">Integrations</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-lg">Use Cases</h4>
            <p className="text-sm text-gray-900 cursor-pointer">Web-designers</p>
            <p className="text-sm text-gray-900 cursor-pointer">Marketers</p>
            <p className="text-sm text-gray-900 cursor-pointer">Small Business</p>
            <p className="text-sm text-gray-900 cursor-pointer">Website Builder</p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-lg">Company</h4>
            <p className="text-sm text-gray-900 cursor-pointer">About Us</p>
            <p className="text-sm text-gray-900 cursor-pointer">Careers</p>
            <p className="text-sm text-gray-900 cursor-pointer">FAQs</p>
            <p className="text-sm text-gray-900 cursor-pointer">Teams</p>
            <p className="text-sm text-gray-900 cursor-pointer">Contact Us</p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-300 h-12 flex justify-end items-center px-6 md:px-12 text-gray-900 font-inter text-sm">
        <p>©2025 - 2026 GoCart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
