import React, { Component } from 'react';
import go, { Diagram, ToolManager, GraphObject } from 'gojs';
import { DiagramState, WFNodeModel, WFLinkModel, colors, DiagramSetting } from '../../reducers/diagramReducer';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
    NodeEventType,
    NodeEvent,
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeText,
    addNode,
    setDiagram,
    newNode,
    // linkDropedTo,
    // nodeDropedTo,
    addNodeByDropLink,
    addNodeByDropNode,
    setNodeHighlight
} from '../../actions/diagram';
import { ModelChangeEvent, GojsDiagram, ModelChangeEventType } from 'react-gojs';
import { Action } from 'typescript-fsa';
import './wfDiagram.css';

interface MyDiagramProps extends WFDroperDispatchProps, DiagramState {
    // model: DiagramModel<WFNodeModel, WFLinkModel>;
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

interface WFDroperDispatchProps {
    onNodeSelectionHandler: (key: string, isSelected: boolean) => void;
    onModelChangeHandler: (event: ModelChangeEvent<WFNodeModel, WFLinkModel>) => void;
    onTextChangeHandler: (event: NodeEvent) => void;
    setDiagramHandler: (diagram: Diagram) => void;
    addNodeHandler: (name: string) => void;
    newNodeHandler: (name: string) => void;
    // linkDropedToHandler: (link: WFLinkModel) => void;
    // nodeDropedToHandler: (key: string) => void;
    // tslint:disable-next-line: no-any
    addNodeByDropLinkHandler: (ev: NodeEvent) => void;
    addNodeByDropNodeHandler: (ev: NodeEvent) => void;
    // tslint:disable-next-line: no-any
    setNodeHighlightHandler: (node: any) => void;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string> | Action<Diagram> | Action<WFLinkModel> | Action<any | null> | Action<NodeEvent>>
): WFDroperDispatchProps => {
    return {
        onNodeSelectionHandler: (key: string, isSelected: boolean) => {
            if (isSelected) {
                dispatch(nodeSelected(key));
            } else {
                dispatch(nodeDeselected(key));
            }
        },
        onModelChangeHandler: (event: ModelChangeEvent<WFNodeModel, WFLinkModel>) => {
            switch (event.eventType) {
                case ModelChangeEventType.Remove:
                    if (event.nodeData) {
                        dispatch(removeNode(event.nodeData.key));
                    }
                    if (event.linkData) {
                        dispatch(removeLink(event.linkData));
                    }
                    break;
                default:
                    break;
            }
        },
        onTextChangeHandler: (event: NodeEvent) => {
            dispatch(UpdateNodeText(event));
        },
        setDiagramHandler: (diagram: Diagram) => {
            dispatch(setDiagram(diagram));
        },
        addNodeHandler: type => {
            dispatch(addNode(`${type}-${++count}`));
        },
        newNodeHandler: (name: string) => {
            dispatch(newNode(`${name}-${++count}`));
        },
        // linkDropedToHandler: (link: WFLinkModel) => {
        //     dispatch(linkDropedTo(link));
        // },
        // nodeDropedToHandler: (key: string) => {
        //     dispatch(nodeDropedTo(key));
        // },
        addNodeByDropLinkHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropLink(ev));
        },
        addNodeByDropNodeHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropNode(ev));
        },

        // tslint:disable-next-line: no-any
        setNodeHighlightHandler: (node: any) => {
            dispatch(setNodeHighlight(node));
        }
    };
};

let mouseType = '';
let count = 0;
let myDiagram: Diagram;

class MyDiagram extends Component<MyDiagramProps> {
    constructor(props: MyDiagramProps) {
        super(props);
        console.log(props.currKey);
        this.createDiagram = this.createDiagram.bind(this);
        this.onTextEdited = this.onTextEdited.bind(this);
        this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
        this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
        this.mouseDropHandler = this.mouseDropHandler.bind(this);
        this.mouseDragEnterHandler = this.mouseDragEnterHandler.bind(this);
        this.mouseDragLeaveHandler = this.mouseDragLeaveHandler.bind(this);
    }

    render() {
        return (
            <GojsDiagram
                diagramId="divDiagram"
                className="divDiagram"
                model={this.props.model}
                createDiagram={this.createDiagram}
                onModelChange={this.props.onModelChangeHandler}
            />
        );
    }

    private createDiagram(diagramId: string): Diagram {
        const $ = go.GraphObject.make;
        myDiagram = $(go.Diagram, diagramId, {
            'undoManager.isEnabled': true,
            contentAlignment: go.Spot.TopCenter,
            initialContentAlignment: go.Spot.LeftCenter,

            layout: $(go.TreeLayout, {
                angle: 90,
                arrangement: go.TreeLayout.ArrangementVertical,
                treeStyle: go.TreeLayout.StyleLayered,
                nodeSpacing: 80,
                layerSpacing: 60
            }),
            TextEdited: this.onTextEdited
        });

        myDiagram.toolManager.panningTool.isEnabled = false;
        myDiagram.toolManager.mouseWheelBehavior = ToolManager.WheelScroll;

        myDiagram.nodeTemplate = $(
            go.Node,
            'Auto',
            {
                mouseEnter: this.mouseEnterHandler,
                mouseLeave: this.mouseLeaveHandler,
                mouseDragEnter: this.mouseDragEnterHandler,
                mouseDragLeave: this.mouseDragLeaveHandler,
                mouseDrop: this.mouseDropHandler,
                locationSpot: go.Spot.Center, // the location is the center of the Shape
                resizeObjectName: 'SHAPE', // user can resize the Shape
                movable: DiagramSetting.moveNode,
                selectionChanged: node => {
                    console.log('selectionChanged');
                    this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                }
            },
            new go.Binding('location'),
            $(
                go.Shape,
                'RoundedRectangle',
                {
                    strokeWidth: 0
                },
                new go.Binding('fill', 'color'),
                new go.Binding('fill', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.TextBlock,
                {
                    margin: 8,
                    editable: true,
                    stroke: colors.font
                },
                new go.Binding('text', 'label')
            )
        );

        // This is the template for a label node on a link: just an Ellipse.
        // This node supports user-drawn links to and from the label node.
        myDiagram.nodeTemplateMap.add(
            'LinkLabel',
            $(
                'Node',
                {
                    selectable: true,
                    avoidable: false,
                    layerName: 'Foreground'
                }, // always have link label nodes in front of Links
                $('Shape', 'Ellipse', {
                    width: 5,
                    height: 5,
                    stroke: null,
                    portId: '',
                    fromLinkable: true,
                    toLinkable: true,
                    cursor: 'pointer'
                })
            )
        );

        myDiagram.linkTemplate = $(
            go.Link,
            {
                mouseEnter: this.mouseEnterHandler,
                mouseLeave: this.mouseLeaveHandler,
                mouseDragEnter: this.mouseDragEnterHandler,
                mouseDragLeave: this.mouseDragLeaveHandler,
                mouseDrop: this.mouseDropHandler,
                routing: go.Link.Orthogonal,
                corner: 10
            },
            new go.Binding('location'),
            $(
                go.Shape,
                {
                    strokeWidth: 2
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                {
                    toArrow: 'OpenTriangle',
                    strokeWidth: 4
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                'Rectangle',
                {
                    width: 80,
                    height: 80,
                    opacity: 0
                },
                new go.Binding('fill', 'color'),
                new go.Binding('fill', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                new go.Binding('stroke', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                'PlusLine',
                {
                    width: 15,
                    height: 15,
                    strokeWidth: 6
                },
                new go.Binding('fill', 'color'),
                new go.Binding('fill', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                new go.Binding('stroke', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                new go.Binding('opacity', 'isHighlighted', this.getLinkPlusLineHighlightedopacity).ofObject() // binding source is Node.isHighlighted
            )
        );

        // define the group template
        myDiagram.groupTemplate = $(
            go.Group,
            'Auto',
            {
                // define the group's internal layout
                layout: $(go.TreeLayout, {
                    angle: 90,
                    arrangement: go.TreeLayout.ArrangementHorizontal,
                    isRealtime: false
                }),
                movable: DiagramSetting.moveNode,
                mouseEnter: this.mouseEnterHandler,
                mouseLeave: this.mouseLeaveHandler,
                mouseDragEnter: this.mouseDragEnterHandler,
                mouseDragLeave: this.mouseDragLeaveHandler,
                mouseDrop: this.mouseDropHandler,
                // the group begins unexpanded;
                // upon expansion, a Diagram Listener will generate contents for the group
                isSubGraphExpanded: true,
                // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                subGraphExpandedChanged: function(group) {}
            },
            $(
                go.Shape,
                'Rectangle',
                {
                    stroke: colors.group_border,
                    strokeWidth: 1
                },
                new go.Binding('fill', colors.group_backgroud),
                new go.Binding('fill', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Panel,
                'Vertical',
                {
                    stretch: go.GraphObject.Horizontal,
                    defaultAlignment: go.Spot.Left
                },
                $(
                    go.Panel,
                    'Horizontal',
                    {
                        padding: new go.Margin(5, 0, 5, 0),
                        defaultAlignment: go.Spot.Top,
                        background: colors.group_header_bg,
                        stretch: go.GraphObject.Horizontal
                    },
                    new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                    // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                    $('SubGraphExpanderButton', {
                        padding: new go.Margin(0, 0, 5, 0),
                        alignment: go.Spot.Right,
                        margin: new go.Margin(0, 0, 0, 5)
                    }),
                    $(
                        go.TextBlock,
                        {
                            font: 'Bold 16px Sans-Serif',
                            editable: true,
                            opacity: 0.75,
                            stroke: colors.font,
                            margin: new go.Margin(0, 10, 5, 10)
                        },
                        new go.Binding('text', 'label').makeTwoWay()
                    )
                ),
                // create a placeholder to represent the area where the contents of the group are
                $(go.Placeholder, {
                    padding: new go.Margin(10, 15),
                    alignment: go.Spot.TopLeft,
                    minSize: new go.Size(100, 15)
                })
            ) // end Vertical Panel
        ); // end Group

        // Using Panel.isClipping
        // myDiagram.add($(go.Part, "Spot",
        //     { isClipping: true, scale: 2  },
        //     $(go.Shape, "Circle", { width: 55, strokeWidth: 0 } ),
        //         $(go.Picture, "../../assets/workflow/play.png",
        //             { width: 55, height: 55 }
        //         )
        //     )
        // );

        // manage boss info manually when a node or link is deleted from the diagram
        myDiagram.addDiagramListener('SelectionDeleting', function(e) {
            var part = e.subject.first(); // e.subject is the myDiagram.selection collection,
            // so we'll get the first since we know we only have one selection

            //debugger;
            myDiagram.startTransaction('clear boss');
            if (part instanceof go.Node) {
                // var it = part.findTreeChildrenNodes(); // find all child nodes
                // while (it.next()) { // now iterate through them and clear out the boss information
                //     var child = it.value;
                //     var bossText = child.findObject("boss"); // since the boss TextBlock is named, we can access it by name
                //     if (bossText === null) return;
                //     // bossText.text = "";
                // }
            } else if (part instanceof go.Link) {
                // var child = part.toNode;
                // var bossText = child.findObject("boss"); // since the boss TextBlock is named, we can access it by name
                // if (bossText === null) return;
                //bossText.text = "";
            }
            myDiagram.commitTransaction('clear boss');
        });

        this.props.setDiagramHandler(myDiagram);
        return myDiagram;
    }

    private getHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h) return mouseType === 'Hover' ? (colors.hover_bg as string) : (colors.drag_bg as string);
        var c = shape.part.data.color;
        return c ? c : colors.backgroud;
    };

    private getLinkHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h) return mouseType === 'Hover' ? (colors.link_hover_bg as string) : (colors.link_drag_bg as string);
        var c = shape.part.data.color;
        return c ? c : colors.link;
    };

    private getGroupHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h) return mouseType === 'Hover' ? (colors.link_hover_bg as string) : (colors.link_drag_bg as string);
        var c = shape.part.data.color;
        return c ? c : colors.link;
    };

    private getLinkPlusLineHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h)
            return mouseType === 'Hover' ? (colors.linkPlus_hover_bg as string) : (colors.linkPlus_drag_bg as string);
        var c = shape.part.data.color;
        return c ? c : colors.link;
    };

    private getLinkPlusLineHighlightedopacity = (h, shape): number => {
        // tslint:disable-next-line: curly
        if (h) return mouseType === 'Hover' ? 1 : 0.6;

        return 0;
    };

    /**
     * 鼠标移上
     * @param e
     * @param obj
     */
    private mouseEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = 'Hover';
        this.props.setNodeHighlightHandler(obj);
    }

    /**
     * 鼠标移开
     * @param e
     * @param obj
     */
    private mouseLeaveHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        this.props.setNodeHighlightHandler(null);
    }

    /**
     * 鼠标 拖拽移上
     * @param e
     * @param obj
     */
    private mouseDragEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        this.props.setNodeHighlightHandler(obj);
    }

    /**
     * 鼠标 拖拽移开
     * @param e
     * @param obj
     */
    private mouseDragLeaveHandler(e: go.InputEvent, obj: GraphObject, obj1: GraphObject): void {
        mouseType = '';
        this.props.setNodeHighlightHandler(null);
    }

    /**
     * 鼠标 拖拽
     * @param e
     * @param obj
     */
    private mouseDropHandler(e: go.InputEvent, obj: any): void {
        mouseType = '';
        if (obj instanceof go.Link) {
            // tslint:disable-next-line: no-any
            let l = (obj as any)!.jb;
            if (l) {
                // this.props.linkDropedToHandler(l as WFLinkModel);
                this.props.addNodeByDropLinkHandler({ eType: NodeEventType.Move2Link, toLink: l as WFLinkModel });
            }
        } else if (obj instanceof go.Group) {
            // tslint:disable-next-line: no-any
            let l = (obj as any)!.jb;
            if (l) {
                obj.expandSubGraph();
                this.props.addNodeByDropNodeHandler({ eType: NodeEventType.Move2Group, toNode: l as WFNodeModel });
            }
        } else if (obj instanceof go.Node) {
            // tslint:disable-next-line: no-any
            let l = (obj as any)!.jb;
            if (l) {
                // this.props.nodeDropedToHandler(l.key as string);
                this.props.addNodeByDropNodeHandler({ eType: NodeEventType.Move2Node, toNode: l as WFNodeModel });
            }
        }
    }

    /**
     * 修改名称
     * @param e
     */
    private onTextEdited(e: go.DiagramEvent) {
        const tb = e.subject;
        if (tb === null) {
            return;
        }
        const node = tb.part;
        if (node instanceof go.Node && this.props.onTextChangeHandler) {
            this.props.onTextChangeHandler({ eType: NodeEventType.Rename, key: node.key as string, name: tb.text });
        }
    }

    // private setOpcity():number{
    //    var a = this.props.getMode();
    //    debugger;
    //    return a.name?1:0;
    // }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyDiagram);
