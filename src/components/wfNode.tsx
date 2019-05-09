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
    initHandler: (type: wfNodeType) => void;
    updateNodeColorHandler: () => void;
    addNodeHandler: (type: wfNodeType) => void;
}

interface WFNodeProps extends WFNodeDispatchProps {
    type: wfNodeType;
    isDragging: boolean;
    connectDragSource: ConnectDragSource;
    initHandler: (type: wfNodeType) => void;
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
        initHandler: (type: wfNodeType) => {
            let initNodes = {
                nodeDataArray: [
                    { key: 'Begin', label: 'Begin', color: 'lightblue', group: 'Begin' },
                    { key: 'End', label: 'End', color: 'grey', group: 'Begin' }
                ],
                linkDataArray: [{ from: 'Begin', to: 'End', color: 'pink' }]
            };

            if (type == wfNodeType.Btn_Start) {
                dispatch(init(initNodes));
            }

            if (type == wfNodeType.Btn_Reset) {
                initNodes.nodeDataArray = [
                    { key: 'Begin', label: '测试', color: 'lightblue', group: 'Begin' },
                    { key: 'Beta', label: 'Beta', color: 'orange', group: 'Begin' },
                    { key: 'Gamma', label: 'Gamma', color: 'lightgreen', group: 'Begin' },
                    { key: 'Delta', label: 'Delta', color: 'pink', group: 'Begin' },
                    { key: 'End', label: 'End', color: 'grey', group: 'Begin' }
                ];
                initNodes.linkDataArray = [
                    { from: 'Begin', to: 'Beta', color: 'pink' },
                    { from: 'Beta', to: 'Gamma', color: 'pink' },
                    { from: 'Beta', to: 'Delta', color: 'pink' },
                    { from: 'Begin', to: 'End', color: 'pink' }
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
    initHandler,
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
            onClick={() => initHandler(type)}
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
