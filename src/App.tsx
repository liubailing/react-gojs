import React from 'react';
import './App.css';
import WFApp from './components/wfIndex';
// import AppButtons from './components/wfButtons';
// import MyDiagramContainer from './components/wfContainer';
// import SelectionDetails from './components/SelectionDetails';

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <WFApp />
                {/* <header className="App-header">
                    <h1 className="App-title">React + Redux + GoJS Example</h1>
                </header>
                <AppButtons />
                <SelectionDetails />
                <MyDiagramContainer /> */}
            </div>
        );
    }
}

export default App;
