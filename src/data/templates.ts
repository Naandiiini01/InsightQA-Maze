import { StudyType, Block } from '../types';

export interface TemplateData {
  id: string;
  title: string;
  type: StudyType;
  blocks: Block[];
  prototypeUrls?: string[];
}

export const TEMPLATES: Record<string, TemplateData> = {
  'usability-test': {
    id: 'usability-test',
    title: 'Standard Usability Test',
    type: 'prototype',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our usability test.' },
      { type: 'task', id: 'task-1', title: 'Complete the checkout process', instructions: 'Add a product to your cart and proceed through the checkout until you reach the confirmation page.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'How easy was it to complete the task?', questionType: 'mcq', required: true, options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'] },
      { type: 'question', id: 'q-2', text: 'What, if anything, frustrated you about the process?', questionType: 'open-ended', required: false },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'concept-validation': {
    id: 'concept-validation',
    title: 'Concept Validation Study',
    type: 'prototype',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our concept validation study.' },
      { type: 'task', id: 'task-1', title: 'Explore the dashboard', instructions: 'Take a look at the new dashboard design and explore the different widgets.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'What is your first impression of this design?', questionType: 'open-ended', required: true },
      { type: 'question', id: 'q-2', text: 'How likely are you to use a tool like this in your daily work?', questionType: 'mcq', required: true, options: ['Extremely Likely', 'Very Likely', 'Somewhat Likely', 'Not Very Likely', 'Not at all Likely'] },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'user-survey': {
    id: 'user-survey',
    title: 'User Feedback Survey',
    type: 'survey',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our feedback survey.' },
      { type: 'question', id: 'q-1', text: 'How often do you use our product?', questionType: 'mcq', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { type: 'question', id: 'q-2', text: 'What is the one feature you wish we had?', questionType: 'open-ended', required: true },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'navigation-test': {
    id: 'navigation-test',
    title: 'Navigation & IA Test',
    type: 'prototype',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our navigation test.' },
      { type: 'task', id: 'task-1', title: 'Find the "Billing" settings', instructions: 'Navigate to the section where you can manage your subscription and billing information.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'Did you find the navigation labels clear?', questionType: 'mcq', required: true, options: ['Yes, very clear', 'Mostly clear', 'Somewhat confusing', 'Very confusing'] },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'card-sorting': {
    id: 'card-sorting',
    title: 'Closed Card Sorting Study',
    type: 'prototype',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our card sorting study.' },
      { type: 'task', id: 'task-1', title: 'Organize the navigation items', instructions: 'Please drag the navigation items into the categories where you would expect to find them.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'How easy was it to find the categories for each item?', questionType: 'mcq', required: true, options: ['Very Easy', 'Somewhat Easy', 'Neutral', 'Somewhat Difficult', 'Very Difficult'] },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'cta-placement': {
    id: 'cta-placement',
    title: 'CTA Placement & Visibility Test',
    type: 'prototype',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our CTA test.' },
      { type: 'task', id: 'task-1', title: 'Find the "Sign Up" button', instructions: 'Look at the landing page and click on the primary call-to-action button as quickly as possible.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'On a scale of 1-5, how prominent was the main action button?', questionType: 'mcq', required: true, options: ['1 - Not visible at all', '2', '3', '4', '5 - Very prominent'] },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'product-discovery': {
    id: 'product-discovery',
    title: 'Product Discovery Survey',
    type: 'survey',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our product discovery survey.' },
      { type: 'question', id: 'q-1', text: 'What is the biggest challenge you face when managing your team\'s workflow?', questionType: 'open-ended', required: true },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  },
  'cloze-test': {
    id: 'cloze-test',
    title: 'Content Comprehension (Cloze Test)',
    type: 'website',
    blocks: [
      { type: 'welcome', id: 'welcome-1', title: 'Welcome', description: 'Welcome to our comprehension test.' },
      { type: 'task', id: 'task-1', title: 'Read the value proposition', instructions: 'Read the main section of the page and try to understand the core offering.', followUpQuestions: [] },
      { type: 'question', id: 'q-1', text: 'In your own words, what does this product do?', questionType: 'open-ended', required: true },
      { type: 'thankyou', id: 'thankyou-1', title: 'Thank You', description: 'Thank you for your feedback.' }
    ]
  }
};
