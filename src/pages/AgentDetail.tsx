import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, CheckCircle, Video, Download, Play, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import getImageUrl from '../utils/imageUrl';
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
  const { addToCart, isAuthenticated, user } = useStore();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ success: boolean; data: any }>(`/agents/${id}`);
      if (response.success && response.data) {
        setAgent(response.data);
      } else {
        setError('Agent not found');
      }
    } catch (err: any) {
      console.error('Error fetching agent:', err);
      setError(err.response?.status === 404 ? 'Agent not found' : 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/agent/${id}` } } });
      return;
    }
    
    if (agent) {
      addToCart(agent);
    }
  };

  const handleDownload = async () => {
    if (!agent?.filePath) {
      alert('No file available for download');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/agents/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent.name.replace(/\s+/g, '_')}_files.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.message || 'You must purchase this agent to download the files');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to download file');
    }
  };

  const checkCanDownload = () => {
    if (!user || !agent) return false;
    // Check if user purchased this agent
    // For now, we'll check if user is admin, vendor (seller), or has purchased
    // In a real app, you'd check purchases from the backend
    return user.role === 'admin' || user.id === agent.seller?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Agent not found'}</h1>
          <Link to="/marketplace" className="text-blue-600 hover:text-blue-700">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Get all images for gallery (thumbnail + gallery images)
  const allImages = [];
  if (agent.thumbnail_image) {
    allImages.push(getImageUrl(agent.thumbnail_image));
  } else if (agent.image) {
    allImages.push(getImageUrl(agent.image));
  }
  if (agent.gallery_images && Array.isArray(agent.gallery_images)) {
    agent.gallery_images.forEach((img: string) => {
      const imgUrl = getImageUrl(img);
      if (imgUrl && !allImages.includes(imgUrl)) {
        allImages.push(imgUrl);
      }
    });
  }
  // If no images found, use default
  if (allImages.length === 0 && agent.image) {
    allImages.push(getImageUrl(agent.image) || agent.image);
  }

  const mainImage = allImages[selectedImageIndex] || allImages[0] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';

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
            {/* Main Image/Video */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {agent.video_url ? (
                <div className="relative">
                  {agent.video_url.includes('youtube.com') || agent.video_url.includes('youtu.be') ? (
                    <div className="aspect-video bg-gray-900">
                      <iframe
                        src={agent.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : agent.video_url.includes('vimeo.com') ? (
                    <div className="aspect-video bg-gray-900">
                      <iframe
                        src={agent.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      <video
                        src={agent.video_url}
                        controls
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Video Demo
                  </div>
                </div>
              ) : (
                <img
                  src={mainImage}
                  alt={agent.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop';
                  }}
                />
              )}
            </div>

            {/* Image Gallery */}
            {allImages.length > 1 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Gallery</h3>
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${agent.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                        i < Math.floor(agent.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-900 font-medium">{agent.rating || 0}</span>
                <span className="ml-2 text-gray-500">({agent.reviews || 0} reviews)</span>
                <span className="ml-4 text-gray-500">• {agent.sales || 0} sales</span>
              </div>

              {/* Seller */}
              <div className="flex items-center mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {agent.seller?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 flex items-center">
                      {agent.seller?.name || 'Unknown Seller'}
                      {agent.seller?.verified && (
                        <CheckCircle className="w-4 h-4 ml-1 text-blue-600" />
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Verified Seller</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">About This Agent</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {agent.longDescription || agent.description}
                </p>

                {agent.capabilities && agent.capabilities.length > 0 && (
                  <>
                    <h2 className="text-xl font-semibold mb-3">Key Capabilities</h2>
                    <ul className="space-y-2 mb-6">
                      {agent.capabilities.map((capability: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="mt-1 mr-2">
                            <CheckmarkSVG />
                          </div>
                          <span className="text-gray-700">{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h2 className="text-xl font-semibold mb-3">Technical Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  {agent.model && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <CodeSVG />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Model</p>
                        <p className="text-gray-600">{agent.model}</p>
                      </div>
                    </div>
                  )}
                  {agent.responseTime && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <ClockSVG />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Response Time</p>
                        <p className="text-gray-600">{agent.responseTime}</p>
                      </div>
                    </div>
                  )}
                  {agent.languages && agent.languages.length > 0 && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-1">
                        <GlobeSVG />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Languages</p>
                        <p className="text-gray-600">{Array.isArray(agent.languages) ? agent.languages.join(', ') : agent.languages}</p>
                      </div>
                    </div>
                  )}
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
              {agent.tags && agent.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center flex-wrap gap-2">
                    <TagSVG />
                    {agent.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${parseFloat(agent.price || 0).toFixed(2)}</span>
                <span className="text-gray-500 ml-2">one-time</span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mb-3"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAuthenticated ? 'Add to Cart' : 'Sign In to Purchase'}
              </button>

              {agent.filePath && (isAuthenticated && checkCanDownload()) && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center mb-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Files
                </button>
              )}

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
                  Added: <span className="font-medium text-gray-900">
                    {agent.dateAdded ? new Date(agent.dateAdded).toLocaleDateString() : 'N/A'}
                  </span>
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
