import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Reducer } from 'redux';
import {
    NodeEventType,
    NodeEvent,
    DragNodeEvent,
    init,
    updateNodeColor,
    addNode,
    addNodeByDropNode,
    addNodeByDropLink,
    addNodeBySelf,
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeText,
    //getDiagram,
    setDiagram,
    dragStartWfNode,
    dragEndWfNode,
    setNodeHighlight,
    clearNodeHighlight
} from '../actions/diagram';
import go, { Diagram } from 'gojs';
import { BaseNodeModel, DiagramModel, LinkModel } from 'react-gojs';
import { WFNodeType } from '../components/workflow/wfNode';

const randomKey = (len: number = 8): string => {
    len = len < 1 ? 8 : len;
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

export const colors = {
    start: '#69BE70',
    end: '#E06969',
    hover_bg: '#5685d6',
    drag_bg: 'red',
    border: '#000',
    backgroud: '#215ec8',
    font: '#fff',
    hover_font: '#ddd',
    group_border: '#000',
    groupHeader_bg: '#5685d6',
    groupPanel_bg: '#fff',
    groupPanel_hover_bg: '#ddd',
    group_backgroud: '#eee',
    link_hover_bg: '#5685d6',
    link_drag_bg: '#215ec8',
    linkPlus_hover_bg: 'transparent',
    linkPlus_drag_bg: '#215ec8',
    link: '#9EA3AF',
    icon_bg: '#5685d6',
    icon: '#fff',
    transparent: 'transparent'
};

export const DiagramSetting = {
    moveNode: false,
    moveGroup: false,
    padding: 2
};
const isGroupArr: WFNodeType[] = [WFNodeType.Condition, WFNodeType.Loop];

/**
 * store 管理数据
 */
export interface DiagramState {
    // tslint:disable-next-line: no-any
    drager: DragNodeEvent | null;
    diagram: Diagram;
    model: DiagramModel<WFNodeModel, WFLinkModel>;
    selectedNodeKeys: string[];
    currKey: string;
    hightNode: NodeEvent | null;
    isHight: boolean;
}

export interface WFLinkModel extends LinkModel {
    group: string;
    canDroped?: boolean;
    color?: string;
    category?: string;
}

export interface WFNodeModel extends BaseNodeModel {
    label: string;
    group: string;
    isGroup: boolean;
    color?: string;
    canDroped?: boolean;
    category?: string;
}

const getOneNode = (
    payload: string,
    group: string = '',
    isGroup: boolean = false,
    color: string = '',
    isCond: boolean = false
): WFNodeModel => {
    return {
        key: randomKey(),
        label: payload,
        group: group,
        isGroup: isGroup,
        canDroped: false,
        color: color,
        category: isCond ? 'CondtionNode' : ''
    };
};

const getLink = (from: string, to: string, group: string): WFLinkModel => {
    if (from === to) return { from: '', to: '', group: '' };
    return { from: from, to: to, group: group, canDroped: true, color: '' };
};

const initHandler = (state: DiagramState, payload: DiagramModel<WFNodeModel, WFLinkModel>): DiagramState => {
    return {
        ...state,
        model: payload
    };
};

/**
 * 改变颜色
 * @param state
 * @param ev
 */
const updateNodeColorHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    const updatedNodes = state.model.nodeDataArray.map(node => {
        return {
            ...node,
            color: ev.eType === NodeEventType.LinkHightLight ? colors.group_backgroud : colors.hover_bg
        };
    });

    // const updatedLinks = state.model.linkDataArray.map(link => {
    //     return {
    //         ...link
    //     };
    // });

    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: updatedNodes
        }
    };
};

/**
 * 重命名
 * @param state
 * @param payload
 */
const updateNodeTextHandler = (state: DiagramState, payload: NodeEvent): DiagramState => {
    if (payload.eType !== NodeEventType.Rename) {
        return state;
    }
    if (!payload.key || !payload.name) {
        return state;
    }

    const nodeIndex = state.model.nodeDataArray.findIndex(node => node.key === payload.key);

    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: [
                ...state.model.nodeDataArray.slice(0, nodeIndex),
                {
                    ...state.model.nodeDataArray[nodeIndex],
                    label: payload.name
                },
                ...state.model.nodeDataArray.slice(nodeIndex + 1)
            ]
        }
    };
};

/**
 * 选中后 添加 node
 * @param state
 * @param payload
 */
const addNodeHandler = (state: DiagramState, payload: string): DiagramState => {
    const linksToAdd: WFLinkModel[] = state.selectedNodeKeys.map(parent => {
        return { from: parent, to: payload, group: '' };
    });
    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: [...state.model.nodeDataArray, getOneNode(payload)],
            linkDataArray:
                linksToAdd.length > 0
                    ? [...state.model.linkDataArray].concat(linksToAdd)
                    : [...state.model.linkDataArray]
        }
    };
};

/**
 * 添加相同节点
 * @param state
 * @param ev
 */
const addNodeBySelfHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    if (!ev.toNode || !ev.toNode.key) {
        return state;
    }

    let ind = -1;
    let oldline: WFLinkModel;
    let link_Add: WFLinkModel[] = [];
    let node = getOneNode(`${ev.toNode.label}`, ev.toNode.group, false, '', true);
    if (ev.eType === NodeEventType.AddPrvNode) {
        ind = state.model.linkDataArray.findIndex(x => x.to === ev.toNode!.key);
        if (ind < 0) {
            link_Add.push(getLink(node.key, ev.toNode!.key, ev.toNode!.group));
        } else {
            // oldline = state.model.linkDataArray[ind];
            // link_Add = [getLink(oldline.from,node.key,ev.toNode!.group),getLink(node.key,oldline.to,ev.toNode!.group)]
        }
    } else {
        ind = state.model.linkDataArray.findIndex(x => x.from === ev.toNode!.key);
        if (ind < 0) {
            link_Add.push(getLink(ev.toNode!.key, node.key, ev.toNode!.group));
        } else {
        }
    }

    if (ind > -1) {
        oldline = state.model.linkDataArray[ind];
        link_Add = [getLink(oldline.from, node.key, ev.toNode!.group), getLink(node.key, oldline.to, ev.toNode!.group)];
    }

    // const ind = state.model.nodeDataArray.findIndex(x => x.key === ev.toNode!.key);
    // if (ind < 0) {
    //     return state;
    // }

    //var node = getOneNode(`${ev.toNode.label}-${++count}`, ev.toNode.group, false, '', true)

    // if (ev.eType === NodeEventType.AddPrvNode && ind > 0) {
    //     state.model.nodeDataArray.splice(ind, 0, node)
    // }

    // if (ev.eType === NodeEventType.AddNextNode) {
    //     state.model.nodeDataArray.splice(ind + 1, 0, node)
    // }
    link_Add.map(x => {
        x.category = 'CondtionLink';
    });

    return {
        ...state,
        model: {
            nodeDataArray: [...state.model.nodeDataArray, node],
            linkDataArray:
                ind > -1
                    ? [
                          ...state.model.linkDataArray.slice(0, ind),
                          ...state.model.linkDataArray.slice(ind + 1),
                          ...link_Add
                      ]
                    : [...state.model.linkDataArray, ...link_Add]
        }
    };
};

/**
 * drop 压在node 后添加 node
 * @param state
 * @param payload
 */
const addNodeAfterDropNodeHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    if (!ev.toNode || !ev.toNode.key) {
        return state;
    }

    let node: WFNodeModel;
    let nodeAdd: boolean = false;
    let linkAction: boolean = true;
    let nodes_Con: WFNodeModel[] = [];
    let links_Con: WFLinkModel[] = [];
    // 1、锁定节点
    switch (ev.eType) {
        case NodeEventType.Drag2Node:
        case NodeEventType.Drag2Group:
            // 1.1 如果是新节点
            if (!state.drager) {
                return state;
            }

            node = getOneNode(state.drager.name, ev.toNode.group);
            if (ev.eType === NodeEventType.Drag2Group) {
                node.group = ev.toNode.key;
                linkAction = false;
            }

            if (isGroupArr.includes(state.drager.type)) {
                node.isGroup = true;
                node.color = colors.group_backgroud;
                if (state.drager.type === WFNodeType.Condition) {
                    node.isGroup = false;

                    node.category = 'Condtion';
                    // 1.2 默认生成两个字条件
                    let n: WFNodeModel;
                    for (let i = 0; i < 2; i++) {
                        n = getOneNode(state.drager.name, node.key, false, colors.group_backgroud, true);
                        nodes_Con.push(n);
                    }
                    links_Con.push({
                        ...getLink(nodes_Con[0].key, nodes_Con[1].key, nodes_Con[1].group),
                        ...{ category: 'CondtionLink' }
                    });
                }
            }
            nodeAdd = true;
            break;
        case NodeEventType.Move2Node:
        case NodeEventType.Move2Group:
            // 1.2 如果是拖动已有节点
            const ind = state.model.nodeDataArray.findIndex(x => x.key === state.currKey);
            if (ind < 0) {
                return state;
            }
            node = state.model.nodeDataArray[ind];
            // 1.3 组内拖动
            if (ev.eType === NodeEventType.Move2Group && node.group == ev.toNode.key) {
                return state;
                // node.group = ev.toNode.key;
                // linkAdd = false;
            }
            break;
        default:
            return state;
    }

    let oldLink: WFLinkModel;
    let linkToRemoveIndex = -1;
    const linksToAdd: WFLinkModel[] = [];
    linkToRemoveIndex = state.model.linkDataArray.findIndex(x => x.from === ev.toNode!.key);
    if (linkAction) {
        if (linkToRemoveIndex > -1) {
            oldLink = state.model.linkDataArray[linkToRemoveIndex];
        }

        // 3、新增的两条线
        if (linkToRemoveIndex > -1) {
            linksToAdd.push(getLink(oldLink!.from, node.key, oldLink!.group));
            linksToAdd.push(getLink(node.key, oldLink!.to, oldLink!.group));
        } else {
            linksToAdd.push(getLink(ev.toNode!.key, node.key, ev.toNode!.group));
        }
    }

    return {
        ...state,
        drager: null,
        currKey: '',
        model: {
            nodeDataArray: nodeAdd
                ? [...state.model.nodeDataArray, ...nodes_Con, node]
                : [...state.model.nodeDataArray, ...nodes_Con],
            linkDataArray:
                linkAction && linkToRemoveIndex > -1
                    ? [
                          ...state.model.linkDataArray.slice(0, linkToRemoveIndex),
                          ...state.model.linkDataArray.slice(linkToRemoveIndex + 1),
                          ...linksToAdd,
                          ...links_Con
                      ]
                    : [...state.model.linkDataArray, ...linksToAdd, ...links_Con]
        }
    };

    return state;
};

/**
 * drop 压在link 后添加 node
 * @param state
 * @param payload
 */
const addNodeAfterDropLinkHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    if (!ev.toLink || !ev.toLink.from) {
        return state;
    }

    let node: WFNodeModel;
    let nodeAdd: boolean = false;

    let nodes_Con: WFNodeModel[] = [];
    let links_Con: WFLinkModel[] = [];
    // 1、锁定节点
    switch (ev.eType) {
        case NodeEventType.Drag2Link:
            // 1.1 如果是新节点
            if (!state.drager) {
                return state;
            }
            node = getOneNode(state.drager.name, ev.toLink.group);
            if (isGroupArr.includes(state.drager.type)) {
                node.isGroup = true;
                node.color = colors.group_backgroud;
                if (state.drager.type === WFNodeType.Condition) {
                    node.isGroup = false;

                    node.category = 'Condtion';
                    // 1.2 默认生成两个字条件
                    let n: WFNodeModel;
                    for (let i = 0; i < 2; i++) {
                        n = getOneNode(state.drager.name, node.key, false, colors.group_backgroud, true);
                        nodes_Con.push(n);
                    }
                    links_Con.push({
                        ...getLink(nodes_Con[0].key, nodes_Con[1].key, nodes_Con[1].group),
                        ...{ category: 'CondtionLink' }
                    });
                }
            }
            nodeAdd = true;
            break;
        case NodeEventType.Move2Link:
            // 1.2 如果是拖动已有节点
            const ind = state.model.nodeDataArray.findIndex(x => x.key === state.currKey);
            if (ind < 0) {
                return state;
            }
            node = state.model.nodeDataArray[ind];
            break;
        default:
            return state;
    }

    // 2、被压的线要移除
    let linkToRemoveIndex = -1;
    // 3、新增的两条线
    const linksToAdd: WFLinkModel[] = [];

    linksToAdd.push(getLink(ev.toLink.from, node.key, ev.toLink.group));
    linksToAdd.push(getLink(node.key, ev.toLink.to, ev.toLink.group));
    linkToRemoveIndex = state.model.linkDataArray.findIndex(
        link => link.from === ev.toLink!.from && link.to === ev.toLink!.to
    );
    console.log(linkToRemoveIndex + '12121212');
    return {
        ...state,
        drager: null,
        currKey: '',
        model: {
            nodeDataArray: nodeAdd
                ? [...state.model.nodeDataArray, ...nodes_Con, node]
                : [...state.model.nodeDataArray, ...nodes_Con],
            linkDataArray:
                linkToRemoveIndex > -1
                    ? [
                          ...state.model.linkDataArray.slice(0, linkToRemoveIndex),
                          ...state.model.linkDataArray.slice(linkToRemoveIndex + 1),
                          ...linksToAdd,
                          ...links_Con
                      ]
                    : [...state.model.linkDataArray, ...linksToAdd, ...links_Con]
        }
    };
};

/**
 * 删除 节点
 * @param state
 * @param payload
 */
const removeNodeHandler = (state: DiagramState, payload: NodeEvent): DiagramState => {
    if (payload.eType != NodeEventType.Delete) return state;
    const nodeToRemoveIndex = state.model.nodeDataArray.findIndex(node => node.key === payload.key);
    if (nodeToRemoveIndex === -1) {
        return state;
    }
    return {
        ...state,
        model: {
            nodeDataArray: [
                ...state.model.nodeDataArray.slice(0, nodeToRemoveIndex),
                ...state.model.nodeDataArray.slice(nodeToRemoveIndex + 1)
            ],
            linkDataArray: payload.newLinks
                ? [...state.model.linkDataArray, ...payload.newLinks]
                : state.model.linkDataArray
        }
    };
};

/**
 * 删除 连线
 * @param state
 * @param payload
 */
const removeLinkHandler = (state: DiagramState, payload: WFLinkModel): DiagramState => {
    const linkToRemoveIndex = state.model.linkDataArray.findIndex(
        link => link.from === payload.from && link.to === payload.to
    );
    if (linkToRemoveIndex === -1) {
        return state;
    }
    return {
        ...state,
        model: {
            ...state.model,
            linkDataArray: [
                ...state.model.linkDataArray.slice(0, linkToRemoveIndex),
                ...state.model.linkDataArray.slice(linkToRemoveIndex + 1)
            ]
        }
    };
};

/**
 * 选中节点
 * @param state
 * @param payload
 */
const nodeSelectedHandler = (state: DiagramState, payload: string): DiagramState => {
    return {
        ...state,
        currKey: payload,
        selectedNodeKeys: [...state.selectedNodeKeys, payload]
    };
};

const nodeDeselectedHandler = (state: DiagramState, payload: string): DiagramState => {
    const nodeIndexToRemove = state.selectedNodeKeys.findIndex(key => key === payload);
    if (nodeIndexToRemove === -1) {
        return state;
    }
    return {
        ...state,
        currKey: '',
        selectedNodeKeys: [
            ...state.selectedNodeKeys.slice(0, nodeIndexToRemove),
            ...state.selectedNodeKeys.slice(nodeIndexToRemove + 1)
        ]
    };
};

// /**
//  * 选中节点
//  * @param state
//  * @param payload
//  */
// const nodeDropedtoHandler = (state: DiagramState, payload: string): DiagramState => {
//     return {
//         ...state
//     };
// };

// /**
//  * 选中节点
//  * @param state
//  * @param payload
//  */
// const linkDropedHandler = (state: DiagramState, payload: WFLinkModel): DiagramState => {
//     return {
//         ...state
//     };
// };

const setDiagramHandler = (state: DiagramState, payload: Diagram): DiagramState => {
    return { ...state, diagram: payload };
};

// const getDiagramHandler = (state: DiagramState): DiagramState => {
//     return state;
// };

const dragStartWfNodeHandler = (state: DiagramState, payload: DragNodeEvent): DiagramState => {
    return {
        ...state,
        drager: payload
    };
};

const dragEndWfNodeHandler = (state: DiagramState, payload: DragNodeEvent): DiagramState => {
    return {
        ...state,
        drager: null
    };
};

// tslint:disable-next-line: no-any
const setNodeHighlightHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    // may be null
    // if (ev.eType == NodeEventType.HightLightNode) {
    //     let oldskips = state.diagram.skipsUndoManager;
    //     state.diagram.skipsUndoManager = true;
    //     state.diagram.startTransaction('highlight');
    //     if (ev.toNode !== null) {
    //         state.diagram.highlight(ev.toNode as any);
    //     } else {
    //         state.diagram.clearHighlighteds();
    //     }
    //     state.diagram.commitTransaction('highlight');
    //     state.diagram.skipsUndoManager = oldskips;

    // }

    let nodeToRemoveIndex = -1;

    if (ev.eType === NodeEventType.HightLightNode && ev.toNode!.key) {
        state.model.nodeDataArray.map(x => {
            x.color = x.key === ev.toNode!.key ? colors.drag_bg : colors.backgroud;
            return x;
        });

        state.model.linkDataArray.map(x => {
            x.color = colors.link_hover_bg;
            return x;
        });

        //state.model
        nodeToRemoveIndex = state.model.nodeDataArray.findIndex(node => node.key === ev.toNode!.key);
        if (nodeToRemoveIndex === -1) {
            return state;
        }
        return {
            ...state,
            model: {
                ...state.model
            }
        };
    }

    return {
        ...state,
        isHight: true,
        hightNode: ev
    };
};

// tslint:disable-next-line: no-any
const clearNodeHighlightHandler = (state: DiagramState): DiagramState => {
    // may be null
    // var oldskips = state.diagram.skipsUndoManager;
    // state.diagram.skipsUndoManager = true;
    // state.diagram.startTransaction('highlight');
    // if (node !== null) {
    //     state.diagram.highlight(node);
    // } else {
    //     state.diagram.clearHighlighteds();
    // }
    // state.diagram.commitTransaction('highlight');
    // state.diagram.skipsUndoManager = oldskips;

    var nodes = state.model.nodeDataArray.map(x => {
        x.color = '';
        return x;
    });
    return {
        ...state,
        model: {
            nodeDataArray: { ...nodes },
            linkDataArray: state.model.linkDataArray
        },
        hightNode: null,
        isHight: false
    };
};

const getModel = () => {
    let s = getOneNode('');
    let n = getOneNode('');

    return {
        nodeDataArray: [{ ...s, ...{ category: 'Start' } }, { ...n, ...{ category: 'End' } }],
        linkDataArray: [{ ...getLink(s.key, n.key, ''), ...{ lenth: 500 } }]
    };
};

export const diagramReducer: Reducer<DiagramState> = reducerWithInitialState<DiagramState>({
    drager: null,
    currKey: '',
    diagram: new go.Diagram(),
    model: getModel(),
    selectedNodeKeys: [],
    hightNode: null,
    isHight: false
})
    .case(init, initHandler)
    .case(updateNodeColor, updateNodeColorHandler)
    .case(UpdateNodeText, updateNodeTextHandler)

    .case(addNode, addNodeHandler)
    .case(addNodeByDropNode, addNodeAfterDropNodeHandler)
    .case(addNodeByDropLink, addNodeAfterDropLinkHandler)
    .case(addNodeBySelf, addNodeBySelfHandler)

    .case(removeNode, removeNodeHandler)
    .case(removeLink, removeLinkHandler)

    .case(nodeSelected, nodeSelectedHandler)
    .case(nodeDeselected, nodeDeselectedHandler)

    .case(setDiagram, setDiagramHandler)

    .case(dragStartWfNode, dragStartWfNodeHandler)
    .case(dragEndWfNode, dragEndWfNodeHandler)

    .case(setNodeHighlight, setNodeHighlightHandler)
    .case(clearNodeHighlight, clearNodeHighlightHandler)
    .build();

export const diagramState = (state: DiagramState) => state;
export const modelSelector = (state: DiagramState) => state.model;
export const nodeSelectionSelector = (state: DiagramState) => state.selectedNodeKeys;
