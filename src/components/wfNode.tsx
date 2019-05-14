import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
import { init, dragStartWfNode, dragEndWfNode, DragNodeEvent } from '../actions/diagram';
import './wfNode.css';

const testData = {
    nodeDataArray: [
        { key: 'Begin', label: '测试', group: '', isGroup: false, data: {} },
        { key: 'group0', label: 'group0', color: '#fff', group: '', isGroup: true },

        { key: 'group00', label: 'gr', color: '#fff', group: 'group0', isGroup: true },

        { key: 'g001', label: 'g001', group: 'group00', isGroup: false },
        { key: 'g0011', label: 'g0011', group: 'group00', isGroup: false },

        { key: 'g1', label: 'g1', group: 'group0', isGroup: false },
        { key: 'g11', label: 'g11', group: 'group0', isGroup: false },
        { key: 'g2', label: 'g2', group: 'group0', isGroup: false },
        { key: 'g22', label: 'g22', group: 'group0', isGroup: false },
        { key: 'End', label: 'End', group: '', isGroup: false },
        { key: '孤独', label: '孤独', group: '', isGroup: false }
    ],
    linkDataArray: [
        { from: 'Begin', to: 'group0', group: '' },
        { from: 'g1', to: 'g11', group: 'group0' },
        { from: 'g2', to: 'g22', group: 'group0' },
        { from: 'group0', to: 'End', group: '' }
    ]
};

export enum wfNodeType {
    /**
     * 打开网页
     */
    OpenWeb = 'OpenWeb',
    /**
     * 点击元素
     */
    MouseClick = 'MouseClick',
    /**
     * 提取数据
     */
    Data = 'Data',
    /**
     * 输入文字
     */
    Input = 'Input',
    /**
     * 识别验证码
     */
    Verify = 'Verify',
    /**
     * 切换下拉选项
     */
    Switch = 'Switch',
    /**
     *判断条件
     */
    Condition = 'Condition',
    /**
     * 循环
     */
    Loop = 'Loop',
    /**
     * 移动鼠标到元素上
     */
    MouseHover = 'MouseHover',
    /**
     * 结束循环
     */
    LoopBreak = 'Loop',
    /**
     * 结束流程
     */
    End = 'End'
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

interface WFNodeDispatchProps {
    initHandler: (type: wfNodeType) => void;
    dragStartWfNodeHandler: (event: DragNodeEvent) => void;
    dragEndWfNodeHandler: (event: DragNodeEvent) => void;
}

interface WFNodeProps extends WFNodeDispatchProps {
    type: wfNodeType;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<WFNodeModel, WFLinkModel>> | Action<DragNodeEvent>>
): WFNodeDispatchProps => {
    return {
        initHandler: (type: wfNodeType) => {
            if (!type) dispatch(init(testData));
        },
        dragStartWfNodeHandler: (event: DragNodeEvent) => dispatch(dragStartWfNode(event)),
        dragEndWfNodeHandler: (event: DragNodeEvent) => {
            dispatch(dragEndWfNode(event));
        }
    };
};

const WFNode: React.FC<WFNodeProps> = ({ type, initHandler, dragStartWfNodeHandler, dragEndWfNodeHandler }) => {
    let isBtn = false;
    let src = '',
        title = '';
    switch (type) {
        case wfNodeType.Condition:
            title = '判断条件';
            src = 'condition';
            break;
        case wfNodeType.Data:
            title = '提取数据';
            src = 'data';
            break;
        case wfNodeType.End:
            title = '结束流程';
            src = 'end';
            break;
        case wfNodeType.Input:
            title = '输入文字';
            src = 'input';
            break;
        case wfNodeType.Loop:
            title = '循环';
            src = 'loop';
            break;
        case wfNodeType.LoopBreak:
            title = '结束循环';
            src = 'loopbreak';
            break;
        case wfNodeType.MouseClick:
            title = '点击元素';
            src = 'mouseclick';
            break;
        case wfNodeType.MouseHover:
            title = '移动鼠标到元素上';
            src = 'mousehover';
            break;
        case wfNodeType.OpenWeb:
            title = '打开网页';
            src = 'openweb';
            break;
        case wfNodeType.Switch:
            title = '切换下拉选项';
            src = 'switch';
            break;
        case wfNodeType.Verify:
            title = '识别验证码';
            src = 'verify';
            break;
        default:
            title = '模拟数据';
            src = 'play';
            isBtn = true;
            break;
    }

    return (
        <div draggable={true}>
            {!type && (
                <div className="wfNode wfNodeBtn" onClick={() => initHandler(type)} title={`${title}`}>
                    <img src={require(`../assets/workflow/${src}.png`)} />
                </div>
            )}
            {!isBtn && (
                <div
                    className="wfNode"
                    data-type={type}
                    onDragStart={(event: any) => {
                        event.dataTransfer.setData('text', event.target.textContent);
                        dragStartWfNodeHandler({ type: type, name: title, event: event });
                    }}
                    onDragEnd={(event: any) => {
                        event.dataTransfer.setData('text', '');
                        //dragEndWfNodeHandler({ type: type, name:title, event: event });
                    }}
                    title={`${title}`}
                >
                    <img src={require(`../assets/workflow/${src}.png`)} />
                </div>
            )}
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFNode);
