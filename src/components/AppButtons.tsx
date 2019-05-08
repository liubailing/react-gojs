import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, NodeModel } from '../reducers/diagramReducer';
import { DiagramModel, LinkModel } from 'react-gojs';
import { init, updateNodeColor, addNode } from '../actions/diagram';

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
                        { from: 'Alpha', to: 'Beta' },
                        { from: 'Alpha', to: 'Gamma' },
                        { from: 'Beta', to: 'Delta' },
                        { from: 'Gamma', to: 'Omega' }
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

const AppButtons = ({ initHandler, updateNodeColorHandler, addNodeHandler }: AppButtonsDispatchProps) => {
    return (
        <div className="centered-container">
            <div className="inline-element">
                <button type="button" onClick={() => initHandler()}>
                    Init diagram
                </button>
            </div>
            <div className="inline-element">
                <button type="button" onClick={() => updateNodeColorHandler()}>
                    Update node color
                </button>
            </div>
            <div className="inline-element">
                <button type="button" onClick={() => addNodeHandler()}>
                    Add node with selected node(s) as parent(s)
                </button>
            </div>
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppButtons);
