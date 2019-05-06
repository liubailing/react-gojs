import React from 'react';
import './App.css';
import AppButtons from './components/AppButtons';
import MyDiagramContainer from './components/MyDiagramContainer';
import SelectionDetails from './components/SelectionDetails';


class App extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">React + Redux + GoJS Example</h1>
                </header>
                <AppButtons />
                <SelectionDetails />
                <MyDiagramContainer />
            </div>
        );
    }
}

export default App;
