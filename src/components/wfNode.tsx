import React from 'react';
import { DragSource, DragSourceMonitor, ConnectDragSource, DragSourceConnector } from 'react-dnd';
import './wfNode.css';
export enum wfNodeType {
    Start = '开始',
    Click = '点击',
    Data = '提取数据',
    End = '结束'
}

export interface BoxProps {
    type: wfNodeType;
    isDragging: boolean;
    connectDragSource: ConnectDragSource;
}
const wfNode: React.FC<BoxProps> = ({ type, isDragging, connectDragSource }) => {
    const opacity = isDragging ? 0.4 : 1;
    return (
        <div className="wfNode" ref={connectDragSource} style={{ opacity }}>
            {type}
        </div>
    );
};

export default DragSource(
    wfNodeType.Start,
    {
        canDrag: (props: BoxProps) => {
            return props.type !== wfNodeType.Start;
        },
        beginDrag: (props: BoxProps) => ({ type: props.type }),
        endDrag(props: BoxProps, monitor: DragSourceMonitor) {
            const item = monitor.getItem();
            const dropResult = monitor.getDropResult();

            if (dropResult) {
                console.log(`You dropped ${item.type} into ${dropResult.name}!`);
            }
        }
    },
    (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)(wfNode);
