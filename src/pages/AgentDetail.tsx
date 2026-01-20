import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, CheckCircle } from 'lucide-react';
import { mockAgents } from '../data/mockData';
import { useStore } from '../store/useStore';
import {
  CodeSVG,
  ClockSVG,
  GlobeSVG,
  TagSVG,
  CheckmarkSVG,
  APIAccessSVG,
} from '../components/SVGIcons';

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isAuthenticated } = useStore();
  const agent = mockAgents.find((a) => a.id === id);

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent not found</h1>
          <Link to="/marketplace" className="text-blue-600 hover:text-blue-700">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/agent/${id}` } } });
      return;
    }
    
    addToCart(agent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{agent.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={agent.image}
                alt={agent.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{agent.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(agent.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-900 font-medium">{agent.rating}</span>
                <span className="ml-2 text-gray-500">({agent.reviews} reviews)</span>
                <span className="ml-4 text-gray-500">• {agent.sales} sales</span>
              </div>

              {/* Seller */}
              <div className="flex items-center mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {agent.seller.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 flex items-center">
                      {agent.seller.name}
                      {agent.seller.verified && (
                        <CheckCircle className="w-4 h-4 ml-1 text-blue-600" />
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Verified Seller</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">About This Agent</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{agent.longDescription}</p>

                <h2 className="text-xl font-semibold mb-3">Key Capabilities</h2>
                <ul className="space-y-2 mb-6">
                  {agent.capabilities.map((capability, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mt-1 mr-2">
                        <CheckmarkSVG />
                      </div>
                      <span className="text-gray-700">{capability}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="text-xl font-semibold mb-3">Technical Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <CodeSVG />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Model</p>
                      <p className="text-gray-600">{agent.model}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <ClockSVG />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Response Time</p>
                      <p className="text-gray-600">{agent.responseTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <GlobeSVG />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Languages</p>
                      <p className="text-gray-600">{agent.languages.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-2 mt-1">
                      <APIAccessSVG />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">API Access</p>
                      <p className="text-gray-600">{agent.apiAccess ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center flex-wrap gap-2">
                  <TagSVG />
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${agent.price}</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mb-3"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAuthenticated ? 'Add to Cart' : 'Sign In to Purchase'}
              </button>

              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors mb-6">
                Try Demo
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-700">
                  <div className="mr-2">
                    <CheckmarkSVG />
                  </div>
                  <span>Instant access</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="mr-2">
                    <CheckmarkSVG />
                  </div>
                  <span>API documentation included</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="mr-2">
                    <CheckmarkSVG />
                  </div>
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="mr-2">
                    <CheckmarkSVG />
                  </div>
                  <span>Free updates & support</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium text-gray-900">{agent.category}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Added: <span className="font-medium text-gray-900">{new Date(agent.dateAdded).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
