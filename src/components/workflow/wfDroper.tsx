import React from 'react';
import './wfDiagram.css';
import { DiagramState, WFNodeModel, WFLinkModel, colors, DiagramCategory } from '../../reducers/diagramReducer';
import { connect } from 'react-redux';
import WFDiagram from './wfDiagram';
import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import go from 'gojs';
import {
    NodeEvent,
    NodeEventType,
    addNodeByDropLink,
    addNodeByDropNode
    // setNodeHighlight
} from '../../actions/diagram';

interface WFDroperProps extends WFDroperDispatchProps, DiagramState {}

const mapStateToProps = (state: DiagramState) => {
    return {
        state: state,
        ...state
    };
};

interface WFDroperDispatchProps {
    //setNodeHighlightHandler: (node: NodeEvent) => void;
    addNodeByDropLinkHandler: (ev: NodeEvent) => void;
    addNodeByDropNodeHandler: (ev: NodeEvent) => void;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string | null> | Action<WFLinkModel> | Action<NodeEvent>>
): WFDroperDispatchProps => {
    return {
        // setNodeHighlightHandler: (node: NodeEvent) => {
        //     dispatch(setNodeHighlight(node));
        // },
        addNodeByDropLinkHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropLink(ev));
        },
        addNodeByDropNodeHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropNode(ev));
        }
    };
};

let oldLink: any;
let oldGroup: any;
let oldNode: any;
const groups = [DiagramCategory.LoopGroup, DiagramCategory.ConditionGroup, DiagramCategory.ConditionSwitch];

const ClearDragerWithout = (str: string) => {
    if (str !== 'l' && oldLink instanceof go.Link) {
        var node = (oldLink as any).part;
        if (node && node.category == DiagramCategory.WFLink && node.diagram) {
            node.diagram.startTransaction('Change color');

            let btn = node.findObject('btn_add');
            if (btn) {
                btn.fill = colors.link_icon_bg;
            }
            node.diagram.commitTransaction('Change color');
        }
        oldLink = null;
    }

    if (str !== 'g' && oldGroup instanceof go.Group) {
        let node = (oldGroup as any).part;
        if (groups.includes(node.category)) {
            // node.diagram.startTransaction("Change color");

            // let shape = node.findObject("group_Body");
            // if (shape)  shape.fill = colors.group_bg;

            // let top = node.findObject("group_Top");
            // if (top) top.background = colors.group_bg;

            // let title = node.findObject("group_Title");
            // if (title) title.stroke = colors.group_font;

            // node.diagram.commitTransaction("Change color");

            oldGroup = null;
        }
    }

    if (str !== 'n' && oldNode instanceof go.Node) {
        let node = (oldNode as any).part;
        if (node.category == DiagramCategory.WFNode) {
            node.diagram.startTransaction('Change color');

            let shape = node.findObject('node_Body');
            if (shape) shape.fill = colors.backgroud;

            node.diagram.commitTransaction('Change color');
        }
        oldNode = null;
    }
};

const WFDroper: React.FC<WFDroperProps> = ({
    drager,
    diagram,
    //setNodeHighlightHandler,
    addNodeByDropLinkHandler,
    addNodeByDropNodeHandler
}) => {
    return (
        <div
            className="wfDiagram"
            style={{ backgroundColor: '#fff' }}
            onDragEnter={(event: any) => {
                if (!drager) event.preventDefault();
                event.target.style.backgroundColor = '#ddd';
                console.log('-------------------onDragEnter ----------------');
            }}
            onDragLeave={(e: any) => {
                e.target.style.backgroundColor = '';
                console.log('-------------------onDragLeave ----------------');
            }}
            onMouseMove={(event: any) => {
                event.preventDefault();
                if (!drager) return;
                console.log('-------------------onMouseMove ----------------');
            }}
            onDragOver={(event: any) => {
                event.preventDefault();
                if (!drager) return;

                event.target.style.backgroundColor = '';
                const myDiagram = diagram;
                let pixelratio = myDiagram.computePixelRatio();
                // prevent default action
                // (open as link for some elements in some browsers)

                // Dragging onto a Diagram
                if (event && event.clientX) {
                    var can = event.target;
                    // var pixelratio = window.devicePixelRatio;
                    // if the target is not the canvas, we may have trouble, so just quit:
                    if (!(can instanceof HTMLCanvasElement)) return;
                    var bbox = can.getBoundingClientRect();
                    var bbw = bbox.width;
                    if (bbw === 0) bbw = 0.001;
                    var bbh = bbox.height;
                    if (bbh === 0) bbh = 0.001;
                    var mx = event.clientX - bbox.left * (can.width / pixelratio / bbw);
                    var my = event.clientY - bbox.top * (can.height / pixelratio / bbh);
                    var point = myDiagram.transformViewToDoc(new go.Point(mx, my));
                    var curnode: any = myDiagram.findPartAt(point, true);

                    if (curnode && curnode.part) {
                        if (curnode instanceof go.Link) {
                            var node = (curnode as any).part;
                            if (node.category === DiagramCategory.WFLink) {
                                node.diagram.startTransaction('Change color');

                                let btn = node.findObject('btn_add');
                                if (btn) {
                                    btn.fill = colors.link_highlight;
                                }

                                node.diagram.commitTransaction('Change color');
                                // setNodeHighlightHandler({
                                //     eType: NodeEventType.HightLightLink,
                                //     toLink: curnode.part!.data
                                // });

                                oldLink = curnode;
                                ClearDragerWithout('l');
                            }
                        } else if (curnode instanceof go.Group) {
                            // setNodeHighlightHandler({
                            //     eType: NodeEventType.HightLightGroup,
                            //     toNode: curnode.part!.data
                            // });
                            var node = (curnode as any).part;
                            if (groups.includes(node.category)) {
                                // node.diagram.startTransaction("Change color");

                                // var shape = node.findObject("group_Body");
                                // if (shape === null) return;

                                // shape.fill = colors.group_highlight;
                                // var top = node.findObject("group_Top");
                                // if (top) top.background = colors.group_highlight;

                                // var title = node.findObject("group_Title");
                                // if (title) title.stroke = colors.group_highlight_font;

                                // node.diagram.commitTransaction("Change color");
                                oldGroup = curnode;
                                ClearDragerWithout('g');
                            }
                        } else if (curnode instanceof go.Node) {
                            //console.log('-------------------Group ----------------');
                            // setNodeHighlightHandler({
                            //     eType: NodeEventType.HightLightNode,
                            //     toNode: curnode.part!.data
                            // });
                            let node = (curnode as any).part;
                            if (node.category === DiagramCategory.WFNode) {
                                node.diagram.startTransaction('Change color');

                                let nbody = node.findObject('node_Body');
                                if (nbody) nbody.fill = colors.highlight;

                                node.diagram.commitTransaction('Change color');
                                oldNode = curnode;
                                ClearDragerWithout('n');
                            }
                        }
                    } else {
                        ClearDragerWithout('');
                    }
                }
            }}
            onDrop={(event: any) => {
                event.preventDefault();
                if (!drager) return;

                event.target.style.backgroundColor = '';
                const myDiagram = diagram;
                let pixelratio = myDiagram.computePixelRatio();
                // prevent default action
                // (open as link for some elements in some browsers)
                event.preventDefault();
                // Dragging onto a Diagram
                if (event && event.clientX) {
                    var can = event.target;
                    // var pixelratio = window.devicePixelRatio;
                    // if the target is not the canvas, we may have trouble, so just quit:
                    if (!(can instanceof HTMLCanvasElement)) return;
                    var bbox = can.getBoundingClientRect();
                    var bbw = bbox.width;
                    if (bbw === 0) bbw = 0.001;
                    var bbh = bbox.height;
                    if (bbh === 0) bbh = 0.001;
                    var mx = event.clientX - bbox.left * (can.width / pixelratio / bbw);
                    var my = event.clientY - bbox.top * (can.height / pixelratio / bbh);
                    var point = myDiagram.transformViewToDoc(new go.Point(mx, my));
                    var curnode: any = myDiagram.findPartAt(point, true);

                    ClearDragerWithout('');
                    if (curnode && curnode.part) {
                        if (curnode instanceof go.Link) {
                            addNodeByDropLinkHandler({
                                eType: NodeEventType.Drag2Link,
                                toLink: curnode.part!.data as WFLinkModel
                            });
                        } else if (curnode instanceof go.Group) {
                            addNodeByDropNodeHandler({
                                eType: NodeEventType.Drag2Group,
                                toNode: curnode.part!.data as WFNodeModel
                            });
                            if (!curnode.wasTreeExpanded) curnode.expandSubGraph();
                            console.log('-------------------Group ----------------');
                        } else if (curnode instanceof go.Node) {
                            addNodeByDropNodeHandler({
                                eType: NodeEventType.Drag2Node,
                                toNode: curnode.part!.data as WFNodeModel
                            });
                            console.log('-------------------Group ----------------');
                        } else {
                        }
                    }
                }
            }}
        >
            <WFDiagram />
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFDroper);
