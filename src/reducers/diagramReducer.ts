import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { Reducer } from 'redux';
import {
    init,
    updateNodeColor,
    addNode,
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeText,
    UpdateNodeTextEvent,
    getModel,
    getDiagram,
    setDiagram
} from '../actions/diagram';
import go, { Diagram } from 'gojs';
import { BaseNodeModel, DiagramModel, LinkModel } from 'react-gojs';

export interface DiagramState {
    diagram: Diagram;
    model: DiagramModel<NodeModel, LinkModel>;
    selectedNodeKeys: string[];
}

export interface NodeModel extends BaseNodeModel {
    label: string;
    color: string;
    group?: string;
    isGroup?: boolean;
}

const initHandler = (state: DiagramState, payload: DiagramModel<NodeModel, LinkModel>): DiagramState => {
    return {
        ...state,
        model: payload
    };
};

const colors = ['lightblue', 'orange', 'lightgreen', 'pink', 'yellow', 'red', 'grey', 'magenta', 'cyan'];

const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};

//得到一个随机 diagran 数组
const getModelHandler = (state: DiagramState, nodeCount: number): DiagramState => {
    let param = {
        groupCount: 2,
        nodeCount: 10
    };

    let addedKeys: Array<string> = []; // this will contain the keys of all nodes created
    let groups: Array<NodeModel> = [];
    let nodes: Array<NodeModel> = [];

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

const addNodeHandler = (state: DiagramState, payload: string): DiagramState => {
    console.log('-------------------------');
    const linksToAdd: LinkModel[] = state.selectedNodeKeys.map(parent => {
        return { from: parent, to: payload, color: 'pink' };
    });
    return {
        ...state,
        model: {
            ...state.model,
            nodeDataArray: [...state.model.nodeDataArray, { key: payload, label: payload, color: getRandomColor() }],
            linkDataArray:
                linksToAdd.length > 0
                    ? [...state.model.linkDataArray].concat(linksToAdd)
                    : [...state.model.linkDataArray]
        }
    };
};

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

const removeLinkHandler = (state: DiagramState, payload: LinkModel): DiagramState => {
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

const nodeSelectedHandler = (state: DiagramState, payload: string): DiagramState => {
    return {
        ...state,
        selectedNodeKeys: [payload]
        //selectedNodeKeys: [...state.selectedNodeKeys, payload]
    };
};

const nodeDeselectedHandler = (state: DiagramState, payload: string): DiagramState => {
    const nodeIndexToRemove = state.selectedNodeKeys.findIndex(key => key === payload);
    if (nodeIndexToRemove === -1) {
        return state;
    }
    return {
        ...state,
        selectedNodeKeys: [
            ...state.selectedNodeKeys.slice(0, nodeIndexToRemove),
            ...state.selectedNodeKeys.slice(nodeIndexToRemove + 1)
        ]
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
    diagram: new go.Diagram(),
    model: {
        nodeDataArray: [{ key: 'Root', color: 'lightblue', label: 'Root' }],
        linkDataArray: []
    },
    selectedNodeKeys: []
})
    .case(init, initHandler)
    .case(getModel, getModelHandler)
    .case(updateNodeColor, updateNodeColorHandler)
    .case(UpdateNodeText, updateNodeTextHandler)
    .case(addNode, addNodeHandler)
    .case(removeNode, removeNodeHandler)
    .case(removeLink, removeLinkHandler)
    .case(nodeSelected, nodeSelectedHandler)
    .case(nodeDeselected, nodeDeselectedHandler)
    .case(setDiagram, setDiagramHandler)
    .case(getDiagram, getDiagramHandler)
    .build();

export const modelSelector = (state: DiagramState) => state.model;
export const nodeSelectionSelector = (state: DiagramState) => state.selectedNodeKeys;
