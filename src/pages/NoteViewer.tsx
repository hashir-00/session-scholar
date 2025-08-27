import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, BookOpen, HelpCircle, Loader2, Brain, MessageSquare, CheckCircle, Eye, EyeOff, Sparkles, Download } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { Note } from '@/api/noteService';
import { TextReader } from '@/components/notes/TextReader';
import { ExplanationRenderer } from '@/components/notes/ExplanationRenderer';
import { QuizComponents } from '@/components/quiz/QuizComponents';
import { DownloadSection } from '@/components/notes/DownloadSection';
import { downloadPDF } from '@/components/notes/PDFGenerator';
import { config } from '@/config';

const NoteViewer: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { fetchNote, generateQuiz, generateExplanation } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState<{
    quiz: boolean;
    explanation: boolean;
  }>({ quiz: false, explanation: false });
  const [activeTab, setActiveTab] = useState('summary');
  const [focusMode, setFocusMode] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) return;
      
      setLoading(true);
      const fetchedNote = await fetchNote(noteId);
      setNote(fetchedNote);
      setLoading(false);
    };

    loadNote();
  }, [noteId, fetchNote]);

  // Polling for updates when content is being generated
  useEffect(() => {
    if (!note || !noteId) return;

    const shouldPoll = generatingContent.quiz || generatingContent.explanation;
    if (!shouldPoll) return;

    const interval = setInterval(async () => {
      const updatedNote = await fetchNote(noteId);
      if (updatedNote) {
        setNote(updatedNote);
        
        // Stop polling if content is ready
        if (generatingContent.quiz && updatedNote.quiz) {
          setGeneratingContent(prev => ({ ...prev, quiz: false }));
        }
        if (generatingContent.explanation && updatedNote.explanation) {
          setGeneratingContent(prev => ({ ...prev, explanation: false }));
        }
      }
    }, config.processing.pollInterval); // Poll based on config

    return () => clearInterval(interval);
  }, [noteId, note, generatingContent, fetchNote]);

  const handleGenerateQuiz = async () => {
    if (!noteId) return;
    setGeneratingContent(prev => ({ ...prev, quiz: true }));
    try {
      await generateQuiz(noteId);
      
      // In real API mode, the quiz might be returned immediately
      // So we should fetch the updated note right after the API call
      const updatedNote = await fetchNote(noteId);
      if (updatedNote && updatedNote.quiz) {
        setNote(updatedNote);
        setGeneratingContent(prev => ({ ...prev, quiz: false }));
      }
      // If no quiz found immediately, polling will continue via useEffect
    } catch (error) {
      console.error('Error generating quiz:', error);
      setGeneratingContent(prev => ({ ...prev, quiz: false }));
    }
  };

  const handleGenerateExplanation = async () => {
    if (!noteId) return;
    setGeneratingContent(prev => ({ ...prev, explanation: true }));
    try {
      console.log('NoteViewer: Starting explanation generation for noteId:', noteId);
      const explanation = await generateExplanation(noteId);
      console.log('NoteViewer: Received explanation:', explanation ? 'yes' : 'no');
      
      // Update the note immediately with the returned explanation (structured or string)
      if (explanation && note) {
        const updatedNote = { ...note, explanation };
        setNote(updatedNote);
        console.log('NoteViewer: Updated note with explanation');
      }
      
      setGeneratingContent(prev => ({ ...prev, explanation: false }));
    } catch (error) {
      console.error('Error generating explanation:', error);
      console.error('Error details:', error.response?.data || error.message);
      setGeneratingContent(prev => ({ ...prev, explanation: false }));
    }
  };

  const handleDownloadPDF = async () => {
    if (!note) return;
    await downloadPDF(note);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Note not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="p-2 mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex flex-col gap-3">
                {/* Clickable Logo */}
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                      {config.app.title}
                    </h2>
                  </div>
                </button>
                
                {/* Note Name */}
                <div>
                  <h1 className="text-xl font-semibold truncate">{note.filename}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={note.status === 'completed' ? 'default' : 'secondary'}>
                      {note.status}
                    </Badge>
                    {note.summary && (
                      <Badge variant="outline" className="text-xs ">
                        Summary Ready
                      </Badge>
                    )}
                    {note.explanation && (
                      <Badge variant="outline" className="text-xs ">
                        Explanation Ready
                      </Badge>
                    )}
                    {note.quiz && (
                      <Badge variant="outline" className="text-xs ">
                        Quiz Ready
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Download PDF Button and Status Chips - Top of Content */}
        <DownloadSection note={note} onDownloadPDF={handleDownloadPDF} />

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Image Panel */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Original Note
                </div>
                {activeTab === 'quiz' && (
                  <Button
                    onClick={() => setFocusMode(!focusMode)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {focusMode ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Image
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Focus Mode
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {note.originalImageUrl ? (
                <div className="relative rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={note.originalImageUrl} 
                    alt={note.filename}
                    className={`w-full h-auto max-h-96 object-contain transition-all duration-500 ${
                      activeTab === 'quiz' && focusMode ? 'blur-md' : 'blur-none'
                    }`}
                  />
                  {activeTab === 'quiz' && focusMode && (
                    <div className="absolute inset-0 bg-amber-900/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center p-6 bg-white/95 rounded-lg shadow-lg border border-amber-200 max-w-sm">
                        <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <HelpCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-amber-900 mb-2">Focus Mode Active</h3>
                        <p className="text-sm text-amber-700">
                          Image is blurred to help you focus on the quiz
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Panel */}
          <div>
            <Tabs 
              defaultValue="summary" 
              className="w-full"
              onValueChange={(value) => {
                setActiveTab(value);
                if (value === 'quiz') {
                  setFocusMode(true);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Explanation
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {note.summary ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {note.summary}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p>AI summary is being generated...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Text Reader Component for Summary */}
                {note.summary && (
                  <div className="mt-6">
                    <TextReader 
                      text={note.summary} 
                      title={`${note.filename} - AI Summary Reader`}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="explanation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        AI Explanation & Learning Insights
                      </div>
                      {!note.explanation && !generatingContent.explanation && (
                        <Button 
                          onClick={handleGenerateExplanation}
                          disabled={generatingContent.explanation}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {generatingContent.explanation ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Explanation
                            </>
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatingContent.explanation ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4 animate-pulse">
                            <Brain className="h-8 w-8 text-purple-600" />
                          </div>
                          <p className="text-lg font-medium mb-2">AI is analyzing your content</p>
                          <p className="text-sm">Generating detailed explanations and learning insights...</p>
                        </div>
                      </div>
                    ) : note.explanation ? (
                      <ExplanationRenderer explanation={note.explanation} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                        <p className="mb-4">Generate AI-powered explanations for your notes</p>
                        <p className="text-sm">Get personalized learning insights, study tips, and detailed concept explanations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Study Quiz
                      {!note.quiz && (
                        <Button 
                          onClick={handleGenerateQuiz}
                          disabled={generatingContent.quiz}
                          size="sm"
                        >
                          {generatingContent.quiz ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Generate Quiz
                            </>
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {note.quiz && note.quiz.length > 0 ? (
                      <QuizComponents 
                        questions={note.quiz}
                        focusMode={focusMode}
                        onToggleFocusMode={() => setFocusMode(!focusMode)}
                      />
                    ) : generatingContent.quiz ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">AI is generating your quiz...</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4" />
                        <p className="mb-4">No quiz available yet</p>
                        <p className="text-sm">Click "Generate Quiz" to create interactive questions based on your notes</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteViewer;