import React, { Component } from 'react';
import go, { Diagram, ToolManager, GraphObject, Margin } from 'gojs';
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
    //addNode,
    setDiagram,
    //newNode,
    addNodeBySelf,
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
    // addNodeHandler: (name: string) => void;
    // newNodeHandler: (name: string) => void;
    // linkDropedToHandler: (link: WFLinkModel) => void;
    // nodeDropedToHandler: (key: string) => void;
    // tslint:disable-next-line: no-any
    addNodeBySelfHandler: (ev: NodeEvent) => void;
    addNodeByDropLinkHandler: (ev: NodeEvent) => void;
    addNodeByDropNodeHandler: (ev: NodeEvent) => void;
    // tslint:disable-next-line: no-any
    setNodeHighlightHandler: (node: any) => void;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string> | Action<Diagram> | Action<WFLinkModel> | Action<any> | Action<NodeEvent>>
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
        // addNodeHandler: type => {
        //     dispatch(addNode(`${type}-${++count}`));
        // },
        // newNodeHandler: (name: string) => {
        //     dispatch(newNode(`${name}-${++count}`));
        // },
        // linkDropedToHandler: (link: WFLinkModel) => {
        //     dispatch(linkDropedTo(link));
        // },
        // nodeDropedToHandler: (key: string) => {
        //     dispatch(nodeDropedTo(key));
        // },
        addNodeBySelfHandler: (ev: NodeEvent) => {
            dispatch(addNodeBySelf(ev));
        },
        addNodeByDropLinkHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropLink(ev));
        },
        addNodeByDropNodeHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropNode(ev));
        },

        // tslint:disable-next-line: no-any
        setNodeHighlightHandler: (node: any) => {
            if (node) dispatch(setNodeHighlight(node));
        }
    };
};

let mouseType = '';
// let count = 0;
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
                layerSpacing: 40
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
                // selectionChanged: node => {
                //     console.log('selectionChanged');
                //     this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                // },
                padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
                minSize: new go.Size(160, 25)
            },
            new go.Binding('location'),
            $(
                go.Shape,
                'RoundedRectangle',
                {
                    strokeWidth: 0,
                    stroke: colors.transparent
                },
                new go.Binding('fill', 'color'),
                new go.Binding('fill', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.TextBlock,
                {
                    editable: true,
                    stroke: colors.font,
                    font: '16px Sans-Serif'
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
                movable: false,
                deletable: false,
                margin: new Margin(100, 0, 100, 0)
            },
            new go.Binding('location'),
            $(
                go.Shape,
                {
                    strokeWidth: 1
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),

            $(
                go.Shape,
                {
                    toArrow: 'Standard',
                    scale: 1.2,
                    strokeWidth: 1
                },
                new go.Binding('fill', 'color'),
                new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                'Rectangle',
                {
                    width: 80,
                    height: 42,
                    opacity: 0
                },
                new go.Binding('fill', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                new go.Binding('stroke', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Panel,
                'Auto',
                {
                    padding: new go.Margin(0, 0, 10, 0),
                    alignment: go.Spot.Top
                },
                $(go.Shape, 'Circle', {
                    width: 22,
                    height: 22,
                    fill: colors.icon_bg,
                    stroke: colors.hover_bg,
                    strokeWidth: 1
                }),
                $(go.Shape, 'PlusLine', { width: 11, height: 11, fill: null, stroke: colors.hover_bg, strokeWidth: 2 }), //     new go.Binding('fill', 'color'),
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
                    isRealtime: false,
                    layerSpacing: 40,
                    arrangementSpacing: new go.Size(30, 10)
                }),
                padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
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
                new go.Binding('fill', 'color'),
                new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                        stretch: go.GraphObject.Horizontal
                    },
                    new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
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

        // use a special template for the center node
        myDiagram.nodeTemplateMap.add(
            'Condtion',
            $(
                go.Group,
                'Auto',
                {
                    // define the group's internal layout
                    layout: $(go.TreeLayout, {
                        angle: 0,
                        arrangement: go.TreeLayout.ArrangementHorizontal,
                        isRealtime: false,
                        layerSpacing: 20,
                        arrangementSpacing: new go.Size(10, 10)
                    }),
                    padding: new go.Margin(5, 0, 5, 0),
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
                    new go.Binding('fill', 'color'),
                    new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                            stretch: go.GraphObject.Horizontal
                        },
                        new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
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
            )
        ); // end Group

        //

        myDiagram.linkTemplateMap.add(
            'CondtionLink',
            $(go.Link, 'Auto', {
                selectable: false,
                movable: false,
                deletable: false,
                opacity: 0
            })
        );

        myDiagram.nodeTemplateMap.add(
            'CondtionNode',
            $(
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
                    locationSpot: go.Spot.Center, // the location is the center of the Shape
                    // the group begins unexpanded;
                    // upon expansion, a Diagram Listener will generate contents for the group
                    isSubGraphExpanded: true,
                    // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                    subGraphExpandedChanged: function(group) {}
                },

                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),

                $(
                    go.Shape,
                    'Rectangle',
                    {
                        stroke: colors.group_border,
                        strokeWidth: 1
                    },
                    new go.Binding('fill', 'color'),
                    new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                            stretch: go.GraphObject.Horizontal
                        },
                        new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
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
                        minSize: new go.Size(200, 50)
                    })
                ), // end Vertical Panel

                // output port
                $(
                    go.Panel,
                    'Auto',
                    {
                        alignment: go.Spot.Right,
                        margin: new go.Margin(20, 0, 0, 1),
                        portId: 'from',
                        fromLinkable: false,
                        cursor: 'pointer',
                        click: (e: go.InputEvent, thisObj: GraphObject) => {
                            this.props.addNodeBySelfHandler({
                                eType: NodeEventType.AddNextNode,
                                toNode: thisObj.part!.data as WFNodeModel
                            });
                        }
                    },
                    $(go.Shape, 'Circle', {
                        width: 22,
                        height: 22,
                        fill: colors.icon_bg,
                        stroke: colors.hover_bg,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'PlusLine', {
                        width: 11,
                        height: 11,
                        fill: null,
                        stroke: colors.hover_bg,
                        strokeWidth: 1
                    })
                ),
                // input port
                $(
                    go.Panel,
                    'Auto',
                    {
                        alignment: go.Spot.Left,
                        margin: new go.Margin(20, 0, 0, 1),
                        toLinkable: false,
                        cursor: 'pointer',
                        click: (e: go.InputEvent, thisObj: GraphObject) => {
                            this.props.addNodeBySelfHandler({
                                eType: NodeEventType.AddPrvNode,
                                toNode: thisObj.part!.data as WFNodeModel
                            });
                        }
                    },
                    $(go.Shape, 'Circle', {
                        width: 22,
                        height: 22,
                        fill: colors.icon_bg,
                        stroke: colors.hover_bg,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'PlusLine', {
                        width: 11,
                        height: 11,
                        fill: null,
                        stroke: colors.hover_bg,
                        strokeWidth: 1
                    })
                )
            )
        );

        myDiagram.nodeTemplateMap.add(
            'Start',
            $(
                go.Node,
                'Panel',
                {
                    margin: new go.Margin(25, 0, 0, 0),
                    padding: new go.Margin(5),
                    movable: false,
                    deletable: false
                },
                $(
                    go.Panel,
                    'Auto',
                    $(go.Shape, 'Circle', {
                        minSize: new go.Size(44, 44),
                        fill: null,
                        stroke: colors.start,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'TriangleRight', {
                        width: 19,
                        height: 19,
                        fill: colors.start,
                        strokeWidth: 0,
                        margin: new go.Margin(0, 0, 0, 3)
                    })
                )
            )
        );

        myDiagram.nodeTemplateMap.add(
            'End',
            $(
                go.Node,
                'Panel',
                {
                    padding: new go.Margin(5, 2),
                    movable: false,
                    deletable: false
                },
                $(
                    go.Panel,
                    'Auto',
                    $(go.Shape, 'Circle', {
                        minSize: new go.Size(40, 40),
                        fill: null,
                        stroke: colors.end,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'Rectangle', { width: 18, height: 18, fill: colors.end, strokeWidth: 0 })
                )
            )
        );

        this.props.setDiagramHandler(myDiagram);
        return myDiagram;
    }

    /**
     * 高亮选中
     */
    private getHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        // if (h && mouseType) return mouseType === 'Hover' ? (colors.hover_bg as string) : (colors.drag_bg as string);
        // console.log('高亮');

        if (this.props.isHight && this.props!.hightNode!.eType === NodeEventType.HightLightNode) {
            if (this.props!.hightNode!.toNode!.key === shape.part.key) return colors.drag_bg;
        }

        let c = shape.part.data.color;
        return c ? c : colors.backgroud;
    };

    private getLinkHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (this.props.isHight && this.props!.hightNode!.eType === NodeEventType.HightLightLink) {
            if (this.props!.hightNode!.toLink!.from === shape.part.from) {
                return colors.drag_bg;
            }
        }

        if (this.props.drager && this.props.drager.name) {
            return colors.link_hover_bg;
        }
        var c = shape.part.data.color;

        return c ? c : colors.link;
    };

    private getGroupHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h && mouseType)
            return mouseType === 'Hover' ? (colors.groupPanel_hover_bg as string) : (colors.groupPanel_bg as string);
        // var c = shape.part.data.color;
        if (this.props.drager && this.props.drager.name) {
            return colors.groupPanel_bg;
        }

        return colors.groupPanel_bg;
    };

    private getGroupHeaderHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h && mouseType)
            return mouseType === 'Hover' ? (colors.groupHeader_bg as string) : (colors.hover_bg as string);

        if (this.props.drager && this.props.drager.name) {
            return colors.groupHeader_bg;
        }

        return colors.hover_bg;
    };

    private getLinkPlusLineHighlightedColor = (h, shape): string => {
        // tslint:disable-next-line: curly
        if (h && mouseType) {
            return mouseType === 'Hover' ? (colors.linkPlus_hover_bg as string) : (colors.linkPlus_drag_bg as string);
        }

        var c = shape.part.data.color;
        if (this.props.drager && this.props.drager.name) {
            return colors.link_hover_bg;
        }
        return c ? c : colors.link;
    };

    private getLinkPlusLineHighlightedopacity = (h, shape): number => {
        // tslint:disable-next-line: curly
        if (h && mouseType) return mouseType === 'Hover' ? 1 : 0.6;

        if (this.props.drager && this.props.drager.name) {
            return 1;
        }
        return 0;
    };

    /**
     * 鼠标移上
     * @param e
     * @param obj
     */
    private mouseEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        // mouseType = 'Hover';
        // this.props.setNodeHighlightHandler(obj);
    }

    /**
     * 鼠标移开
     * @param e
     * @param obj
     */
    private mouseLeaveHandler(e: go.InputEvent, obj: GraphObject): void {
        // mouseType = '';
        // this.props.setNodeHighlightHandler(null);
    }

    /**
     * 鼠标 拖拽移上
     * @param e
     * @param obj
     */
    private mouseDragEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        // mouseType = 'Drag';
        // this.props.setNodeHighlightHandler(obj);
    }

    /**
     * 鼠标 拖拽移开
     * @param e
     * @param obj
     */
    private mouseDragLeaveHandler(e: go.InputEvent, obj: GraphObject, obj1: GraphObject): void {
        // mouseType = '';
        // this.props.setNodeHighlightHandler(null);
    }

    /**
     * 鼠标 拖拽
     * @param e
     * @param obj
     */
    private mouseDropHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        if (obj && obj.part) {
            if (obj instanceof go.Link) {
                this.props.addNodeByDropLinkHandler({
                    eType: NodeEventType.Move2Link,
                    toLink: obj.part!.data as WFLinkModel
                });
            } else if (obj instanceof go.Group) {
                this.props.addNodeByDropNodeHandler({
                    eType: NodeEventType.Move2Group,
                    toNode: obj.part!.data as WFNodeModel
                });
            } else if (obj instanceof go.Node) {
                this.props.addNodeByDropNodeHandler({
                    eType: NodeEventType.Move2Node,
                    toNode: obj.part!.data as WFNodeModel
                });
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
