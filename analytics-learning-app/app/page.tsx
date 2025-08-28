import { CheckSquare, BarChart3, MessageSquare, Settings, TrendingUp, Users, Target } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-blue-200 px-8 py-4 rounded-2xl text-sm font-semibold mb-12 shadow-lg">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            Interactive Learning Platform
          </div>
          
          <h1 className="text-6xl font-bold mb-8 leading-tight">
            Analytics Learning
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block mt-2"> Laboratory</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Master product analytics, A/B testing, and user feedback collection through hands-on experience with real data and interactive dashboards in a beautiful, modern environment.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-sm text-gray-500 font-medium">Analytics Concepts</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-2">3</div>
              <div className="text-sm text-gray-500 font-medium">Feedback Types</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
              <div className="text-sm text-gray-500 font-medium">A/B Experiment</div>
            </div>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6">
                <CheckSquare className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Checklists</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Create and complete tasks while we track user behavior patterns and engagement metrics with real-time analytics.
              </p>
            </div>
            <Link href="/checklists" className="inline-block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-teal-600">Analytics Lab</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Explore interactive dashboards with real-time charts, funnels, and retention analysis powered by modern visualization.
              </p>
            </div>
            <Link href="/lab" className="inline-block w-full px-4 py-3 bg-teal-600 text-white text-center rounded-lg font-medium hover:bg-teal-700 transition-colors">
              View Dashboard
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-purple-600">Feedback</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Experience NPS surveys, micro-feedback, and bug reporting with advanced sentiment analysis and insights.
              </p>
            </div>
            <Link href="/feedback" className="inline-block w-full px-4 py-3 bg-purple-600 text-white text-center rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Give Feedback
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <div className="w-14 h-14 bg-gray-600 text-white rounded-2xl flex items-center justify-center mb-6">
                <Settings className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-700">Admin Panel</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Control feature flags, generate demo data, and simulate realistic user traffic with advanced controls.
              </p>
            </div>
            <Link href="/admin" className="inline-block w-full px-4 py-3 border-2 border-gray-600 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Learning Path */}
        <section className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-3xl p-12 lg:p-16 shadow-xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Learning Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Follow these steps to master product analytics concepts through hands-on experience in our modern learning laboratory
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-bold mx-auto mb-8 text-2xl shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-600">Explore & Create</h3>
              <p className="text-gray-600 leading-relaxed">
                Create checklists and interact with the app to generate real usage data for analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-teal-600 text-white rounded-3xl flex items-center justify-center font-bold mx-auto mb-8 text-2xl shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-teal-600">Analyze & Learn</h3>
              <p className="text-gray-600 leading-relaxed">
                Study the analytics dashboard to understand user behavior patterns and metrics
              </p>
            </div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-3xl flex items-center justify-center font-bold mx-auto mb-8 text-2xl shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-purple-600">Experiment & Optimize</h3>
              <p className="text-gray-600 leading-relaxed">
                Run A/B tests and make data-driven decisions to improve the product experience
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/checklists" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg">
              Start Your Journey
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}