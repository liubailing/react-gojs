import React from 'react';
import { DropTarget, ConnectDropTarget, DropTargetMonitor, DropTargetConnector } from 'react-dnd';
import './wfDiagram.css';
import { DiagramState, modelSelector, NodeModel } from '../reducers/diagramReducer';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeTextEvent,
    UpdateNodeText
} from '../actions/diagram';
import { DiagramModel, LinkModel, ModelChangeEvent, ModelChangeEventType } from 'react-gojs';
import { Action } from 'typescript-fsa';
import WFDiagram from './wfDiagram';

interface WFDroperDispatchProps {
    onNodeSelection: (key: string, isSelected: boolean) => void;
    onModelChange: (event: ModelChangeEvent<NodeModel, LinkModel>) => void;
    onTextChange: (event: UpdateNodeTextEvent) => void;
}

interface WFDroperProps extends WFDroperDispatchProps {
    canDrop: boolean;
    isOver: boolean;
    connectDropTarget: ConnectDropTarget;
    model: DiagramModel<NodeModel, LinkModel>;
}

const mapStateToProps = (state: DiagramState) => {
    return {
        model: modelSelector(state)
    };
};

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string> | Action<LinkModel> | Action<UpdateNodeTextEvent>>
): WFDroperDispatchProps => {
    return {
        onNodeSelection: (key: string, isSelected: boolean) => {
            if (isSelected) {
                dispatch(nodeSelected(key));
            } else {
                dispatch(nodeDeselected(key));
            }
        },
        onModelChange: (event: ModelChangeEvent<NodeModel, LinkModel>) => {
            switch (event.eventType) {
                case ModelChangeEventType.Remove:
                    if (event.nodeData) {
                        dispatch(removeNode(event.nodeData.key));
                    }
                    if (event.linkData) {
                        dispatch(removeLink(event.linkData));
                    }
                    break;
                default:
                    break;
            }
        },
        onTextChange: (event: UpdateNodeTextEvent) => {
            dispatch(UpdateNodeText(event));
        }
    };
};

const WFDroper: React.FC<WFDroperProps> = ({
    canDrop,
    isOver,
    connectDropTarget,
    model,
    onNodeSelection,
    onModelChange,
    onTextChange
}) => {
    const isActive = canDrop && isOver,
        colors = ['#fff', '#ddd', 'goldenrod'];
    let bgColor = colors[0];
    if (isActive) {
        bgColor = colors[1];
    } else if (canDrop) {
        bgColor = colors[2];
    }

    return (
        <div className="wfDiagram" ref={connectDropTarget} style={{ backgroundColor: bgColor }}>
            <div className="wfTip">{isActive ? 'Release to drop' : 'Drag a box here'}</div>
            <WFDiagram
                model={model}
                onNodeSelection={onNodeSelection}
                onModelChange={onModelChange}
                onTextChange={onTextChange}
            />
        </div>
    );
};

export default DropTarget(
    'WFDropTarget',
    {
        drop: () => ({ name: 'Workflow_Diagram' })
    },
    (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    })
)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(WFDroper)
);
