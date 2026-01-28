import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, CheckCircle } from 'lucide-react';
import { Agent } from '../types';
import { useStore } from '../store/useStore';
import getImageUrl from '../utils/imageUrl';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard = ({ agent }: AgentCardProps) => {
  const { addToCart, isAuthenticated } = useStore();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/marketplace' } } });
      return;
    }
    
    addToCart(agent);
  };

  return (
    <Link to={`/agent/${agent.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={getImageUrl((agent as any).thumbnail_image) || getImageUrl(agent.image) || agent.image}
            alt={agent.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to default image if image fails to load
              const target = e.target as HTMLImageElement;
              const fallbackImage = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
              }
            }}
          />
          {agent.seller.verified && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
            {agent.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {agent.rating}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              ({agent.reviews} reviews)
            </span>
          </div>

          {/* Category */}
          <div className="mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {agent.category}
            </span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${agent.price}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
