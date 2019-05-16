import { actionCreatorFactory } from 'typescript-fsa';
import { WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
import { Diagram } from 'gojs';
import { WFNodeType } from '../components/workflow/wfNode';

const actionCreator = actionCreatorFactory('DIAGRAM');

/**
 * 消息提示
 */
export interface WFMsgEvent {
    type: WFNodeType; // "success|warn|warn"
    msg: string;
}

/**
 * 左侧拖拽相关
 */
export interface DragNodeEvent {
    type: WFNodeType;
    name: string;
    // tslint:disable-next-line: no-any
    event: any;
}

/**
 * Node 相关操作类型
 */
export enum NodeEventType {
    Add = 'Add_new',
    Selected = 'Select_node',
    Delete = 'Delete_node',
    Rename = 'Reset_name',
    Drag2Node = 'Drag_to_node',
    Drag2Group = 'Drag_to_group',
    Drag2Link = 'Drag_to_link',
    Move2Node = 'Move_to_node',
    Move2Group = 'Move_to_group',
    Move2Link = 'Move_to_link',
    LinkHightLight = 'Link_HightLight',
    LinkNomal = 'Link_Normal'
}

/**
 * node 操作事件-相关参数
 */
export interface NodeEvent {
    eType: NodeEventType;
    name?: string;
    key?: string;
    toKey?: string;
    toLink?: WFLinkModel;
    toNode?: WFNodeModel;
    newNodeToLink?: false;
}

export const init = actionCreator<DiagramModel<WFNodeModel, WFLinkModel>>('INIT');
//export const getDiagram = actionCreator('Get_Diagram');
export const setDiagram = actionCreator<Diagram>('Set_Diagram');
// tslint:disable-next-line: no-any
export const setNodeHighlight = actionCreator<any>('Set_Node_Highlight');

/**
 * 节点相关操作
 */
export const newNode = actionCreator<string>('Get_Node');
export const addNode = actionCreator<string>('ADD_NODE');
export const addNodeByDropNode = actionCreator<NodeEvent>('ADD_NODE_DropNode');
export const addNodeByDropLink = actionCreator<NodeEvent>('ADD_NODE_DropLink');
//export const addNodeByDropGroup = actionCreator<string>('ADD_NODE_DropGroup');
export const nodeSelected = actionCreator<string>('NODE_SELECTED');
export const nodeDeselected = actionCreator<string>('NODE_DESELECTED');
export const removeNode = actionCreator<string>('REMOVE_NODE');
// export const nodeDropedTo = actionCreator<string>('NODE_DropedTo');
export const updateNodeColor = actionCreator<NodeEvent>('UPDATE_NODE_COLOR');
export const UpdateNodeText = actionCreator<NodeEvent>('UPDATE_NODE_TEXT');

/**
 * 线条相关操作
 */
// export const linkDropedTo = actionCreator<WFLinkModel>('Link_DropedTo');
export const removeLink = actionCreator<WFLinkModel>('REMOVE_LINK');

/**
 * group 相关操作
 */

//export const addGroup = actionCreator<string>('ADD_NODE');

/**
 * WFNode 相关操作
 */
export const dragStartWfNode = actionCreator<DragNodeEvent>('DragStart_WfNode');
export const dragEndWfNode = actionCreator<DragNodeEvent>('DragEnd_WfNode');
