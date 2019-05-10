import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
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
    dispatch: Dispatch<Action<DiagramModel<WFNodeModel, WFLinkModel>> | Action<void> | Action<string>>
): AppButtonsDispatchProps => {
    let nodeId = 0;
    return {
        initHandler: () =>
            dispatch(
                init({
                    nodeDataArray: [
                        { key: 'Alpha', label: 'Alpha', color: 'lightblue', group: '', isGroup: false },
                        { key: 'Beta', label: 'Beta', color: 'orange', group: '', isGroup: false },
                        { key: 'Gamma', label: 'Gamma', color: 'lightgreen', group: '', isGroup: false },
                        { key: 'Delta', label: 'Delta', color: 'pink', group: '', isGroup: false },
                        { key: 'Omega', label: 'Omega', color: 'grey', group: '', isGroup: false }
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
