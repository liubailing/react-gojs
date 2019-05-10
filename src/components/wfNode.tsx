import React from 'react';
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
}

let count = 0;
const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<NodeModel, LinkModel>> | Action<string> | Action<void> | Action<number>>
): WFNodeDispatchProps => {
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

const WFNode: React.FC<WFNodeProps> = ({ type, initHandler, updateNodeColorHandler, addNodeHandler }) => {
    let isBtn = [wfNodeType.Btn_Start, wfNodeType.Btn_Reset].includes(type);
    return (
        <div>
            {isBtn && (
                <div
                    className="wfNode wfNodeBtn"
                    onClick={() => initHandler(type)}
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
