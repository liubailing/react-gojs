import React from 'react';
import './App.css';
import TaskEdit from './components/task/index';

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <TaskEdit />
            </div>
        );
    }
}

export default App;
