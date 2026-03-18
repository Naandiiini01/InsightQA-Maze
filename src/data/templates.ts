import { StudyType, Task, Question } from '../types';

export interface TemplateData {
  id: string;
  title: string;
  type: StudyType;
  tasks: Task[];
  questions: Question[];
  prototypeUrl?: string;
}

export const TEMPLATES: Record<string, TemplateData> = {
  'usability-test': {
    id: 'usability-test',
    title: 'Standard Usability Test',
    type: 'prototype',
    tasks: [
      {
        id: 'task-1',
        title: 'Complete the checkout process',
        instructions: 'Add a product to your cart and proceed through the checkout until you reach the confirmation page.',
        successPath: '/checkout/success'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'How easy was it to complete the task?',
        type: 'mcq',
        required: true,
        options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult']
      },
      {
        id: 'q-2',
        text: 'What, if anything, frustrated you about the process?',
        type: 'open-ended',
        required: false
      }
    ]
  },
  'concept-validation': {
    id: 'concept-validation',
    title: 'Concept Validation Study',
    type: 'prototype',
    tasks: [
      {
        id: 'task-1',
        title: 'Explore the dashboard',
        instructions: 'Take a look at the new dashboard design and explore the different widgets.',
        successPath: '/dashboard'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'What is your first impression of this design?',
        type: 'open-ended',
        required: true
      },
      {
        id: 'q-2',
        text: 'How likely are you to use a tool like this in your daily work?',
        type: 'mcq',
        required: true,
        options: ['Extremely Likely', 'Very Likely', 'Somewhat Likely', 'Not Very Likely', 'Not at all Likely']
      }
    ]
  },
  'user-survey': {
    id: 'user-survey',
    title: 'User Feedback Survey',
    type: 'survey',
    tasks: [],
    questions: [
      {
        id: 'q-1',
        text: 'How often do you use our product?',
        type: 'mcq',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely']
      },
      {
        id: 'q-2',
        text: 'What is the one feature you wish we had?',
        type: 'open-ended',
        required: true
      }
    ]
  },
  'navigation-test': {
    id: 'navigation-test',
    title: 'Navigation & IA Test',
    type: 'prototype',
    tasks: [
      {
        id: 'task-1',
        title: 'Find the "Billing" settings',
        instructions: 'Navigate to the section where you can manage your subscription and billing information.',
        successPath: '/settings/billing'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'Did you find the navigation labels clear?',
        type: 'mcq',
        required: true,
        options: ['Yes, very clear', 'Mostly clear', 'Somewhat confusing', 'Very confusing']
      }
    ]
  },
  'card-sorting': {
    id: 'card-sorting',
    title: 'Closed Card Sorting Study',
    type: 'prototype',
    tasks: [
      {
        id: 'task-1',
        title: 'Organize the navigation items',
        instructions: 'Please drag the navigation items into the categories where you would expect to find them.',
        successPath: '/navigation-complete'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'How easy was it to find the categories for each item?',
        type: 'mcq',
        required: true,
        options: ['Very Easy', 'Somewhat Easy', 'Neutral', 'Somewhat Difficult', 'Very Difficult']
      }
    ]
  },
  'cta-placement': {
    id: 'cta-placement',
    title: 'CTA Placement & Visibility Test',
    type: 'prototype',
    tasks: [
      {
        id: 'task-1',
        title: 'Find the "Sign Up" button',
        instructions: 'Look at the landing page and click on the primary call-to-action button as quickly as possible.',
        successPath: '/signup'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'On a scale of 1-5, how prominent was the main action button?',
        type: 'mcq',
        required: true,
        options: ['1 - Not visible at all', '2', '3', '4', '5 - Very prominent']
      }
    ]
  },
  'product-discovery': {
    id: 'product-discovery',
    title: 'Product Discovery Survey',
    type: 'survey',
    tasks: [],
    questions: [
      {
        id: 'q-1',
        text: 'What is the biggest challenge you face when managing your team\'s workflow?',
        type: 'open-ended',
        required: true
      }
    ]
  },
  'cloze-test': {
    id: 'cloze-test',
    title: 'Content Comprehension (Cloze Test)',
    type: 'website',
    tasks: [
      {
        id: 'task-1',
        title: 'Read the value proposition',
        instructions: 'Read the main section of the page and try to understand the core offering.',
        successPath: '/'
      }
    ],
    questions: [
      {
        id: 'q-1',
        text: 'In your own words, what does this product do?',
        type: 'open-ended',
        required: true
      }
    ]
  }
};
