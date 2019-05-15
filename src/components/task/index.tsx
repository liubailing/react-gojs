import React from 'react';
import { Provider } from 'react-redux';
import { create } from '../../store';
import { taskReducer } from '../../reducers/taskReducer';
import TaskEditBase from './editBase';
import WFApp from '../workflow/wfIndex';

export default class TaskEdit extends React.Component {
    render = () => (
        <Provider store={create(taskReducer)}>
            <WFApp />
            <TaskEditBase />
        </Provider>
    );
}
