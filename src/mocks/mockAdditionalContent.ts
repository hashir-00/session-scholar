import { AdditionalContent } from "@/api/noteService";

export const mockAdditionalGrid: AdditionalContent[] = [
  {
    title: 'Mathematical Foundations',
    subject: 'Calculus',
    description: 'Core concepts of differential and integral calculus explained through visual examples and real-world applications.',
    content: 'Calculus is the mathematical study of continuous change. Differential calculus concerns instantaneous rates of change and slopes of curves, while integral calculus concerns accumulation of quantities and areas under or between curves. The fundamental theorem of calculus connects these two branches.',
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
    title: 'Chemical Bonding Theory',
    subject: 'Chemistry',
    description: 'Understanding how atoms interact to form molecules through ionic, covalent, and metallic bonds.',
    content: 'Chemical bonding involves the interaction between atoms to form molecules or compounds. Ionic bonds form when electrons are transferred from one atom to another, covalent bonds involve sharing of electrons, and metallic bonds occur in metals where electrons are delocalized.',
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
    title: 'Literary Analysis Framework',
    subject: 'English Literature',
    description: 'Systematic approach to analyzing themes, characters, and literary devices in classic and modern texts.',
    content: 'Literary analysis involves examining the elements of a literary work to understand its meaning and significance. This includes analyzing themes, character development, plot structure, symbolism, and literary devices used by the author.',
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
    title: 'Economic Market Principles',
    subject: 'Economics',
    description: 'Supply and demand dynamics, market equilibrium, and factors affecting price determination.',
    content: 'Market principles govern how prices are determined through the interaction of supply and demand. When supply increases or demand decreases, prices tend to fall. Conversely, when supply decreases or demand increases, prices tend to rise.',
    keyPoints: [
      'Supply and demand curves',
      'Market equilibrium points',
      'External factors affecting markets',
      'Government intervention effects'
    ],
    difficulty: 'Intermediate',
    estimatedTime: '10 min read',
    lastUpdated: '4 days ago'
  },
  {
    title: 'Quantum Mechanics Basics',
    subject: 'Physics',
    description: 'Introduction to quantum mechanical principles and their applications in modern technology.',
    content: 'Quantum mechanics describes the behavior of matter and energy at the atomic and subatomic scale. Key concepts include wave-particle duality, where particles exhibit both wave and particle properties, and quantum superposition, where particles can exist in multiple states simultaneously.',
    keyPoints: [
      'Wave-particle duality concept',
      'Heisenberg uncertainty principle',
      'Quantum superposition states',
      'Applications in computing and electronics'
    ],
    difficulty: 'Advanced',
    estimatedTime: '20 min read',
    lastUpdated: '5 days ago'
  },
  {
    title: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    description: 'Fundamental concepts of organizing data and solving computational problems efficiently.',
    content: 'Data structures are ways of organizing and storing data to enable efficient access and modification. Algorithms are step-by-step procedures for solving problems. Together, they form the foundation of computer science and software engineering.',
    keyPoints: [
      'Arrays, linked lists, and trees',
      'Sorting and searching algorithms',
      'Time and space complexity analysis',
      'Real-world algorithm applications'
    ],
    difficulty: 'Intermediate',
    estimatedTime: '18 min read',
    lastUpdated: '1 week ago'
  }
]; 

/**
 * Get mock additional content by filters
 */
export const getMockAdditionalContent = (filters?: {
  subject?: string;
  difficulty?: string;
  limit?: number;
}): AdditionalContent[] => {
  let filteredContent = [...mockAdditionalGrid];

  if (filters?.subject) {
    filteredContent = filteredContent.filter(item => 
      item.subject.toLowerCase().includes(filters.subject!.toLowerCase())
    );
  }

  if (filters?.difficulty) {
    filteredContent = filteredContent.filter(item => 
      item.difficulty === filters.difficulty
    );
  }

  if (filters?.limit) {
    filteredContent = filteredContent.slice(0, filters.limit);
  }

  return filteredContent;
};

/**
 * Get single mock additional content item by ID
 */
export const getMockAdditionalContentById = (id: string): AdditionalContent | null => {
  // Since we don't have id field anymore, return first item or null
  return mockAdditionalGrid.length > 0 ? mockAdditionalGrid[0] : null;
};

/**
 * Generate mock additional content based on note summaries
 */
export const generateMockAdditionalContentFromNotes = (
  noteSummaries: Array<{id: string, summary: string}>,
  count: number = 3
): AdditionalContent[] => {
  // If no note summaries provided, return random content
  if (noteSummaries.length === 0) {
    return getMockAdditionalContent({ limit: count });
  }

  // Generate content based on note topics
  const generatedContent: AdditionalContent[] = [];
  const subjects = ['Mathematics', 'Science', 'Literature', 'History', 'Computer Science', 'Physics'];
  const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  for (let i = 0; i < count; i++) {
    const noteIndex = i % noteSummaries.length;
    const noteContext = noteSummaries[noteIndex];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const content: AdditionalContent = {
      title: `Advanced Study Guide: ${subject} Concepts`,
      subject,
      description: `Comprehensive study material generated from your uploaded notes. Covers key concepts and provides detailed explanations based on "${noteContext.summary.slice(0, 50)}...".`,
      content: `This study guide provides detailed explanations of ${subject} concepts found in your notes. It includes comprehensive coverage of the topic with examples and practical applications to enhance your understanding.`,
      keyPoints: [
        'Core concepts from your notes',
        'Extended explanations and examples',
        'Practice problems and exercises',
        'Real-world applications'
      ],
      difficulty,
      estimatedTime: `${Math.floor(Math.random() * 15) + 5} min read`,
      lastUpdated: 'Just now'
    };
    
    generatedContent.push(content);
  }
  
  return generatedContent;
}

/**
 * Generate mock additional content for a specific note ID
 */
export const generateMockAdditionalContentForNote = (noteId: string, noteData?: {filename: string, summary: string}): AdditionalContent => {
  const subjects = ['Mathematics', 'Science', 'Literature', 'History', 'Computer Science', 'Physics', 'Biology', 'Chemistry'];
  const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];
  
  // Extract topic hints from filename or summary
  const filename = noteData?.filename || 'Study Material';
  const summary = noteData?.summary || 'Study content';
  
  // Determine subject based on filename/summary keywords
  let detectedSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const lowerContent = (filename + ' ' + summary).toLowerCase();
  
  if (lowerContent.includes('math') || lowerContent.includes('equation') || lowerContent.includes('calculus')) {
    detectedSubject = 'Mathematics';
  } else if (lowerContent.includes('science') || lowerContent.includes('experiment') || lowerContent.includes('biology')) {
    detectedSubject = 'Science';
  } else if (lowerContent.includes('history') || lowerContent.includes('war') || lowerContent.includes('timeline')) {
    detectedSubject = 'History';
  } else if (lowerContent.includes('literature') || lowerContent.includes('novel') || lowerContent.includes('poem')) {
    detectedSubject = 'Literature';
  } else if (lowerContent.includes('computer') || lowerContent.includes('code') || lowerContent.includes('programming')) {
    detectedSubject = 'Computer Science';
  }
  
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const baseTitle = filename.replace(/\.(jpg|jpeg|png|pdf)$/i, '');
  
  // Generate contextual key points based on summary
  const baseKeyPoints = [
    'Core concepts and fundamental principles',
    'Step-by-step explanations and examples',
    'Practice exercises and problem-solving techniques',
    'Real-world applications and case studies',
    'Summary and review questions',
    'Advanced topics for further exploration'
  ];
  
  // Select 4-5 random key points
  const selectedKeyPoints = baseKeyPoints
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 4);
  
  const content: AdditionalContent = {
    title: `Study Guide: ${baseTitle}`,
    subject: detectedSubject,
    description: `Comprehensive study material generated from "${baseTitle}". This guide expands on your uploaded content with detailed explanations, examples, and practice materials. ${summary.slice(0, 100)}...`,
    content: `This comprehensive study guide covers the key concepts from your note "${baseTitle}". It provides detailed explanations, practical examples, and additional context to help you master the subject matter. The guide is structured to build upon the knowledge from your original notes.`,
    keyPoints: selectedKeyPoints,
    difficulty,
    estimatedTime: `${Math.floor(Math.random() * 12) + 8} min read`,
    lastUpdated: 'Just now'
  };
  
  return content;
};
