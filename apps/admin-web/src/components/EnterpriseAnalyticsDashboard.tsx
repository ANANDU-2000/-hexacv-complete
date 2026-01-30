import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  funnel: {
    pageVisits: number;
    resumeUploads: number;
    templateViews: number;
    paidTemplateClicks: number;
    paymentsInitiated: number;
    paymentsVerified: number;
    downloads: number;
  };
  conversionRate: number;
  roles: Array<{
    role: string;
    search_count: number;
    template_selections: number;
    avg_conversion_rate: number;
  }>;
  templates: Array<{
    templateId: string;
    name: string;
    views: number;
    clicks: number;
    payments: number;
    conversionRate: string;
    revenue: number;
  }>;
}

const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchData = async () => {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      setTimeout(() => {
        setAnalyticsData({
          funnel: {
            pageVisits: 12450,
            resumeUploads: 3240,
            templateViews: 2890,
            paidTemplateClicks: 1420,
            paymentsInitiated: 890,
            paymentsVerified: 756,
            downloads: 2100
          },
          conversionRate: 23.3,
          roles: [
            { role: 'Software Engineer', search_count: 1240, template_selections: 890, avg_conversion_rate: 71.8 },
            { role: 'Product Manager', search_count: 980, template_selections: 654, avg_conversion_rate: 66.7 },
            { role: 'Data Scientist', search_count: 756, template_selections: 512, avg_conversion_rate: 67.7 },
            { role: 'UX Designer', search_count: 634, template_selections: 421, avg_conversion_rate: 66.4 },
            { role: 'DevOps Engineer', search_count: 523, template_selections: 387, avg_conversion_rate: 74.0 }
          ],
          templates: [
            { templateId: 'tech', name: 'Tech Modern', views: 1200, clicks: 890, payments: 654, conversionRate: '73.5', revenue: 32700 },
            { templateId: 'modern', name: 'Modern Tech', views: 1100, clicks: 780, payments: 523, conversionRate: '67.1', revenue: 26150 },
            { templateId: 'executive', name: 'Executive', views: 950, clicks: 650, payments: 421, conversionRate: '64.8', revenue: 42100 },
            { templateId: 'template1free', name: 'Classic ATS', views: 800, clicks: 320, payments: 45, conversionRate: '14.1', revenue: 0 }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [dateRange]);

  const calculateFunnelRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Intelligence Dashboard</h1>
          <p className="text-gray-600">Monitor market dynamics and optimize decision parameters</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <button 
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Visitors</p>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.funnel.pageVisits.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-1">↑ 12.4% from last period</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Resume Uploads</p>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.funnel.resumeUploads.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-1">↑ 8.2% from last period</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-600">{analyticsData.conversionRate}%</p>
            <p className="text-xs text-green-500 mt-1">↑ 3.1% from last period</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Revenue Generated</p>
            <p className="text-2xl font-bold text-gray-900">$81,000</p>
            <p className="text-xs text-green-500 mt-1">↑ 15.7% from last period</p>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Conversion Funnel</h2>
            <p className="text-gray-600">Track user journey from visit to download</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between">
              {[
                { label: 'Visits', value: analyticsData.funnel.pageVisits, rate: '100%' },
                { label: 'Resumes', value: analyticsData.funnel.resumeUploads, rate: calculateFunnelRate(analyticsData.funnel.resumeUploads, analyticsData.funnel.pageVisits) + '%' },
                { label: 'Template Views', value: analyticsData.funnel.templateViews, rate: calculateFunnelRate(analyticsData.funnel.templateViews, analyticsData.funnel.resumeUploads) + '%' },
                { label: 'Payments', value: analyticsData.funnel.paymentsVerified, rate: calculateFunnelRate(analyticsData.funnel.paymentsVerified, analyticsData.funnel.paidTemplateClicks) + '%' },
                { label: 'Downloads', value: analyticsData.funnel.downloads, rate: 'N/A' }
              ].map((stage, index) => (
                <div key={stage.label} className="text-center mb-6 md:mb-0">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-800">{stage.value.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">{stage.label}</p>
                  <p className="text-sm text-gray-500">{stage.rate}</p>
                  
                  {index < 4 && (
                    <div className="hidden md:block absolute top-1/2 transform -translate-y-1/2 left-full w-8 text-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Demand Trends */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Role Demand Trends</h2>
              <p className="text-gray-600">Most searched roles and their conversion rates</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Searches</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selections</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.roles.map((role, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.role}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{role.search_count.toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{role.template_selections.toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${role.avg_conversion_rate > 70 ? 'bg-green-100 text-green-800' : 
                              role.avg_conversion_rate > 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {role.avg_conversion_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Template Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Template Performance</h2>
              <p className="text-gray-600">Revenue and conversion metrics by template</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.templates.map((template, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{template.views.toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{template.clicks.toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${parseFloat(template.conversionRate) > 70 ? 'bg-green-100 text-green-800' : 
                              parseFloat(template.conversionRate) > 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {template.conversionRate}%
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${template.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Promote Tech Modern template - highest conversion rate at 73.5%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>Improve Classic ATS template - lowest conversion at 14.1%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Focus marketing on high-demand roles: Software Engineer, Product Manager</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Governance Controls */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Governance Controls</h2>
            <p className="text-gray-600">Manage decision parameters and system configuration</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Role Weights</h3>
                <div className="space-y-3">
                  {['Tech', 'Creative', 'Business', 'Other'].map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{category} Roles</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={category === 'Tech' ? 90 : category === 'Creative' ? 70 : 60}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-500 w-10">
                        {category === 'Tech' ? 90 : category === 'Creative' ? 70 : 60}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Template Availability</h3>
                <div className="space-y-2">
                  {analyticsData.templates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{template.name}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={index < 3} // First 3 templates enabled by default
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-'' after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Decision Audit Log</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>[2023-05-15 14:32:45] - System recommended Tech Modern for Software Engineer profile</p>
                  <p>[2023-05-15 14:30:22] - Template ranking algorithm updated to v2.1</p>
                  <p>[2023-05-15 14:28:11] - Role detection confidence threshold adjusted to 85%</p>
                  <p>[2023-05-15 14:25:03] - Executive template promoted for senior roles</p>
                  <p>[2023-05-15 14:22:17] - New role category "DevOps" added to system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;