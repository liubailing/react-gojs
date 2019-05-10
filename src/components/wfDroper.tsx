import React from 'react';
import { DropTarget, ConnectDropTarget, DropTargetMonitor, DropTargetConnector } from 'react-dnd';
import './wfDiagram.css';
import { DiagramState, modelSelector, NodeModel } from '../reducers/diagramReducer';
import { connect } from 'react-redux';
import { DiagramModel, LinkModel } from 'react-gojs';
import WFDiagram from './wfDiagram';

interface WFDroperProps {
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

const WFDroper: React.FC<WFDroperProps> = ({ canDrop, isOver, connectDropTarget, model }) => {
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
            <WFDiagram model={model} />
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
)(connect(mapStateToProps)(WFDroper));
