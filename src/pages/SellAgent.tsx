import { useState, useRef } from 'react';
import { Upload, DollarSign, Tag, FileText, File, X, Video, Image as ImageIcon, Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const SellAgent = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isVendorRoute = location.pathname.startsWith('/vendor');
  
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentFileName, setAgentFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Media fields
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Step validation functions
  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1: // Basic Information
        if (!formData.name || !formData.description || !formData.longDescription || !formData.price || !formData.category) {
          setError('Please fill in all required fields in Basic Information');
          return false;
        }
        return true;
      case 2: // Technical Details
        if (!formData.model || !formData.responseTime || !formData.capabilities || !formData.languages) {
          setError('Please fill in all required fields in Technical Details');
          return false;
        }
        return true;
      case 3: // Media & Visuals (optional, no validation needed)
        return true;
      case 4: // Agent Files (optional, no validation needed)
        return true;
      case 5: // Review (final validation)
        if (!formData.name || !formData.description || !formData.longDescription || !formData.price || !formData.category) {
          setError('Please complete all required fields');
          return false;
        }
        if (!formData.model || !formData.responseTime || !formData.capabilities || !formData.languages) {
          setError('Please complete all required fields');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setError('');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleStepClick = (step: number) => {
    // Allow going back to previous steps
    if (step < currentStep) {
      setCurrentStep(step);
      setError('');
    } else if (step === currentStep) {
      // If clicking current step, validate and allow if valid
      if (validateStep(step) && step < totalSteps) {
        setCurrentStep(step + 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('You must be logged in to list an agent');
      return;
    }

    // Final validation
    if (!validateStep(5)) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add agent data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('longDescription', formData.longDescription);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('responseTime', formData.responseTime);
      formDataToSend.append('capabilities', JSON.stringify(formData.capabilities.split('\n').filter(c => c.trim())));
      formDataToSend.append('languages', JSON.stringify(formData.languages.split(',').map(l => l.trim()).filter(l => l)));
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      formDataToSend.append('image', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop');
      formDataToSend.append('api_access', 'true');

      // Add agent file if selected
      if (agentFile) {
        formDataToSend.append('agent_file', agentFile);
      }

      // Add video (file or URL)
      if (videoFile) {
        formDataToSend.append('video_file', videoFile);
      } else if (videoUrl) {
        formDataToSend.append('video_url', videoUrl);
      }

      // Add thumbnail image
      if (thumbnailFile) {
        formDataToSend.append('thumbnail_image', thumbnailFile);
      }

      // Add gallery images
      galleryImages.forEach((image, index) => {
        formDataToSend.append(`gallery_images[${index}]`, image);
      });

      const response = await api.post<{ success: boolean; message?: string; data?: any }>('/agents', formDataToSend);

      if (response.success) {
        setSuccess('Agent submitted for review! We will contact you within 24 hours.');
        
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
        setAgentFile(null);
        setAgentFileName('');
        setVideoFile(null);
        setVideoFileName('');
        setVideoUrl('');
        setThumbnailFile(null);
        setThumbnailPreview('');
        setGalleryImages([]);
        setGalleryPreviews([]);

        // Navigate after a short delay
        setTimeout(() => {
          if (user?.role === 'vendor' || isVendorRoute) {
            navigate('/vendor/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setError(response.message || 'Failed to submit agent. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (zip or rar)
      const validTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.rar'];
      const validExtensions = ['.zip', '.rar'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        setError('Please upload a ZIP or RAR file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }

      setAgentFile(file);
      setAgentFileName(file.name);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setAgentFile(null);
    setAgentFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB max
        setError('Video size must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setVideoFileName(file.name);
      setVideoUrl(''); // Clear URL if file is selected
      setError('');
    }
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    if (e.target.value) {
      setVideoFile(null);
      setVideoFileName('');
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoFileName('');
    setVideoUrl('');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail size must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be less than 5MB');
          return false;
        }
        return true;
      });

      if (validFiles.length + galleryImages.length > 10) {
        setError('Maximum 10 images allowed in gallery');
        return;
      }

      setGalleryImages([...galleryImages, ...validFiles]);
      
      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      setError('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Agent</h1>
          <p className="text-gray-600">List your AI agent for sale on the marketplace</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

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

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            {['Basic Information', 'Technical Details', 'Media & Visuals', 'Agent Files', 'Review & Submit'].map((title, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              const isAccessible = stepNum <= currentStep;
              
              return (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className="flex items-center flex-1">
                    <button
                      type="button"
                      onClick={() => handleStepClick(stepNum)}
                      disabled={!isAccessible}
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-green-600 text-white ring-4 ring-green-200'
                          : 'bg-gray-200 text-gray-500'
                      } ${isAccessible ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : stepNum}
                    </button>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        Step {stepNum}
                      </p>
                      <p className={`text-xs ${isCurrent ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                        {title}
                      </p>
                    </div>
                  </div>
                  {stepNum < totalSteps && (
                    <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'} rounded hidden md:block`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
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
            )}

            {/* Step 2: Technical Details */}
            {currentStep === 2 && (
              <div>
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
            )}

            {/* Step 3: Media & Visuals */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Media & Visuals
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Add visual content to showcase your AI agent (all fields are optional)
                </p>

              {/* Video Demo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Demo
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a video file or provide a video URL (YouTube, Vimeo, etc.)
                </p>
                
                {videoFile ? (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{videoFileName}</p>
                          <p className="text-sm text-gray-600">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-8 h-8 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Video URL</p>
                          <p className="text-sm text-gray-600 truncate">{videoUrl}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload Video File</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Video file up to 500MB (MP4, AVI, MOV, etc.)
                      </p>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Choose Video File
                      </button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center text-gray-500">OR</div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={handleVideoUrlChange}
                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a thumbnail image for your agent (recommended: 800x600px)
                </p>
                
                {thumbnailPreview ? (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Thumbnail Image</p>
                          <p className="text-sm text-gray-600">
                            {thumbnailFile ? `${(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Preview'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload Thumbnail Image</p>
                    <p className="text-sm text-gray-500 mb-4">
                      PNG, JPG up to 5MB. Recommended: 800x600px
                    </p>
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Choose Image
                    </button>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Gallery
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload multiple images to showcase your AI agent (max 10 images)
                </p>
                
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {galleryImages.length < 10 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Add Gallery Images</p>
                    <p className="text-sm text-gray-500 mb-4">
                      PNG, JPG up to 5MB each. {galleryImages.length}/10 images
                    </p>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Add Images
                    </button>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Step 4: Agent Files */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Agent Application Files
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Upload the final ZIP or RAR file containing your AI Agent application. Customers will be able to download this file after purchase. (Optional)
                </p>

              {agentFile ? (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{agentFileName}</p>
                        <p className="text-sm text-gray-600">
                          {(agentFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload Agent Application Files</p>
                  <p className="text-sm text-gray-500 mb-4">
                    ZIP or RAR file up to 100MB. This file will be available for download by customers after purchase.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.rar,.ZIP,.RAR"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Review & Submit
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please review all information before submitting your agent for review.
                </p>

                {/* Review Summary */}
                <div className="space-y-6">
                  {/* Basic Information Review */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {formData.name}</p>
                      <p><span className="font-medium">Description:</span> {formData.description}</p>
                      <p><span className="font-medium">Category:</span> {formData.category}</p>
                      <p><span className="font-medium">Price:</span> ${formData.price}</p>
                    </div>
                  </div>

                  {/* Technical Details Review */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Technical Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Model:</span> {formData.model}</p>
                      <p><span className="font-medium">Response Time:</span> {formData.responseTime}</p>
                      <p><span className="font-medium">Languages:</span> {formData.languages}</p>
                    </div>
                  </div>

                  {/* Media Review */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Media & Visuals</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Video:</span> {videoFile ? videoFileName : videoUrl || 'Not provided'}</p>
                      <p><span className="font-medium">Thumbnail:</span> {thumbnailFile ? 'Uploaded' : 'Not provided'}</p>
                      <p><span className="font-medium">Gallery Images:</span> {galleryImages.length} image(s)</p>
                    </div>
                  </div>

                  {/* Agent Files Review */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Agent Files</h3>
                    <div className="text-sm">
                      <p><span className="font-medium">Application File:</span> {agentFile ? agentFileName : 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit for Review
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Your agent will be reviewed within 24 hours. You'll receive an email once it's approved.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellAgent;
