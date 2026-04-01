import { Study, Task, Question, Block } from '../types';

export const getTasks = (study: Study): Task[] => {
  return study.blocks.filter((block): block is Task => block.type === 'task');
};

export const getQuestions = (study: Study): Question[] => {
  return study.blocks.filter((block): block is Question => block.type === 'question');
};
