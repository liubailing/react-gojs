import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Reducer } from 'redux';
import {
    NodeEventType,
    NodeEvent,
    init,
    updateNodeColor,
    addNode,
    addNodeByDropNode,
    addNodeByDropLink,
    //addNodeByDropGroup,
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeText,
    getDiagram,
    setDiagram,
    linkDropedTo,
    nodeDropedTo,
    dragStartWfNode,
    dragEndWfNode,
    DragNodeEvent,
    setNodeHighlight
    //addGroup
} from '../actions/diagram';
import go, { Diagram } from 'gojs';
import { BaseNodeModel, DiagramModel, LinkModel } from 'react-gojs';

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
    hover_bg: '#ddd',
    drag_bg: 'red',
    border: '#000',
    backgroud: '#999',
    font: '#000',
    hover_font: '#ddd',
    group_border: '#000',
    group_backgroud: '#eee',
    link_hover_bg: '#ddd',
    link_drag_bg: 'red',
    link: 'green'
};

/**
 * store 管理数据
 */
export interface DiagramState {
    // tslint:disable-next-line: no-any
    drager: DragNodeEvent | null;
    //newNode: WFNodeModel | null;
    diagram: Diagram;
    model: DiagramModel<WFNodeModel, WFLinkModel>;
    selectedNodeKeys: string[];
    currKey: string;
    // fromNode: WFNodeModel | null;
    // fromNodeKey: string;
    // toNode: WFNodeModel | null;
    // toNodeKey: string;
    // toLine: WFLinkModel | null;
}

export interface WFLinkModel extends LinkModel {
    group: string;
    canDroped?: boolean;
    color?: string;
}

export interface WFNodeModel extends BaseNodeModel {
    label: string;
    group: string;
    isGroup: boolean;
    color?: string;
    canDroped?: boolean;
}

// const colorArr = ['lightblue', 'orange', 'lightgreen', 'pink', 'yellow', 'red', 'grey', 'magenta', 'cyan'];

// const getRandomColor = () => {
//     return colorArr[Math.floor(Math.random() * colorArr.length)];
// };

const getOneNode = (payload: string, group: string = ''): WFNodeModel => {
    return {
        key: randomKey(),
        label: payload,
        group: group,
        isGroup: false,
        canDroped: false
    };
};

// const getDefalutNode = (): WFNodeModel => {
//     return getOneNode('');
// };

const getLink = (from: string, to: string, group: string): WFLinkModel => {
    return { from: from, to: to, group: group, canDroped: true };
};

const initHandler = (state: DiagramState, payload: DiagramModel<WFNodeModel, WFLinkModel>): DiagramState => {
    return {
        ...state,
        model: payload
    };
};

const updateNodeColorHandler = (state: DiagramState): DiagramState => {
    const updatedNodes = state.model.nodeDataArray.map(node => {
        return {
            ...node
        };
    });

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
    if (payload.eType !== NodeEventType.Rename) return state;
    if (!payload.key || !payload.name) return state;

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
        return { from: parent, to: payload, group: '', color: 'pink' };
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
 * drop 压在node 后添加 node
 * @param state
 * @param payload
 */
const addNodeAfterDropNodeHandler = (state: DiagramState, ev: NodeEvent): DiagramState => {
    if (!ev.toNode || !ev.toNode.key) return state;

    let node: WFNodeModel;
    let nodeAdd: boolean = false;
    let linkAdd: boolean = true;

    // 1、锁定节点
    switch (ev.eType) {
        case NodeEventType.Drag2Node:
        case NodeEventType.Drag2Group:
            //1.1 如果是新节点
            if (!state.drager) return state;
            node = getOneNode(state.drager.name, ev.toNode.group);
            if (ev.eType == NodeEventType.Drag2Group) {
                node.group = ev.toNode.key;
                linkAdd = false;
            }
            nodeAdd = true;
            break;
        case NodeEventType.Move2Node:
        case NodeEventType.Move2Group:
            // 1.2 如果是拖动已有节点
            const ind = state.model.nodeDataArray.findIndex(x => x.key == state.currKey);
            if (ind < 0) return state;
            node = state.model.nodeDataArray[ind];
            if (ev.eType == NodeEventType.Move2Group) {
                node.group = ev.toNode.key;
                linkAdd = false;
            }
            break;
        default:
            return state;
    }

    return {
        ...state,
        drager: null,
        currKey: '',
        model: {
            nodeDataArray: nodeAdd ? [...state.model.nodeDataArray, node] : state.model.nodeDataArray,
            linkDataArray: linkAdd
                ? [...state.model.linkDataArray, getLink(ev.toNode.key, node.key, ev.toNode.group)]
                : state.model.linkDataArray
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
    if (!ev.toLink || !ev.toLink.from) return state;

    let node: WFNodeModel;
    let nodeAdd: boolean = false;

    // 1、锁定节点
    switch (ev.eType) {
        case NodeEventType.Drag2Link:
            //1.1 如果是新节点
            if (!state.drager) return state;
            node = getOneNode(state.drager.name, ev.toLink.group);
            nodeAdd = true;
            break;
        case NodeEventType.Move2Link:
            // 1.2 如果是拖动已有节点
            const ind = state.model.nodeDataArray.findIndex(x => x.key == state.currKey);
            if (ind < 0) return state;
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

    return {
        ...state,
        drager: null,
        currKey: '',
        model: {
            nodeDataArray: nodeAdd ? [...state.model.nodeDataArray, node] : state.model.nodeDataArray,
            linkDataArray:
                linkToRemoveIndex > -1
                    ? [
                          ...state.model.linkDataArray.slice(0, linkToRemoveIndex),
                          ...state.model.linkDataArray.slice(linkToRemoveIndex + 1),
                          ...linksToAdd
                      ]
                    : [...state.model.linkDataArray, ...linksToAdd]
        }
    };
};

/**
 * 删除 节点
 * @param state
 * @param payload
 */
const removeNodeHandler = (state: DiagramState, payload: string): DiagramState => {
    const nodeToRemoveIndex = state.model.nodeDataArray.findIndex(node => node.key === payload);
    if (nodeToRemoveIndex === -1) {
        return state;
    }
    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: [
                ...state.model.nodeDataArray.slice(0, nodeToRemoveIndex),
                ...state.model.nodeDataArray.slice(nodeToRemoveIndex + 1)
            ]
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
    //const ind = state.model.nodeDataArray.findIndex(x => x.key == payload);

    return {
        ...state,
        currKey: payload,
        //fromNode: state.model.nodeDataArray[ind],
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
        //fromNodeKey: '',
        currKey: '',
        selectedNodeKeys: [
            ...state.selectedNodeKeys.slice(0, nodeIndexToRemove),
            ...state.selectedNodeKeys.slice(nodeIndexToRemove + 1)
        ]
    };
};

/**
 * 选中节点
 * @param state
 * @param payload
 */
const nodeDropedtoHandler = (state: DiagramState, payload: string): DiagramState => {
    //const ind = state.model.nodeDataArray.findIndex(x => x.key == payload);

    return {
        ...state
        //toNode: state.model.nodeDataArray[ind],
        //toNodeKey: payload
    };
};

/**
 * 选中节点
 * @param state
 * @param payload
 */
const linkDropedHandler = (state: DiagramState, payload: WFLinkModel): DiagramState => {
    return {
        ...state
        //toLine: payload
    };
};

const setDiagramHandler = (state: DiagramState, payload: Diagram): DiagramState => {
    state.diagram = payload;
    //nitDrag(state);
    return state;
};

const getDiagramHandler = (state: DiagramState): DiagramState => {
    return state;
};

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

const setNodeHighlightHander = (state: DiagramState, node: any): DiagramState => {
    // may be null
    var oldskips = state.diagram.skipsUndoManager;
    state.diagram.skipsUndoManager = true;
    state.diagram.startTransaction('highlight');
    if (node !== null) {
        state.diagram.highlight(node);
    } else {
        state.diagram.clearHighlighteds();
    }
    state.diagram.commitTransaction('highlight');
    state.diagram.skipsUndoManager = oldskips;

    return state;
};

export const diagramReducer: Reducer<DiagramState> = reducerWithInitialState<DiagramState>({
    drager: null,
    //newNode: null,
    currKey: '',
    diagram: new go.Diagram(),
    model: {
        nodeDataArray: [getOneNode('Root')],
        linkDataArray: []
    },
    selectedNodeKeys: []
    // fromNode: null,
    // fromNodeKey: '',
    // toNode: null,
    // toNodeKey: '',
    // toLine: null
})
    .case(init, initHandler)
    .case(updateNodeColor, updateNodeColorHandler)
    .case(UpdateNodeText, updateNodeTextHandler)

    //.case(newNode, getNodeHandler)
    .case(addNode, addNodeHandler)
    .case(addNodeByDropNode, addNodeAfterDropNodeHandler)
    .case(addNodeByDropLink, addNodeAfterDropLinkHandler)

    .case(removeNode, removeNodeHandler)
    .case(removeLink, removeLinkHandler)

    .case(nodeSelected, nodeSelectedHandler)
    .case(nodeDeselected, nodeDeselectedHandler)

    .case(nodeDropedTo, nodeDropedtoHandler)
    .case(linkDropedTo, linkDropedHandler)

    .case(setDiagram, setDiagramHandler)
    .case(getDiagram, getDiagramHandler)

    .case(dragStartWfNode, dragStartWfNodeHandler)
    .case(dragEndWfNode, dragEndWfNodeHandler)
    .case(setNodeHighlight, setNodeHighlightHander)
    .build();

export const diagramState = (state: DiagramState) => state;
export const modelSelector = (state: DiagramState) => state.model;
// export const nodeSelectionSelector = (state: DiagramState) => state.selectedNodeKeys;
