import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Type, Eye, Copy, Download, TestTube } from 'lucide-react';
import { motion } from 'framer-motion';

interface TextReaderProps {
  text: string;
  title?: string;
}

export const TextReader: React.FC<TextReaderProps> = ({ text, title = "Extracted Text" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [readingMode, setReadingMode] = useState<'normal' | 'focus'>('normal');
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    wordsRef.current = text.split(/\s+/).filter(word => word.length > 0);
    
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select default English voice
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.default
        ) || availableVoices.find(voice => 
          voice.lang.startsWith('en')
        ) || availableVoices[0];
        
        setSelectedVoice(englishVoice);
      };

      // Load voices immediately
      loadVoices();
      
      // Also load when voices change (some browsers load them asynchronously)
      speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      setIsSupported(false);
    }
  }, [text]);

  const handlePlay = () => {
    if (!text || !isSupported) {
      console.warn('Text-to-speech not supported or no text available');
      return;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    if (isPaused && speechRef.current) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      speechRef.current = utterance;

      // Set voice if available
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = speechRate;
      utterance.volume = isMuted ? 0 : volume;
      utterance.pitch = 1;
      utterance.lang = 'en-US';

      let wordIndex = 0;
      const words = text.split(/\s+/);
      
      // Track word progress (simplified approach)
      utterance.onboundary = (event) => {
        if (event.name === 'word' && wordIndex < words.length) {
          setCurrentWordIndex(wordIndex);
          wordIndex++;
        }
      };

      utterance.onstart = () => {
        console.log('Speech started');
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        console.log('Speech ended');
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(0);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(0);
      };

      utterance.onpause = () => {
        console.log('Speech paused');
        setIsPlaying(false);
        setIsPaused(true);
      };

      utterance.onresume = () => {
        console.log('Speech resumed');
        setIsPlaying(true);
        setIsPaused(false);
      };

      // Start speaking
      speechSynthesis.speak(utterance);
      
      // Fallback for word tracking if onboundary doesn't work
      if (!utterance.onboundary) {
        const wordCount = words.length;
        const estimatedDuration = (text.length / speechRate) * 100; // rough estimate
        const interval = estimatedDuration / wordCount;
        
        let wordTracker = 0;
        const trackingInterval = setInterval(() => {
          if (!speechSynthesis.speaking || speechSynthesis.paused) {
            clearInterval(trackingInterval);
            return;
          }
          
          if (wordTracker < wordCount) {
            setCurrentWordIndex(wordTracker);
            wordTracker++;
          } else {
            clearInterval(trackingInterval);
          }
        }, interval);
      }

    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(0);
  };

  const testSpeech = () => {
    // Test function to check if speech synthesis works
    if (!isSupported) {
      alert('Speech synthesis is not supported in this browser');
      return;
    }

    try {
      const testUtterance = new SpeechSynthesisUtterance('This is a test of the speech synthesis system.');
      if (selectedVoice) {
        testUtterance.voice = selectedVoice;
      }
      testUtterance.rate = 1;
      testUtterance.volume = 0.8;
      testUtterance.onstart = () => console.log('Test speech started');
      testUtterance.onend = () => console.log('Test speech ended');
      testUtterance.onerror = (e) => console.error('Test speech error:', e);
      
      speechSynthesis.speak(testUtterance);
    } catch (error) {
      console.error('Test speech failed:', error);
      alert('Speech synthesis test failed. Check console for details.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (speechRef.current) {
      speechRef.current.volume = isMuted ? volume : 0;
    }
  };

  const renderText = () => {
    if (readingMode === 'focus') {
      const words = wordsRef.current;
      const currentSentenceStart = Math.max(0, currentWordIndex - 5);
      const currentSentenceEnd = Math.min(words.length, currentWordIndex + 5);
      
      return (
        <div className="text-center">
          {words.slice(currentSentenceStart, currentSentenceEnd).map((word, index) => {
            const globalIndex = currentSentenceStart + index;
            const isActive = globalIndex === currentWordIndex && isPlaying;
            
            return (
              <span
                key={globalIndex}
                className={`inline-block mx-1 px-2 py-1 rounded transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md scale-110' 
                    : globalIndex < currentWordIndex && isPlaying
                    ? 'bg-secondary text-secondary-foreground opacity-60'
                    : 'text-foreground'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {word}
              </span>
            );
          })}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <div 
          className="leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {wordsRef.current.map((word, index) => {
            const isActive = index === currentWordIndex && isPlaying;
            const isPast = index < currentWordIndex && isPlaying;
            
            return (
              <span
                key={index}
                className={`transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground px-1 rounded shadow-sm' 
                    : isPast
                    ? 'opacity-60'
                    : ''
                }`}
              >
                {word}{' '}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  if (!text) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Type className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No text available to read</p>
          {!isSupported && (
            <p className="text-red-500 text-sm mt-2">
              Text-to-speech is not supported in this browser
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg shadow-amber-100/50 bg-gradient-to-br from-card to-amber-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {wordsRef.current.length} words
              </Badge>
              <Badge variant="outline" className="text-xs">
                ~{Math.ceil(wordsRef.current.length / 200)} min read
              </Badge>
              {!isSupported && (
                <Badge variant="destructive" className="text-xs">
                  TTS Not Supported
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200/30">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              {!isSupported ? (
                <Button disabled size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  TTS Not Available
                </Button>
              ) : !isPlaying && !isPaused ? (
                <Button onClick={handlePlay} size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Read Aloud
                </Button>
              ) : isPlaying ? (
                <Button onClick={handlePause} size="sm" variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button onClick={handlePlay} size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              )}
              
              {(isPlaying || isPaused) && (
                <Button onClick={handleStop} size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              {isSupported && (
                <Button onClick={testSpeech} size="sm" variant="outline" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Test
                </Button>
              )}
            </div>

            {/* Reading Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setReadingMode(readingMode === 'normal' ? 'focus' : 'normal')}
                size="sm"
                variant={readingMode === 'focus' ? 'default' : 'outline'}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {readingMode === 'focus' ? 'Focus Mode' : 'Normal'}
              </Button>
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={handleCopy} size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-amber-50/30 rounded-lg border border-amber-200/20">
            {/* Voice Selection */}
            {isSupported && voices.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice</label>
                <Select 
                  value={selectedVoice?.name || ''} 
                  onValueChange={(value) => {
                    const voice = voices.find(v => v.name === value);
                    setSelectedVoice(voice || null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Speech Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Speech Rate: {speechRate.toFixed(1)}x
              </label>
              <Slider
                value={[speechRate]}
                onValueChange={(value) => setSpeechRate(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
                disabled={!isSupported}
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <button onClick={toggleMute} className="hover:opacity-70" disabled={!isSupported}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                Volume: {Math.round(volume * 100)}%
              </label>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
                disabled={isMuted || !isSupported}
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size: {fontSize}px
              </label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Progress */}
          {(isPlaying || isPaused) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{currentWordIndex} / {wordsRef.current.length} words</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-200"
                  style={{ 
                    width: `${wordsRef.current.length > 0 ? (currentWordIndex / wordsRef.current.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className={`p-6 bg-background rounded-lg border ${readingMode === 'focus' ? 'min-h-[200px]' : ''}`}>
            {renderText()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
