'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  MessageCircle, 
  Target, 
  BarChart3, 
  Brain, 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Clock,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      <Header variant="landing" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Master{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Clear Communication
                </span>{' '}
                with AI
              </h1>
              <p className="mt-6 text-xl text-gray-600 sm:max-w-3xl">
                Transform your professional communication skills through daily practice. 
                Get instant AI feedback, track your progress, and build confidence in every conversation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center text-sm text-gray-500 sm:justify-center lg:justify-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                No credit card required
              </div>
            </div>
            <div className="mt-16 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">"I need to present our quarterly results to the board..."</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">AI Analysis</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">8.5/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Great structure! Try opening with the key insight to grab attention immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to communicate with confidence
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed to accelerate your communication improvement
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Feedback</h3>
              <p className="text-gray-600">
                Get instant, personalized feedback on clarity, structure, and impact from advanced AI.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-purple-100 rounded-xl mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Structured Practice</h3>
              <p className="text-gray-600">
                Daily practice sessions focused on real-world scenarios you encounter at work.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your improvement over time with detailed analytics and achievement badges.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-yellow-100 rounded-xl mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Sessions</h3>
              <p className="text-gray-600">
                Improve in just 5-10 minutes a day with bite-sized practice sessions.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-indigo-100 rounded-xl mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Goals</h3>
              <p className="text-gray-600">
                Set and track custom goals that align with your professional development needs.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 bg-red-100 rounded-xl mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your practice sessions and data are completely private and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start improving your communication in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center items-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Scenario</h3>
              <p className="text-gray-600">
                Select from common workplace communication scenarios or create your own custom practice topic.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Practice & Record</h3>
              <p className="text-gray-600">
                Write or speak your response, focusing on clarity, structure, and key messages you want to convey.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center items-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get AI Feedback</h3>
              <p className="text-gray-600">
                Receive instant, actionable feedback with suggestions for improvement and alternative approaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Practice Sessions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">2.5x</div>
              <div className="text-gray-600">Faster Improvement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your communication?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of professionals who have improved their communication skills with Clarity Coach
          </p>
          <div className="mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-blue-100">
            No credit card required • Start practicing in 30 seconds
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
