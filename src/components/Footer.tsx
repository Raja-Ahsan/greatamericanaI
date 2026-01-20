import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="GreatAmerican.Ai Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-white">
                GreatAmerican.Ai
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              The premier marketplace for AI agents. Buy, sell, and discover the best AI solutions for your business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="hover:text-blue-400 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-blue-400 transition-colors">
                  Sell Your Agent
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-blue-400 transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Customer Service</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Content Creation</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Data Analysis</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Automation</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
            <p className="text-sm text-gray-400">
              Email: support@greatamerican.ai
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 GreatAmerican.Ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
