import React from 'react';
import { DragSource, DragSourceMonitor, ConnectDragSource, DragSourceConnector } from 'react-dnd';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, NodeModel } from '../reducers/diagramReducer';
import { DiagramModel, LinkModel } from 'react-gojs';
import { init, updateNodeColor, addNode } from '../actions/diagram';
import './wfNode.css';

export enum wfNodeType {
    Btn_Start = '开始',
    Btn_Reset = '重置',
    Click = '点击',
    Data = '提取数据',
    End = '结束'
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

interface WFNodeDispatchProps {
    initHandler123: (type: wfNodeType) => void;
    updateNodeColorHandler: () => void;
    addNodeHandler: (type: wfNodeType) => void;
}

interface WFNodeProps extends WFNodeDispatchProps {
    type: wfNodeType;
    isDragging: boolean;
    connectDragSource: ConnectDragSource;
    initHandler123: (type: wfNodeType) => void;
    updateNodeColorHandler: () => void;
    addNodeHandler: (type: wfNodeType) => void;
}
let dispatch1;
let count = 0;
const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<NodeModel, LinkModel>> | Action<void> | Action<string>>
): WFNodeDispatchProps => {
    dispatch1 = dispatch;

    return {
        initHandler123: (type: wfNodeType) => {
            let initNodes = {
                nodeDataArray: [
                    { key: 'Begin', label: 'Begin', color: 'lightblue' },
                    { key: 'End', label: 'End', color: 'grey' }
                ],
                linkDataArray: [{ from: 'Begin', to: 'End' }]
            };

            if (type == wfNodeType.Btn_Start) {
                dispatch(init(initNodes));
            }

            if (type == wfNodeType.Btn_Reset) {
                initNodes.nodeDataArray = [
                    { key: 'Begin', label: '测试', color: 'lightblue' },
                    { key: 'Beta', label: 'Beta', color: 'orange' },
                    { key: 'Gamma', label: 'Gamma', color: 'lightgreen' },
                    { key: 'Delta', label: 'Delta', color: 'pink' },
                    { key: 'End', label: 'End', color: 'grey' }
                ];
                initNodes.linkDataArray = [
                    { from: 'Begin', to: 'Beta' },
                    { from: 'Begin', to: 'Gamma' },
                    { from: 'Beta', to: 'Delta' },
                    { from: 'Begin', to: 'End' }
                ];
                dispatch(init(initNodes));
            }
        },
        updateNodeColorHandler: () => dispatch(updateNodeColor()),
        addNodeHandler: type => {
            dispatch(addNode(`${type}-${++count}`));
        }
    };
};

const WFNode: React.FC<WFNodeProps> = ({
    type,
    isDragging,
    connectDragSource,
    initHandler123,
    updateNodeColorHandler,
    addNodeHandler
}) => {
    const opacity = isDragging ? 0.4 : 1;
    let isBtn = [wfNodeType.Btn_Start, wfNodeType.Btn_Reset].includes(type);
    return (
        <div
            className={`wfNode ${isBtn ? 'wfNodeBtn' : ''}`}
            ref={connectDragSource}
            style={{ opacity: opacity }}
            onClick={() => initHandler123(type)}
            title={`可${isBtn ? '点击' : '拖拽'} \n\r ${type}`}
        >
            {type}
        </div>
    );
};

export default DragSource(
    'WFDropTarget',
    {
        canDrag: (props: WFNodeProps) => {
            return ![wfNodeType.Btn_Start, wfNodeType.Btn_Reset].includes(props.type);
        },
        beginDrag: (props: WFNodeProps) => {
            console.log(`You beginDrag ${props.type} !`);
            return props;
        },
        endDrag(props: WFNodeProps, monitor: DragSourceMonitor, component: WFNodeProps) {
            const item = monitor.getItem();
            const dropResult = monitor.getDropResult();

            if (dropResult) {
                // TODO 调起增加节点的事件
                mapDispatchToProps(dispatch1).addNodeHandler(props.type);
                console.log(`You dropped ${item.type} into ${dropResult.name}!`);
            }
        }
    },
    (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(WFNode)
);
