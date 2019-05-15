import React from 'react';
import './editbase.css';

//import { createStore } from 'redux'
//import { Provider } from 'react-redux'
//import { taskReducer } from '../../reducers/taskReducer';

//let store = createStore(taskReducer);

export default class TaskEditBase extends React.Component {
    render = () => (
        <div>12121</div>
        // <Provider store={store}>
        //     <div className='edit'>
        //         <div>
        //             <label>节点名称：</label>
        //             <input>{store.getState().currKey}</input>
        //         </div>
        //         <div>
        //             <label>节点 ID：</label>
        //             <input readOnly></input>
        //         </div>
        //         <div>
        //             <button> 保存</button>
        //         </div>
        //     </div>
        // </Provider>
    );
}
