import { useState } from 'react';
import { Upload, DollarSign, Tag, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { userDataService } from '../services/userDataService';
import { useNavigate } from 'react-router-dom';

const SellAgent = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: '',
    category: '',
    model: '',
    responseTime: '',
    capabilities: '',
    languages: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to list an agent');
      return;
    }

    // Create the agent listing
    const newAgent = userDataService.addListing(user.id, {
      name: formData.name,
      description: formData.description,
      longDescription: formData.longDescription,
      price: parseFloat(formData.price),
      category: formData.category,
      model: formData.model,
      responseTime: formData.responseTime,
      capabilities: formData.capabilities.split('\n').filter(c => c.trim()),
      languages: formData.languages.split(',').map(l => l.trim()),
      tags: formData.tags.split(',').map(t => t.trim()),
      seller: {
        id: user.id,
        name: user.name,
        verified: user.verified,
      },
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      apiAccess: true,
      dateAdded: new Date().toISOString(),
    });

    alert('Agent submitted for review! We will contact you within 24 hours.');
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      longDescription: '',
      price: '',
      category: '',
      model: '',
      responseTime: '',
      capabilities: '',
      languages: '',
      tags: '',
    });

    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            List Your AI Agent
          </h1>
          <p className="text-lg text-gray-600">
            Join thousands of developers earning from their AI agents
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Earn Revenue</h3>
            <p className="text-sm text-gray-600">Keep 85% of sales</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Reach Customers</h3>
            <p className="text-sm text-gray-600">10,000+ active buyers</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Easy Setup</h3>
            <p className="text-sm text-gray-600">List in minutes</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CustomerCare Pro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your AI agent"
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/150 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Description *
                  </label>
                  <textarea
                    name="longDescription"
                    required
                    value={formData.longDescription}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of features, use cases, and benefits"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Content Creation">Content Creation</option>
                      <option value="Data Analysis">Data Analysis</option>
                      <option value="Automation">Automation</option>
                      <option value="Research">Research</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="99.99"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="pt-6 border-t">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Technical Details
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      required
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., GPT-4 based"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response Time *
                    </label>
                    <input
                      type="text"
                      name="responseTime"
                      required
                      value={formData.responseTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., < 2 seconds"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Capabilities *
                  </label>
                  <textarea
                    name="capabilities"
                    required
                    value={formData.capabilities}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter each capability on a new line"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    One capability per line
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supported Languages *
                  </label>
                  <input
                    type="text"
                    name="languages"
                    required
                    value={formData.languages}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., English, Spanish, French"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., chatbot, automation, customer-service"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated tags
                  </p>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="pt-6 border-t">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Media
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload agent preview image</p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG up to 5MB. Recommended: 800x600px
                </p>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Submit for Review
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Your agent will be reviewed within 24 hours. You'll receive an email once it's approved.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellAgent;
