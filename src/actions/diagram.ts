import { actionCreatorFactory } from 'typescript-fsa';
import { WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { DiagramModel } from 'react-gojs';
import { Diagram } from 'gojs';
import { wfNodeType } from '../components/wfNode';

const actionCreator = actionCreatorFactory('DIAGRAM');

/**
 * 左侧拖拽相关
 */
export interface DragNodeEvent {
    type: wfNodeType;
    // tslint:disable-next-line: no-any
    event: any;
}

/**
 * Node 相关操作类型
 */
export enum NodeEventType {
    add = 'add_new',
    selected = 'select_node',
    delete = 'delete_node',
    rename = 'reset_name',
    move2node = 'move_to_node',
    move2group = 'move_to_group',
    move2link = 'move_to_link'
}

/**
 * node 操作事件-相关参数
 */
export interface NodeEvent {
    eType: NodeEventType;
    name?: string;
    key?: string;
    toKey?: string;
    tolink?: WFLinkModel;
}

export const init = actionCreator<DiagramModel<WFNodeModel, WFLinkModel>>('INIT');
export const getDiagram = actionCreator('Get_Diagram');
export const setDiagram = actionCreator<Diagram>('Set_Diagram');
// tslint:disable-next-line: no-any
export const setNodeHighlight = actionCreator<any>('Set_Node_Highlight');

/**
 * 节点相关操作
 */
export const newNode = actionCreator<string>('Get_Node');
export const addNode = actionCreator<string>('ADD_NODE');
export const addNodeByDropNode = actionCreator<string>('ADD_NODE_DropNode');
export const addNodeByDropLink = actionCreator<string>('ADD_NODE_DropLink');
//export const addNodeByDropGroup = actionCreator<string>('ADD_NODE_DropGroup');
export const nodeSelected = actionCreator<string>('NODE_SELECTED');
export const nodeDeselected = actionCreator<string>('NODE_DESELECTED');
export const removeNode = actionCreator<string>('REMOVE_NODE');
export const nodeDropedTo = actionCreator<string>('NODE_DropedTo');
export const updateNodeColor = actionCreator('UPDATE_NODE_COLOR');
export const UpdateNodeText = actionCreator<NodeEvent>('UPDATE_NODE_TEXT');

/**
 * 线条相关操作
 */
export const linkDropedTo = actionCreator<WFLinkModel>('Link_DropedTo');
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
