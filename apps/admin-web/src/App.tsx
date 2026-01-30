import { useState, useEffect } from 'react'
import { Shield, TrendingUp, FileText, Users, Star, MessageSquare, BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react'
import EnterpriseAnalyticsDashboard from './components/EnterpriseAnalyticsDashboard'

// @ts-ignore - Vite env
const API_BASE = 'http://localhost:3001'

interface Feedback {
  id: string;
  rating: number;
  message: string;
  user_name: string;
  template_id: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  five_star: number;
  four_star: number;
  three_star: number;
  low_rating: number;
  avg_rating: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'templates' | 'analytics' | 'enterprise'>('overview')
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackStats, setFeedbackStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/feedback/admin`, {
        headers: { 'x-admin-password': adminPassword }
      })
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(data.feedbacks)
      }
    } catch (e) {
      console.error('Failed to fetch feedbacks', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feedback/stats`, {
        headers: { 'x-admin-password': adminPassword }
      })
      if (res.ok) {
        const data = await res.json()
        setFeedbackStats(data.stats)
      }
    } catch (e) {
      console.error('Failed to fetch stats', e)
    }
  }

  const handleApproveFeedback = async (id: string, approve: boolean) => {
    try {
      await fetch(`${API_BASE}/api/feedback/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ isApproved: approve })
      })
      fetchFeedbacks()
      fetchStats()
    } catch (e) {
      console.error('Failed to update feedback', e)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeedbacks()
      fetchStats()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-center text-slate-600 mb-8">
            HexaResume Control Panel
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              🚧 Admin authentication system in development
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">HexaResume Admin</h1>
                <p className="text-xs text-slate-500">Control Panel</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'enterprise', label: 'Enterprise', icon: <Shield className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Feedbacks"
            value={feedbackStats?.total?.toString() || '0'}
            change={`${feedbackStats?.approved || 0} approved`}
            color="blue"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Average Rating"
            value={feedbackStats?.avg_rating?.toFixed(1) || '0.0'}
            change={`${feedbackStats?.five_star || 0} five-star`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Pending Review"
            value={feedbackStats?.pending?.toString() || '0'}
            change="awaiting approval"
            color="orange"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="5-Star Reviews"
            value={feedbackStats?.five_star?.toString() || '0'}
            change={`${((feedbackStats?.five_star || 0) / (feedbackStats?.total || 1) * 100).toFixed(0)}% of total`}
            color="purple"
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Feedback</h2>
                {feedbacks.slice(0, 5).map((fb) => (
                  <div key={fb.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-900">{fb.user_name}</p>
                      <p className="text-sm text-slate-500 truncate max-w-xs">{fb.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">{'★'.repeat(fb.rating)}</span>
                      {fb.is_approved ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approved</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Rating Distribution</h2>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stars === 5 ? feedbackStats?.five_star : stars === 4 ? feedbackStats?.four_star : stars === 3 ? feedbackStats?.three_star : feedbackStats?.low_rating || 0
                    const percent = ((count || 0) / (feedbackStats?.total || 1)) * 100
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-12 text-sm text-slate-600">{stars} star</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-12 text-sm text-slate-500 text-right">{count || 0}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Manage Feedback</h2>
                <button onClick={fetchFeedbacks} className="text-sm text-blue-600 hover:text-blue-700">
                  Refresh
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-slate-400">Loading...</div>
              ) : feedbacks.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No feedback yet</div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-6 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">{fb.user_name}</span>
                          <span className="text-yellow-500">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                          {fb.is_approved ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-2">{fb.message}</p>
                        <p className="text-xs text-slate-400">Template: {fb.template_id || 'N/A'} • {new Date(fb.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!fb.is_approved && (
                          <button
                            onClick={() => handleApproveFeedback(fb.id, true)}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        )}
                        {fb.is_approved && (
                          <button
                            onClick={() => handleApproveFeedback(fb.id, false)}
                            className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                          >
                            <XCircle className="w-4 h-4" /> Unapprove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Template Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'template1free', name: 'Classic Free', price: 'Free', color: 'green' },
                { id: 'classic', name: 'Modern Tech', price: '₹49', color: 'blue' },
                { id: 'modern', name: 'Minimal Executive', price: '₹99', color: 'purple' },
                { id: 'minimal', name: 'Creative Pro', price: '₹149', color: 'orange' },
              ].map((template) => (
                <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-slate-100 h-32 rounded-lg mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900">{template.name}</h3>
                  <p className={`text-sm font-semibold text-${template.color}-600`}>{template.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">🚧 Full template CRUD operations coming soon</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{feedbackStats?.total || 0}</p>
                  <p className="text-sm text-slate-600">Total Feedbacks</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{feedbackStats?.avg_rating?.toFixed(1) || 0}</p>
                  <p className="text-sm text-slate-600">Avg Rating</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{((feedbackStats?.approved || 0) / (feedbackStats?.total || 1) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-slate-600">Approval Rate</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">🚧 Advanced analytics with charts coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise Analytics Tab */}
        {activeTab === 'enterprise' && (
          <EnterpriseAnalyticsDashboard />
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, title, value, change, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-green-600">{change}</span>
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default App
