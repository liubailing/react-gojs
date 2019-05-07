import React from 'react';
import WFContainer from './wfContainer';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

export default class wfIndex extends React.Component {
    render = () => (
        <div>
            <DragDropContextProvider backend={HTML5Backend}>
                <WFContainer />
            </DragDropContextProvider>
        </div>
    );
}
