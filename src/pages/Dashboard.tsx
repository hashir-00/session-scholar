import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Brain, FileText, Loader2, Sparkles, TrendingUp, Users, Star, MessageSquare, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const { notes, fetchNotes, isLoading } = useNotes();
  const navigate = useNavigate();

  // Mock explanation data
  const mockExplanations = [
    {
      id: 'exp_1',
      title: 'Mathematical Foundations',
      subject: 'Calculus',
      description: 'Core concepts of differential and integral calculus explained through visual examples and real-world applications.',
      keyPoints: [
        'Derivatives measure rates of change',
        'Integrals calculate areas under curves',
        'Fundamental theorem connects both concepts',
        'Applications in physics and engineering'
      ],
      difficulty: 'Intermediate',
      estimatedTime: '15 min read',
      lastUpdated: '2 days ago'
    },
    {
      id: 'exp_2',
      title: 'Chemical Bonding Theory',
      subject: 'Chemistry',
      description: 'Understanding how atoms interact to form molecules through ionic, covalent, and metallic bonds.',
      keyPoints: [
        'Electron sharing vs electron transfer',
        'Bond strength and stability factors',
        'Molecular geometry predictions',
        'Impact on material properties'
      ],
      difficulty: 'Advanced',
      estimatedTime: '12 min read',
      lastUpdated: '1 day ago'
    },
    {
      id: 'exp_3',
      title: 'Literary Analysis Framework',
      subject: 'English Literature',
      description: 'Systematic approach to analyzing themes, characters, and literary devices in classic and modern texts.',
      keyPoints: [
        'Identifying central themes and motifs',
        'Character development analysis',
        'Symbolic meaning interpretation',
        'Historical context consideration'
      ],
      difficulty: 'Beginner',
      estimatedTime: '8 min read',
      lastUpdated: '3 days ago'
    },
    {
      id: 'exp_4',
      title: 'Economic Market Principles',
      subject: 'Economics',
      description: 'Supply and demand dynamics, market equilibrium, and factors affecting price determination.',
      keyPoints: [
        'Supply and demand curves',
        'Market equilibrium points',
        'External factors affecting markets',
        'Government intervention effects'
      ],
      difficulty: 'Intermediate',
      estimatedTime: '10 min read',
      lastUpdated: '4 days ago'
    }
  ];

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  const completedNotes = notes.filter(note => note.status === 'completed');
  const processingNotes = notes.filter(note => note.status === 'processing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Modern Header */}
      <header className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-accent flex items-center justify-center shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  StudyAI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Transform notes into knowledge
                </p>
              </div>
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                onClick={() => setShowUploader(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-6"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Notes
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 && !isLoading ? (
          /* Enhanced Empty State */
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto w-32 h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-accent/20 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse"></div>
              <FileText className="h-16 w-16 text-primary z-10" />
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome to StudyAI
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Transform your handwritten notes into intelligent study materials. 
                Our AI creates summaries, extracts key concepts, and generates personalized quizzes.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {[
                {
                  icon: <FileText className="h-8 w-8 text-blue-500" />,
                  title: "Smart Upload",
                  description: "Drag & drop your notes and watch AI extract every detail",
                  gradient: "from-blue-500/10 to-cyan-500/10"
                },
                {
                  icon: <Brain className="h-8 w-8 text-purple-500" />,
                  title: "AI Processing",
                  description: "Advanced OCR and NLP to understand your content",
                  gradient: "from-purple-500/10 to-pink-500/10"
                },
                {
                  icon: <BookOpen className="h-8 w-8 text-green-500" />,
                  title: "Interactive Learning",
                  description: "Get summaries, flashcards, and adaptive quizzes",
                  gradient: "from-green-500/10 to-emerald-500/10"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className={`p-8 text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm`}>
                    <div className="h-16 w-16 rounded-2xl bg-white/80 shadow-lg flex items-center justify-center mx-auto mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Stats Row */}
            <motion.div 
              className="flex justify-center gap-8 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { icon: <TrendingUp className="h-5 w-5" />, value: "98%", label: "Accuracy" },
                { icon: <Users className="h-5 w-5" />, value: "10K+", label: "Students" },
                { icon: <Star className="h-5 w-5" />, value: "4.9", label: "Rating" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {stat.icon}
                    <span className="text-2xl font-bold text-primary">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <Button 
                size="lg"
                onClick={() => setShowUploader(true)}
                className="bg-gradient-to-r from-primary via-purple-500 to-accent hover:opacity-90 shadow-xl h-14 px-8 text-lg"
              >
                <Sparkles className="h-6 w-6 mr-3" />
                Start Your AI Learning Journey
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* Enhanced Tabbed Content */
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading && (
              <motion.div 
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mx-auto animate-spin">
                    <Loader2 className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-medium">Loading your study materials...</p>
                </div>
              </motion.div>
            )}

            <Tabs defaultValue="processing" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border shadow-lg h-12">
                <TabsTrigger 
                  value="processing" 
                  className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  AI Processing
                  {processingNotes.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-1">
                      {processingNotes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Ready to Study
                  {completedNotes.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 ml-1">
                      {completedNotes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="explanations" 
                  className="text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Explanations
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 ml-1">
                    {mockExplanations.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="processing" className="space-y-6">
                {processingNotes.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                        </div>
                        AI Processing Your Notes
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {processingNotes.map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <NoteCard
                            note={note}
                            onClick={() => handleNoteClick(note.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                      <Brain className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No notes processing</h3>
                    <p className="text-muted-foreground">Upload some notes to see AI processing in action!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {completedNotes.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        Ready for Learning
                      </h2>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Study All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {completedNotes.map((note, index) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <NoteCard
                            note={note}
                            onClick={() => handleNoteClick(note.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No completed notes</h3>
                    <p className="text-muted-foreground">Your processed notes will appear here when ready!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="explanations" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      AI Generated Explanations
                    </h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Target className="h-4 w-4" />
                      Generate More
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockExplanations.map((explanation, index) => (
                      <motion.div
                        key={explanation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <Lightbulb className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{explanation.title}</h3>
                                <p className="text-sm text-purple-600 font-medium">{explanation.subject}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`${
                                explanation.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                explanation.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {explanation.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {explanation.description}
                          </p>
                          
                          <div className="space-y-3 mb-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Target className="h-4 w-4 text-purple-500" />
                              Key Points:
                            </h4>
                            <ul className="space-y-1">
                              {explanation.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {explanation.estimatedTime}
                              </span>
                              <span>Updated {explanation.lastUpdated}</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-8 px-3 text-xs border-purple-200 hover:bg-purple-50">
                              Read More
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>

      {/* Enhanced Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 bg-gradient-to-br from-background to-secondary/30" aria-describedby="upload-dialog-description">
          <div className="sr-only">
            <h2 id="upload-dialog-title">Upload Notes</h2>
            <p id="upload-dialog-description">Upload your note images to generate AI-powered study materials</p>
          </div>
          <NoteUploader onClose={() => setShowUploader(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;