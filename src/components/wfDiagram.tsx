import React from 'react';
import { DropTarget, ConnectDropTarget, DropTargetMonitor, DropTargetConnector } from 'react-dnd';
import { wfNodeType } from './wfNode';
import './wfDiagram.css';

export interface DustbinProps {
    canDrop: boolean;
    isOver: boolean;
    connectDropTarget: ConnectDropTarget;
}

const Dustbin: React.FC<DustbinProps> = ({ canDrop, isOver, connectDropTarget }) => {
    const isActive = canDrop && isOver;
    let backgroundColor = 'wfDiagram-bg1';
    if (isActive) {
        backgroundColor = 'wfDiagram-bg2';
    } else if (canDrop) {
        backgroundColor = 'wfDiagram-bg3';
    }

    return (
        <div className={`wfDiagram ${backgroundColor}`} ref={connectDropTarget}>
            {isActive ? 'Release to drop' : 'Drag a box here'}
        </div>
    );
};

export default DropTarget(
    wfNodeType.Start,
    {
        drop: () => ({ name: 'Dustbin' })
    },
    (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    })
)(Dustbin);
