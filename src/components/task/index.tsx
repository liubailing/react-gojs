import React from 'react';
import WFApp from '../workflow/wfIndex';
import { Provider } from 'react-redux';
import { create } from '../../store';
import { taskReducer } from '../../reducers/taskReducer';
import TaskEditBase from './editBase';
import SplitPane from 'react-split-pane';

export default class TaskEdit extends React.Component {
    render = () => (
        <Provider store={create(taskReducer)}>
            <SplitPane defaultSize="90%">
                <div>
                    <WFApp />
                </div>
                <div>
                    {' '}
                    <TaskEditBase />
                </div>
            </SplitPane>
        </Provider>
    );
}
