import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Reducer } from 'redux';
import {
    init,
    updateNodeColor,
    newNode,
    addNode,
    addNodeByDropNode,
    addNodeByDropLink,
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeText,
    UpdateNodeTextEvent,
    getModel,
    getDiagram,
    setDiagram,
    linkDropedTo,
    nodeDropedTo
} from '../actions/diagram';
import go, { Diagram } from 'gojs';
import { BaseNodeModel, DiagramModel, LinkModel } from 'react-gojs';

/**
 * store 管理数据
 */
export interface DiagramState {
    newNode: WFNodeModel;
    diagram: Diagram;
    model: DiagramModel<WFNodeModel, WFLinkModel>;
    selectedNodeKeys: string[];
    fromNodeKey: string;
    toNodeKey: string;
    toLine: WFLinkModel;
}

export interface WFLinkModel extends LinkModel {
    color: string;
    canDroped?: boolean;
}

export interface WFNodeModel extends BaseNodeModel {
    label: string;
    color: string;
    group: string;
    isGroup: boolean;
    canDroped?: boolean;
}

const initHandler = (state: DiagramState, payload: DiagramModel<WFNodeModel, WFLinkModel>): DiagramState => {
    return {
        ...state,
        model: payload
    };
};

const colors = ['lightblue', 'orange', 'lightgreen', 'pink', 'yellow', 'red', 'grey', 'magenta', 'cyan'];

const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};

const getOneNode = (payload: string): WFNodeModel => {
    return { key: payload, label: payload, color: getRandomColor(), group: payload, isGroup: false, canDroped: false };
};

const getLine = (from: string, to: string): WFLinkModel => {
    return { from: from, to: to, color: getRandomColor(), canDroped: true };
};

//得到一个随机 diagran 数组
const getModelHandler = (state: DiagramState, nodeCount: number): DiagramState => {
    let param = {
        groupCount: 2,
        nodeCount: 10
    };

    let addedKeys: Array<string> = []; // this will contain the keys of all nodes created
    let groups: Array<WFNodeModel> = [];
    let nodes: Array<WFNodeModel> = [];

    // create a random number of groups
    // ensure there are at least 10 groups in the diagram

    for (let i = 0; i < param.groupCount; i++) {
        let name = 'group' + i;
        groups.push({
            key: name,
            label: name,
            isGroup: true,
            group: name,
            color: getRandomColor()
        });
        addedKeys.push(name);
    }
    let nodeIds = Math.floor(Math.random() * param.nodeCount) + param.groupCount;
    // create a random number of non-group nodes
    for (let i = 0; i < nodeIds; i++) {
        let groupid = '';
        if (i / 3 > 0) {
            groupid = groups[Math.random() * param.groupCount]!.group!;
        }
        let color = getRandomColor();
        let name = color + i;
        nodes.push({
            key: name,
            label: name,
            isGroup: false,
            group: groupid,
            color: getRandomColor()
        });
        addedKeys.push(name);
    }
    // add at least one link from each node to another
    // this could result in clusters of nodes unreachable from each other, but no lone nodes
    //var arr = [];
    // for (var x in addedKeys) arr.push(addedKeys[x]);
    // arr.sort(function (x, y) { return Math.random() - 1; });
    // for (var i = 0; i < arr.length; i++) {
    //     var from = Math.floor(Math.random() * (arr.length - i)) + i;
    //     if (from !== i) {
    //         model.linkDataArray.push({ from: arr[from], to: arr[i]});
    //     }
    // }
    state.model.nodeDataArray = [...groups, ...nodes];
    return state;
};

const getNodeHandler = (state: DiagramState, payload: string): DiagramState => {
    if (!payload) return state;
    state;
    return { ...state, newNode: getOneNode(payload) };
};

const updateNodeColorHandler = (state: DiagramState): DiagramState => {
    const updatedNodes = state.model.nodeDataArray.map(node => {
        return {
            ...node,
            color: getRandomColor()
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

const updateNodeTextHandler = (state: DiagramState, payload: UpdateNodeTextEvent): DiagramState => {
    const nodeIndex = state.model.nodeDataArray.findIndex(node => node.key === payload.key);

    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: [
                ...state.model.nodeDataArray.slice(0, nodeIndex),
                {
                    ...state.model.nodeDataArray[nodeIndex],
                    label: payload.text
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
        return { from: parent, to: payload, color: 'pink' };
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
const addNodeAfterDropNodeHandler = (state: DiagramState, payload: string): DiagramState => {
    if (!payload || !payload) return state;

    return {
        ...state,
        toNodeKey: '',
        model: {
            ...state.model,
            nodeDataArray: [...state.model.nodeDataArray, getOneNode(payload)],
            linkDataArray: state.toNodeKey
                ? [...state.model.linkDataArray, getLine(state.toNodeKey, payload)]
                : [...state.model.linkDataArray]
        }
    };
};

/**
 * drop 压在link 后添加 node
 * @param state
 * @param payload
 */
const addNodeAfterDropLinkHandler = (state: DiagramState, payload: string): DiagramState => {
    if (!state.toLine || !state.fromNodeKey) return state;

    const linksToAdd: WFLinkModel[] = [];
    let linkToRemoveIndex = -1;
    if (state.toLine.from && state.toLine.to) {
        linksToAdd.push(getLine(state.toLine.from, state.fromNodeKey));
        linksToAdd.push(getLine(state.fromNodeKey, state.toLine.to));

        linkToRemoveIndex = state.model.linkDataArray.findIndex(
            link => link.from === state.toLine.from && link.to === state.toLine.to
        );
    }

    return {
        ...state,
        toLine: getLine('', ''),
        model: {
            ...state.model,
            nodeDataArray: [...state.model.nodeDataArray],
            linkDataArray:
                linkToRemoveIndex > 0
                    ? [
                          ...state.model.linkDataArray.slice(0, linkToRemoveIndex),
                          ...state.model.linkDataArray.slice(linkToRemoveIndex + 1)
                      ].concat(linksToAdd)
                    : [...state.model.linkDataArray].concat(linksToAdd)
        }
    };
};

/**
 * 删除线
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
        fromNodeKey: payload,
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
        fromNodeKey: '',
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
    return {
        ...state,
        toNodeKey: payload
    };
};

/**
 * 选中节点
 * @param state
 * @param payload
 */
const linkDropedHandler = (state: DiagramState, payload: WFLinkModel): DiagramState => {
    return {
        ...state,
        toLine: payload
    };
};

const setDiagramHandler = (state: DiagramState, payload: Diagram): DiagramState => {
    state.diagram = payload;
    return state;
};

const getDiagramHandler = (state: DiagramState): DiagramState => {
    return state;
};

export const diagramReducer: Reducer<DiagramState> = reducerWithInitialState<DiagramState>({
    newNode: getOneNode(''),
    diagram: new go.Diagram(),
    model: {
        nodeDataArray: [getOneNode('Root')],
        linkDataArray: []
    },
    selectedNodeKeys: [],
    fromNodeKey: '',
    toNodeKey: '',
    toLine: getLine('', '')
})
    .case(init, initHandler)
    .case(getModel, getModelHandler)
    .case(updateNodeColor, updateNodeColorHandler)
    .case(UpdateNodeText, updateNodeTextHandler)

    .case(newNode, getNodeHandler)
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
    .build();

export const modelSelector = (state: DiagramState) => state.model;
export const nodeSelectionSelector = (state: DiagramState) => state.selectedNodeKeys;
