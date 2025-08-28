export interface MockAdditionalContent {
  id: string;
  title: string;
  subject: string;
  description: string;
  keyPoints: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  lastUpdated: string;
}

export const mockAdditionalGrid: MockAdditionalContent[] = [
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
  },
  {
    id: 'exp_5',
    title: 'Quantum Mechanics Basics',
    subject: 'Physics',
    description: 'Introduction to quantum mechanical principles and their applications in modern technology.',
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
    id: 'exp_6',
    title: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    description: 'Fundamental concepts of organizing data and solving computational problems efficiently.',
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
