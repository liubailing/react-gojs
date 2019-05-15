import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Reducer } from 'redux';
import { nodeSelected } from '../actions/task';
import { DiagramState } from './diagramReducer';

/**
 * store 管理数据
 */
export interface TaskState {
    currKey: string;
    diagram: DiagramState | null;
}

const nodeSelectedHander = (state: TaskState, payload: string): TaskState => {
    return {
        ...state,
        currKey: payload
    };
};

export const taskReducer: Reducer<TaskState> = reducerWithInitialState<TaskState>({
    currKey: '12121212',
    diagram: null
})
    .case(nodeSelected, nodeSelectedHander)
    .build();
