import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
import { init, updateNodeColor, addNode } from '../actions/diagram';
import './wfNode.css';

export enum wfNodeType {
    Btn_Start = '开始',
    Btn_Reset = '重置',
    Click = '点击',
    Condition = '条件',
    Loop = '循坏',
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
}

let count = 0;
const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<WFNodeModel, WFLinkModel>> | Action<string> | Action<void> | Action<number>>
): WFNodeDispatchProps => {
    return {
        initHandler: (type: wfNodeType) => {
            let initNodes = {
                nodeDataArray: [
                    { key: 'Begin', label: 'Begin', color: 'lightblue', group: '', isGroup: false },
                    { key: 'End', label: 'End', color: 'grey', group: '', isGroup: false }
                ],
                linkDataArray: [{ from: 'Begin', to: 'End', color: 'pink', group: '' }]
            };

            if (type === wfNodeType.Btn_Start) {
                dispatch(init(initNodes));
            }

            if (type === wfNodeType.Btn_Reset) {
                initNodes.nodeDataArray = [
                    { key: 'Begin', label: '测试', color: 'lightblue', group: '', isGroup: false },
                    { key: 'group0', label: 'group0', color: 'orange', group: '', isGroup: true },
                    { key: 'g1', label: 'g1', color: 'lightgreen', group: 'group0', isGroup: false },
                    { key: 'g11', label: 'g11', color: 'pink', group: 'group0', isGroup: false },
                    { key: 'g2', label: 'g2', color: 'lightgreen', group: 'group0', isGroup: false },
                    { key: 'g22', label: 'g22', color: 'pink', group: 'group0', isGroup: false },
                    { key: 'End', label: 'End', color: 'grey', group: '', isGroup: false },
                    { key: '孤独', label: '孤独', color: 'lightgreen', group: '', isGroup: false }
                ];
                initNodes.linkDataArray = [
                    { from: 'Begin', to: 'group0', color: 'pink', group: '' },
                    { from: 'g1', to: 'g11', color: 'pink', group: '' },
                    { from: 'g2', to: 'g22', color: 'pink', group: '' },
                    // { from: 'Beta', to: 'Delta', color: 'pink' },
                    { from: 'group0', to: 'End', color: 'pink', group: '' }
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

const WFNode: React.FC<WFNodeProps> = ({ type, initHandler, updateNodeColorHandler, addNodeHandler }) => {
    let isBtn = [wfNodeType.Btn_Start, wfNodeType.Btn_Reset].includes(type);
    return (
        <div>
            {isBtn && (
                <div
                    className="wfNode wfNodeBtn"
                    onClick={() => initHandler(type)}
                    data-type={type}
                    data-isGroup={[wfNodeType.Condition, wfNodeType.Loop].includes(type)}
                    title={`可${isBtn ? '点击' : '拖拽'} \n\r ${type}`}
                >
                    {type}
                </div>
            )}
            {!isBtn && (
                <div
                    className="wfNode"
                    draggable={true}
                    onClick={() => initHandler(type)}
                    title={`可${isBtn ? '点击' : '拖拽'} \n\r ${type}`}
                >
                    {type}
                </div>
            )}
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFNode);
