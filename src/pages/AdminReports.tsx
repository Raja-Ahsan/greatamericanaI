import { FileText, Download, Calendar } from 'lucide-react';

const AdminReports = () => {
  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Generate and download platform reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Report</h3>
          <p className="text-gray-600 text-sm mb-4">Complete list of all platform users</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-green-600" />
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Report</h3>
          <p className="text-gray-600 text-sm mb-4">Revenue and sales statistics</p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Agent Report</h3>
          <p className="text-gray-600 text-sm mb-4">All agent listings and performance</p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
