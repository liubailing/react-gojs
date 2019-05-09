import React from 'react';
import { DiagramState, NodeModel } from '../reducers/diagramReducer';
import { connect } from 'react-redux';
import { init, updateNodeColor, addNode } from '../actions/diagram';
import { Action } from 'typescript-fsa';
import { DiagramModel, LinkModel } from 'react-gojs';
import { Dispatch } from 'redux';
import './wfButtons.css';

export interface AppButtonsDispatchProps {
    initHandler: () => void;
    updateNodeColorHandler: () => void;
    addNodeHandler: () => void;
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<NodeModel, LinkModel>> | Action<void> | Action<string>>
): AppButtonsDispatchProps => {
    let nodeId = 0;
    return {
        initHandler: () =>
            dispatch(
                init({
                    nodeDataArray: [
                        { key: 'Alpha', label: 'Alpha', color: 'lightblue' },
                        { key: 'Beta', label: 'Beta', color: 'orange' },
                        { key: 'Gamma', label: 'Gamma', color: 'lightgreen' },
                        { key: 'Delta', label: 'Delta', color: 'pink' },
                        { key: 'Omega', label: 'Omega', color: 'grey' }
                    ],
                    linkDataArray: [
                        { from: 'Alpha', to: 'Beta', color: 'pink' },
                        { from: 'Alpha', to: 'Gamma', color: 'pink' },
                        { from: 'Beta', to: 'Delta', color: 'pink' },
                        { from: 'Gamma', to: 'Omega', color: 'pink' }
                    ]
                })
            ),
        updateNodeColorHandler: () => dispatch(updateNodeColor()),
        addNodeHandler: () => {
            dispatch(addNode('node' + nodeId));
            nodeId += 1;
        }
    };
};

const WFButtons = ({ initHandler, updateNodeColorHandler, addNodeHandler }: AppButtonsDispatchProps) => {
    return <div className="centered-container" id="divWFDraggers" />;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFButtons);
