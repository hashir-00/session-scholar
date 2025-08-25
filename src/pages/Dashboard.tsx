import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NoteUploader } from '@/components/notes/NoteUploader';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotes } from '@/context/NoteContext';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Brain, FileText, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [showUploader, setShowUploader] = useState(false);
  const { notes, fetchNotes, isLoading } = useNotes();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNoteClick = (noteId: string) => {
    navigate(`/notes/${noteId}`);
  };

  const completedNotes = notes.filter(note => note.status === 'completed');
  const processingNotes = notes.filter(note => note.status === 'processing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">StudyAI</h1>
                <p className="text-sm text-muted-foreground">Transform your notes into smart study materials</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowUploader(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Notes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {notes.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mx-auto w-32 h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to StudyAI</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload images of your handwritten or printed notes and let our AI generate 
              summaries and interactive quizzes to boost your learning.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Upload Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Simply drag & drop or browse to upload your note images
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI extracts text and generates smart summaries
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Study & Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Get interactive quizzes to test your knowledge
                </p>
              </Card>
            </div>
            <Button 
              size="lg"
              onClick={() => setShowUploader(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Plus className="h-5 w-5 mr-2" />
              Get Started - Upload Your First Notes
            </Button>
          </div>
        ) : (
          /* Notes Grid */
          <div className="space-y-8">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading your notes...</span>
              </div>
            )}

            {processingNotes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Notes ({processingNotes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {processingNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedNotes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Ready to Study ({completedNotes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => handleNoteClick(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <NoteUploader onClose={() => setShowUploader(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;