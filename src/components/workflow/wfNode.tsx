import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Action } from 'typescript-fsa';
import { DiagramState, WFNodeModel, WFLinkModel, DiagramCategory } from '../../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
import {
    init,
    dragStartWfNode,
    dragEndWfNode,
    updateNodeColor,
    DragNodeEvent,
    NodeEvent,
    NodeEventType
} from '../../actions/diagram';
import './wfNode.css';

const getData = (): DiagramModel<WFNodeModel, WFLinkModel> => {
    const testData: DiagramModel<WFNodeModel, WFLinkModel> = {
        nodeDataArray: [
            { key: 'Begin', label: '起始', wfType: 'start', group: '', isGroup: false },

            { key: 'condition1', label: '条件1', wfType: 'condition', group: '', isGroup: true, hasChild: true },
            {
                key: 'tioajian11',
                label: '条件1 - 分支1',
                wfType: 'conditionswitch',
                group: 'condition1',
                isGroup: true,
                hasChild: true
            },
            { key: 'click1', label: '点击', wfType: 'mouseclick', group: 'tioajian11', isGroup: false },
            { key: 'data', label: '提取数据', wfType: 'getdata', group: 'tioajian11', isGroup: false },
            {
                key: 'tioajian12',
                label: '条件1 - 分支2',
                wfType: 'conditionswitch',
                group: 'condition1',
                isGroup: true,
                hasChild: false
            },

            { key: 'loop1', label: '循环', wfType: 'loop', group: '', isGroup: true, hasChild: true },
            { key: 'click2', label: '点击2', wfType: 'mouseclick', group: 'loop1', isGroup: false },

            { key: 'condition2', label: '条件2', wfType: 'condition', group: 'loop1', isGroup: true, hasChild: true },
            {
                key: 'condition21',
                label: '条件2-1',
                wfType: 'conditionswitch',
                group: 'condition2',
                isGroup: true,
                hasChild: true
            },
            { key: 'condition22', label: '条件2-2', wfType: 'conditionswitch', group: 'condition2', isGroup: true },

            { key: 'End', label: '', wfType: 'end', group: '', isGroup: false }
        ],
        linkDataArray: [
            { from: 'Begin', to: 'condition1', group: '', isCondition: false },
            { from: 'condition1', to: 'loop1', group: 'group0', isCondition: false },
            { from: 'click1', to: 'data', group: 'group0', isCondition: false },
            { from: 'click2', to: 'condition2', group: 'group0', isCondition: false },
            { from: 'loop1', to: 'End', group: '', isCondition: false },

            /**比较特殊的 条件线 */
            { from: 'tioajian11', to: 'tioajian12', group: 'condition1', isCondition: true },
            { from: 'condition21', to: 'condition21', group: 'condition2', isCondition: true }
        ]
    };

    testData.nodeDataArray.map(x => {
        let cate = DiagramCategory.WFNode;
        switch (x.wfType as WFNodeType) {
            case WFNodeType.Data:
            case WFNodeType.SubEnd:
            case WFNodeType.Input:
            case WFNodeType.LoopBreak:
            case WFNodeType.MouseClick:
            case WFNodeType.MouseHover:
            case WFNodeType.OpenWeb:
            case WFNodeType.Switch:
            case WFNodeType.Verify:
                cate = DiagramCategory.WFNode;
                break;

            case WFNodeType.Loop:
                cate = DiagramCategory.LoopGroup;
                break;
            case WFNodeType.Condition:
                cate = DiagramCategory.ConditionGroup;
                break;
            case WFNodeType.ConditionSwitch:
                cate = DiagramCategory.Condition;
                break;
            case WFNodeType.Start:
                cate = DiagramCategory.Start;
                break;
            case WFNodeType.End:
                cate = DiagramCategory.End;
                break;

            default:
                cate = DiagramCategory.WFNode;
                break;
        }
        x.category = cate;
        return x;
    });

    testData.linkDataArray.map(x => {
        x.category = x.isCondition ? DiagramCategory.ConditionLink : DiagramCategory.WFLink;
    });

    return testData;
};

//节点类型
export enum WFNodeType {
    /**
     * 起始
     */
    Start = 'start',
    /**
     * 结束
     */
    End = 'end',

    /**
     * 打开网页
     */
    OpenWeb = 'openweb',
    /**
     * 点击元素
     */
    MouseClick = 'mouseclick',
    /**
     * 提取数据
     */
    Data = 'data',
    /**
     * 输入文字
     */
    Input = 'input',
    /**
     * 识别验证码
     */
    Verify = 'verify',
    /**
     * 切换下拉选项
     */
    Switch = 'switch',
    /**
     * 判断条件
     */
    Condition = 'condition',
    /**
     * 判断条件 分支
     */
    ConditionSwitch = 'conditionswitch',
    /**
     * 循环
     */
    Loop = 'loop',
    /**
     * 移动鼠标到元素上
     */
    MouseHover = 'mousehover',
    /**
     * 结束循环
     */
    LoopBreak = 'loopend',
    /**
     * 某个流程结束
     */
    SubEnd = 'subend'
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

interface WFNodeDispatchProps {
    initHandler: (type: WFNodeType) => void;
    dragStartWfNodeHandler: (event: DragNodeEvent) => void;
    dragEndWfNodeHandler: (event: DragNodeEvent) => void;
    updateNodeColorHander: (event: NodeEvent) => void;
}

interface WFNodeProps extends WFNodeDispatchProps {
    type: WFNodeType;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<DiagramModel<WFNodeModel, WFLinkModel>> | Action<DragNodeEvent> | Action<NodeEvent>>
): WFNodeDispatchProps => {
    return {
        initHandler: (type: WFNodeType) => {
            // tslint:disable-next-line: curly
            if (!type) dispatch(init(getData()));
        },
        dragStartWfNodeHandler: (event: DragNodeEvent) => dispatch(dragStartWfNode(event)),
        dragEndWfNodeHandler: (event: DragNodeEvent) => dispatch(dragEndWfNode(event)),
        updateNodeColorHander: (event: NodeEvent) => dispatch(updateNodeColor(event))
    };
};

const WFNode: React.FC<WFNodeProps> = ({
    type,
    initHandler,
    dragStartWfNodeHandler,
    dragEndWfNodeHandler,
    updateNodeColorHander
}) => {
    let isBtn = false;
    let src = '',
        title = '';
    switch (type) {
        case WFNodeType.Condition:
            title = '判断条件';
            src = 'condition';
            break;
        case WFNodeType.Data:
            title = '提取数据';
            src = 'data';
            break;
        case WFNodeType.SubEnd:
            title = '结束流程';
            src = 'end';
            break;
        case WFNodeType.Input:
            title = '输入文字';
            src = 'input';
            break;
        case WFNodeType.Loop:
            title = '循环';
            src = 'loop';
            break;
        case WFNodeType.LoopBreak:
            title = '结束循环';
            src = 'loopbreak';
            break;
        case WFNodeType.MouseClick:
            title = '点击元素';
            src = 'mouseclick';
            break;
        case WFNodeType.MouseHover:
            title = '移动鼠标到元素上';
            src = 'mousehover';
            break;
        case WFNodeType.OpenWeb:
            title = '打开网页';
            src = 'openweb';
            break;
        case WFNodeType.Switch:
            title = '切换下拉选项';
            src = 'switch';
            break;
        case WFNodeType.Verify:
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
                    <img src={require(`../../assets/workflow/${src}.png`)} />
                </div>
            )}
            {!isBtn && (
                <div
                    className="wfNode"
                    data-type={type}
                    onDragStart={(event: any) => {
                        event.dataTransfer.setData('text', event.target.textContent);
                        updateNodeColorHander({ eType: NodeEventType.LinkHightLight });
                        dragStartWfNodeHandler({ type: type, name: title, event: event });
                    }}
                    onDragEnd={(event: any) => {
                        event.dataTransfer.setData('text', '');
                        updateNodeColorHander({ eType: NodeEventType.LinkNomal });
                        dragEndWfNodeHandler({ type: type, name: title, event: event });
                    }}
                    title={`${title}`}
                >
                    <img src={require(`../../assets/workflow/${src}.png`)} />
                </div>
            )}
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFNode);
