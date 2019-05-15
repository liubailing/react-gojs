import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory('TASK');
export const nodeSelected = actionCreator<string>('NODE_SELECTED');
