import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Upload, 
  Brain, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  Target, 
  CheckCircle,
  ArrowRight,
  FileText,
  Zap,
  Users,
  Star
} from 'lucide-react';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { useNotes } from '@/context/NoteContext';
import { config } from '@/config';

const Homepage: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const navigate = useNavigate();
  const { notes, fetchNotes } = useNotes();

  // Fetch notes on component mount to check if user has existing notes
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // If user has notes, we can show a different UI or offer to go to dashboard
  const hasNotes = notes.length > 0;

  const handleGetStarted = () => {
    if (hasNotes) {
      navigate('/dashboard');
    } else {
      setShowUploader(true);
    }
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      const offset = 80; // Account for header height
      const elementPosition = featuresSection.offsetTop - offset;
      window.scrollTo({ 
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    // Set session access before navigating
    sessionStorage.setItem('dashboardUploadAccess', 'true');
    navigate('/dashboard?from=upload');
  };

  const features = [
    {
      icon: <Brain className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes your notes and extracts key concepts automatically",
      gradient: "from-amber-500 via-amber-600 to-orange-500"
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "Smart Explanations",
      description: "Get detailed explanations and learning insights tailored to your content",
      gradient: "from-amber-600 via-orange-500 to-orange-600"
    },
    {
      icon: <HelpCircle className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "Interactive Quizzes",
      description: "Generate practice quizzes to test your understanding and retention",
      gradient: "from-orange-500 via-amber-600 to-amber-600"
    },
    {
      icon: <BookOpen className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "Study Materials",
      description: "Transform notes into comprehensive study materials and summaries",
      gradient: "from-amber-500 via-amber-600 to-amber-600"
    },
    {
      icon: <Target className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "Focused Learning",
      description: "Focus mode helps you concentrate on key concepts and learning objectives",
      gradient: "from-orange-600 via-amber-700 to-amber-700"
    },
    {
      icon: <Sparkles className="h-10 w-10 text-white drop-shadow-sm" />,
      title: "Smart Insights",
      description: "Discover learning patterns and get personalized study recommendations",
      gradient: "from-amber-600 via-orange-600 to-orange-700"
    }
  ];

  const stats = [
    { icon: <FileText className="h-6 w-6" />, label: "Notes Processed", value: "10K+" },
    { icon: <Zap className="h-6 w-6" />, label: "AI Summaries", value: "5K+" },
    { icon: <Users className="h-6 w-6" />, label: "Active Learners", value: "1K+" },
    { icon: <Star className="h-6 w-6" />, label: "Success Rate", value: "98%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-50/50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                  {config.app.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {config.app.description}
                </p>
              </div>
              {/* Mobile title */}
              <h1 className="block sm:hidden text-lg font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                StudyAI
              </h1>
            </button>
            <Badge variant="secondary" className="hidden sm:inline-flex ml-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <span className="hidden sm:inline">
                {hasNotes ? 'Go to Dashboard' : 'Get Started'}
              </span>
              <span className="sm:hidden">
                {hasNotes ? 'Dashboard' : 'Start'}
              </span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl h-20 sm:h-20  font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent leading-tight">
            Transform Notes into Knowledge
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
            Upload your study materials and let AI create personalized summaries, explanations, and quizzes to accelerate your learning journey.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {hasNotes ? 'View Dashboard' : 'Upload Your First Note'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleLearnMore}
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Learn More
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-1 sm:mb-2 text-amber-600">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="container mx-auto px-4 py-12 sm:py-20">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
            Powerful Features for Smarter Learning
          </h3>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover how AI can revolutionize your study experience with these innovative features
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-105 group">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl border-2 border-white/30 group-hover:shadow-amber-500/25 group-hover:scale-110 transition-all duration-300 group-hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.25)]`}>
                    <div className="scale-75 sm:scale-100">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 group-hover:text-amber-700 transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 bg-white/50 backdrop-blur-sm">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
            How It Works
          </h3>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Get started in minutes with our simple 3-step process
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Upload Your Notes",
              description: "Upload images of your handwritten notes, textbooks, or study materials",
              icon: <Upload className="h-8 w-8" />
            },
            {
              step: "2",
              title: "AI Processing",
              description: "Our AI analyzes and extracts key information from your content",
              icon: <Brain className="h-8 w-8" />
            },
            {
              step: "3",
              title: "Learn & Practice",
              description: "Access summaries, explanations, and quizzes to enhance your learning",
              icon: <CheckCircle className="h-8 w-8" />
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white shadow-lg">
                <div className="scale-75 sm:scale-100">
                  {step.icon}
                </div>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-amber-600 mb-2">STEP {step.step}</div>
              <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">{step.title}</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <motion.div 
          className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Transform Your Learning?
          </h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
            Join thousands of students who are already using StudyAI to accelerate their learning journey
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-amber-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {hasNotes ? 'Go to Dashboard' : 'Start Learning Now'}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              StudyAI
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            © 2025 StudyAI. Transform your notes into knowledge.
          </p>
        </div>
      </footer>

      {/* Upload Modal */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 bg-gradient-to-br from-background to-amber-50/40 mx-4" aria-describedby="upload-dialog-description">
          <div className="sr-only">
            <h2 id="upload-dialog-title">Upload Notes</h2>
            <p id="upload-dialog-description">Upload your note images to generate AI-powered study materials</p>
          </div>
          <NoteUploader 
            onClose={handleUploadComplete} 
            autoNavigateOnUpload={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Homepage;
