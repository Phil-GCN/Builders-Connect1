import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Community: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Community</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with ambitious builders who understand the journey
            </p>
          </div>

          {!user ? (
            <div className="max-w-2xl mx-auto text-center bg-gray-50 rounded-2xl p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Community</h2>
              <p className="text-gray-600 mb-8">
                Sign up to access discussions, connect with fellow builders, and share your journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg">Create Account</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Discussions</h2>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Discussion Topic {i}</h3>
                        <p className="text-gray-600 mb-4">
                          Sample discussion content about building wealth, freedom, and intentional living...
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            12 replies
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            24 likes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Community;
