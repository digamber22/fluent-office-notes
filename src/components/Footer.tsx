
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Multilingual Note-Taking Agent. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:text-blue-500">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-500">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-500">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
