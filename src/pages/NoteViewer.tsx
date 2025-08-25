import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, BookOpen, HelpCircle, Loader2, Brain, CheckCircle } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { Note, QuizQuestion } from '@/api/noteService';

const NoteViewer: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { fetchNote, generateSummary, generateQuiz } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState<{
    summary: boolean;
    quiz: boolean;
  }>({ summary: false, quiz: false });
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});

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

    const shouldPoll = generatingContent.summary || generatingContent.quiz;
    if (!shouldPoll) return;

    const interval = setInterval(async () => {
      const updatedNote = await fetchNote(noteId);
      if (updatedNote) {
        setNote(updatedNote);
        
        // Stop polling if content is ready
        if (generatingContent.summary && updatedNote.summary) {
          setGeneratingContent(prev => ({ ...prev, summary: false }));
        }
        if (generatingContent.quiz && updatedNote.quiz) {
          setGeneratingContent(prev => ({ ...prev, quiz: false }));
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [noteId, note, generatingContent, fetchNote]);

  const handleGenerateSummary = async () => {
    if (!noteId) return;
    setGeneratingContent(prev => ({ ...prev, summary: true }));
    await generateSummary(noteId);
  };

  const handleGenerateQuiz = async () => {
    if (!noteId) return;
    setGeneratingContent(prev => ({ ...prev, quiz: true }));
    await generateQuiz(noteId);
  };

  const toggleQuizAnswer = (questionId: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
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
          <Button onClick={() => navigate('/')}>
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold truncate">{note.filename}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={note.status === 'completed' ? 'default' : 'secondary'}>
                  {note.status}
                </Badge>
                {note.summary && (
                  <Badge variant="outline" className="text-xs">Summary Ready</Badge>
                )}
                {note.quiz && (
                  <Badge variant="outline" className="text-xs">Quiz Ready</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Image Panel */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Original Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              {note.originalImageUrl ? (
                <div className="rounded-lg overflow-hidden bg-secondary">
                  <img 
                    src={note.originalImageUrl} 
                    alt={note.filename}
                    className="w-full h-auto max-h-96 object-contain"
                  />
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
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {note.extractedText ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg">
                          {note.extractedText}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4" />
                        <p>Text extraction is still in progress...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      AI Summary
                      {!note.summary && (
                        <Button 
                          onClick={handleGenerateSummary}
                          disabled={generatingContent.summary}
                          size="sm"
                        >
                          {generatingContent.summary ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Generate Summary
                            </>
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {note.summary ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm leading-relaxed">
                          {note.summary}
                        </div>
                      </div>
                    ) : generatingContent.summary ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">AI is generating your summary...</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p className="mb-4">No summary available yet</p>
                        <p className="text-sm">Click "Generate Summary" to create an AI-powered summary of your notes</p>
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
                      <div className="space-y-6">
                        {note.quiz.map((question: QuizQuestion, index: number) => (
                          <div key={question.id} className="border rounded-lg p-4">
                            <div className="mb-4">
                              <h3 className="font-medium mb-3">
                                {index + 1}. {question.question}
                              </h3>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div 
                                    key={optionIndex}
                                    className={`p-3 rounded border cursor-pointer transition-colors ${
                                      quizAnswers[question.id] 
                                        ? (option === question.correctAnswer 
                                            ? 'bg-success/10 border-success text-success' 
                                            : 'bg-secondary border-border')
                                        : 'bg-secondary border-border hover:bg-secondary/80'
                                    }`}
                                  >
                                    {option}
                                    {quizAnswers[question.id] && option === question.correctAnswer && (
                                      <CheckCircle className="h-4 w-4 float-right text-success" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleQuizAnswer(question.id)}
                            >
                              {quizAnswers[question.id] ? 'Hide Answer' : 'Show Answer'}
                            </Button>
                            
                            {quizAnswers[question.id] && question.explanation && (
                              <div className="mt-3 p-3 bg-primary/5 rounded border">
                                <p className="text-sm">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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