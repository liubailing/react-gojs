import React, { Component } from 'react';
import go, { Diagram, ToolManager, GraphObject } from 'gojs';
import {
    DiagramState,
    WFNodeModel,
    WFLinkModel,
    colors,
    DiagramSetting,
    DiagramCategory
} from '../../reducers/diagramReducer';
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
    setNodeHighlight,
    clearNodeHighlight
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
    setNodeHighlightHandler: (ev: NodeEvent) => void;
    clearNodeHighlightHander: () => void;
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
                        dispatch(
                            removeNode({ eType: NodeEventType.Delete, key: event.nodeData.key, newLinks: linksToAdd })
                        );
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
        setNodeHighlightHandler: (ev: NodeEvent) => {
            if (ev) dispatch(setNodeHighlight(ev));
        },
        clearNodeHighlightHander: () => {
            dispatch(clearNodeHighlight());
        }
    };
};

let mouseType = '';
// let count = 0;
let myDiagram: Diagram;
let linksToAdd: WFLinkModel[] = [];

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
        const _this = this;
        const $ = go.GraphObject.make;
        myDiagram = $(go.Diagram, diagramId, {
            'undoManager.isEnabled': true,
            contentAlignment: go.Spot.TopCenter,
            initialContentAlignment: go.Spot.LeftCenter,

            layout: $(go.TreeLayout, {
                angle: 90,
                arrangement: go.TreeLayout.ArrangementVertical,
                treeStyle: go.TreeLayout.StyleLayered,
                layerSpacing: DiagramSetting.layerSpacing
            }),
            TextEdited: this.onTextEdited
        });

        myDiagram.toolManager.panningTool.isEnabled = false;
        myDiagram.toolManager.mouseWheelBehavior = ToolManager.WheelScroll;

        myDiagram.nodeSelectionAdornmentTemplate = $(
            go.Adornment,
            'Auto',
            $(go.Shape, {
                fill: null,
                stroke: '#fff',
                strokeWidth: 1,
                strokeDashArray: [2, 1]
            }),
            $(go.Placeholder)
        );

        // myDiagram.linkSelectionAdornmentTemplate = $(go.Adornment, "Auto",
        //     $(go.Shape, {
        //         fill: colors.drag_bg,
        //         stroke: null,
        //         strokeWidth: 1,
        //         strokeDashArray: [1, 1]
        //     }),
        //     $(go.Placeholder)
        // );

        /**
         * 画节点
         */
        myDiagram.nodeTemplateMap.add(
            DiagramCategory.WFNode,
            $(
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
                        this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                    },
                    padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
                    minSize: new go.Size(DiagramSetting.nodeWith, DiagramSetting.nodeHeight)
                },
                $(
                    go.Shape,
                    'RoundedRectangle',
                    {
                        strokeWidth: 0,
                        fill: colors.backgroud
                    }
                    //new go.Binding('fill', 'color'),
                    //new go.Binding('fill', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
                ),
                $(
                    go.TextBlock,
                    {
                        editable: true,
                        stroke: colors.font,
                        font: DiagramSetting.font
                    },
                    new go.Binding('text', 'label')
                )
            )
        );

        // // This is the template for a label node on a link: just an Ellipse.
        // // This node supports user-drawn links to and from the label node.
        // myDiagram.nodeTemplateMap.add(
        //     'LinkLabel',
        //     $(
        //         'Node',
        //         {
        //             selectable: true,
        //             avoidable: false,
        //             layerName: 'Foreground'
        //         }, // always have link label nodes in front of Links
        //         $('Shape', 'Ellipse', {
        //             width: 5,
        //             height: 5,
        //             stroke: null,
        //             portId: '',
        //             fromLinkable: true,
        //             toLinkable: true
        //         })
        //     )
        // );

        /**
         * 划线
         */
        myDiagram.linkTemplateMap.add(
            DiagramCategory.WFLink,
            $(
                go.Link,
                {
                    mouseEnter: this.mouseEnterHandler,
                    mouseLeave: this.mouseLeaveHandler,
                    mouseDragEnter: this.mouseDragEnterHandler,
                    mouseDragLeave: this.mouseDragLeaveHandler,
                    mouseDrop: this.mouseDropHandler,
                    movable: false,
                    deletable: false
                },
                new go.Binding('location'),
                $(
                    go.Shape,
                    {
                        strokeWidth: 1
                    },
                    new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
                ),

                $(
                    go.Shape,
                    {
                        toArrow: 'Standard',
                        scale: 1.2,
                        strokeWidth: 0,
                        fill: colors.link
                    },
                    new go.Binding('stroke', 'isHighlighted', this.getLinkHighlightedColor).ofObject() // binding source is Node.isHighlighted
                ),
                $(
                    go.Shape,
                    'Rectangle',
                    {
                        width: DiagramSetting.nodeWith / 2,
                        height: DiagramSetting.layerSpacing + 5,
                        opacity: DiagramSetting.linkOpacity
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
                        width: DiagramSetting.iconWidth,
                        height: DiagramSetting.iconWidth,
                        fill: colors.icon_bg,
                        stroke: colors.icon_bg,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'PlusLine', {
                        width: DiagramSetting.iconInWidth,
                        height: DiagramSetting.iconInWidth,
                        fill: null,
                        stroke: colors.icon,
                        strokeWidth: 2
                    }), //     new go.Binding('fill', 'color'),
                    new go.Binding('fill', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                    new go.Binding('stroke', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                    new go.Binding('opacity', 'isHighlighted', this.getLinkPlusLineHighlightedopacity).ofObject() // binding source is Node.isHighlighted
                )
            )
        );

        // 划循环分组
        myDiagram.groupTemplateMap.add(
            DiagramCategory.LoopGroup,
            $(
                go.Group,
                'Auto',
                {
                    // define the group's internal layout
                    layout: $(go.TreeLayout, {
                        angle: 90,
                        arrangement: go.TreeLayout.ArrangementHorizontal,
                        isRealtime: false,
                        layerSpacing: DiagramSetting.layerSpacing,
                        arrangementSpacing: new go.Size(30, 10)
                    }),
                    padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
                    movable: DiagramSetting.moveNode,
                    mouseEnter: this.mouseEnterHandler,
                    mouseLeave: this.mouseLeaveHandler,
                    mouseDragEnter: this.mouseDragEnterHandler,
                    mouseDragLeave: this.mouseDragLeaveHandler,
                    mouseDrop: this.mouseDropHandler,
                    selectionChanged: node => {
                        this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                    },
                    // the group begins unexpanded;
                    // upon expansion, a Diagram Listener will generate contents for the group
                    isSubGraphExpanded: true,
                    // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                    subGraphExpandedChanged: function(group) {}
                },

                $(
                    go.Shape,
                    'RoundedRectangle',
                    {
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }
                    //new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                            padding: 5,
                            defaultAlignment: go.Spot.Top,
                            stretch: go.GraphObject.Horizontal,
                            background: colors.group_bg
                        },
                        //new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                        // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                        $('SubGraphExpanderButton', {
                            alignment: go.Spot.Center
                        }),
                        $(
                            go.TextBlock,
                            {
                                font: DiagramSetting.groupFont,
                                editable: true,
                                stroke: colors.group_font,
                                margin: new go.Margin(0, 0, 0, 10)
                            },
                            new go.Binding('text', 'label').makeTwoWay()
                        )
                    ),
                    // create a placeholder to represent the area where the contents of the group are
                    $(go.Placeholder, {
                        background: colors.group_panel_bg,
                        padding: new go.Margin(10, 15),
                        alignment: go.Spot.TopLeft,
                        minSize: new go.Size(DiagramSetting.ConditionWidth, 0)
                    })
                ) // end Vertical Panel
            )
        ); // end Group

        //
        //条件线
        myDiagram.linkTemplateMap.add(
            DiagramCategory.ConditionLink,
            $(go.Link, 'Auto', {
                selectable: false,
                movable: false,
                deletable: false,
                opacity: 0
            })
        );

        // 条件分组
        myDiagram.groupTemplateMap.add(
            DiagramCategory.ConditionGroup,
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
                    //padding: new go.Margin(5, 0, 5, 0),
                    movable: DiagramSetting.moveNode,
                    mouseEnter: this.mouseEnterHandler,
                    mouseLeave: this.mouseLeaveHandler,
                    mouseDragEnter: this.mouseDragEnterHandler,
                    mouseDragLeave: this.mouseDragLeaveHandler,
                    mouseDrop: this.mouseDropHandler,
                    selectionChanged: node => {
                        this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                    },
                    // the group begins unexpanded;
                    // upon expansion, a Diagram Listener will generate contents for the group
                    isSubGraphExpanded: true,
                    // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                    subGraphExpandedChanged: function(group) {}
                },
                $(
                    go.Shape,
                    'RoundedRectangle',
                    {
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }
                    //new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                            padding: 5,
                            defaultAlignment: go.Spot.Top,
                            stretch: go.GraphObject.Horizontal,
                            background: colors.group_bg
                        },
                        //new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                        // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                        $('SubGraphExpanderButton', {
                            alignment: go.Spot.Center
                        }),
                        $(
                            go.TextBlock,
                            {
                                font: DiagramSetting.groupFont,
                                editable: true,
                                stroke: colors.group_font,
                                margin: new go.Margin(0, 0, 0, 10)
                            },
                            new go.Binding('text', 'label').makeTwoWay()
                        )
                    ),
                    // create a placeholder to represent the area where the contents of the group are
                    $(go.Placeholder, {
                        background: colors.group_panel_bg,
                        padding: new go.Margin(10, 15),
                        alignment: go.Spot.TopLeft,
                        minSize: new go.Size(DiagramSetting.ConditionWidth, 0)
                    })
                ) // end Vertical Panel
            )
        ); // end Group

        //条件分支
        myDiagram.groupTemplateMap.add(
            DiagramCategory.ConditionSwitch,
            $(
                go.Group,
                'Auto',
                {
                    // define the group's internal layout
                    layout: $(go.TreeLayout, {
                        angle: 90,
                        arrangement: go.TreeLayout.ArrangementHorizontal,
                        isRealtime: false,
                        layerSpacing: DiagramSetting.layerSpacing
                    }),
                    movable: DiagramSetting.moveNode,
                    mouseEnter: this.mouseEnterHandler,
                    mouseLeave: this.mouseLeaveHandler,
                    mouseDragEnter: this.mouseDragEnterHandler,
                    mouseDragLeave: this.mouseDragLeaveHandler,
                    mouseDrop: this.mouseDropHandler,

                    selectionChanged: node => {
                        this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                    },

                    locationSpot: go.Spot.Center, // the location is the center of the Shape
                    // the group begins unexpanded;
                    // upon expansion, a Diagram Listener will generate contents for the group
                    isSubGraphExpanded: true,
                    // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                    subGraphExpandedChanged: function(group) {}
                },

                $(
                    go.Shape,
                    'RoundedRectangle',
                    {
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }
                    //new go.Binding('fill', 'isHighlighted', this.getGroupHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                            padding: 5,
                            defaultAlignment: go.Spot.Top,
                            stretch: go.GraphObject.Horizontal,
                            background: colors.group_bg
                        },
                        //new go.Binding('background', 'isHighlighted', this.getGroupHeaderHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                        // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                        $('SubGraphExpanderButton', {
                            alignment: go.Spot.Center
                        }),
                        $(
                            go.TextBlock,
                            {
                                font: DiagramSetting.groupFont,
                                editable: true,
                                stroke: colors.group_font,
                                margin: new go.Margin(0, 0, 0, 10)
                            },
                            new go.Binding('text', 'label').makeTwoWay()
                        )
                    ),
                    // create a placeholder to represent the area where the contents of the group are
                    $(go.Placeholder, {
                        background: colors.group_panel_bg,
                        padding: new go.Margin(10, 15),
                        alignment: go.Spot.TopLeft,
                        minSize: new go.Size(DiagramSetting.ConditionWidth, 0)
                    })
                ), // end Vertical Panel

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
                    new go.Binding('opacity', 'opacity'),
                    $(go.Shape, 'Circle', {
                        width: DiagramSetting.iconWidth,
                        height: DiagramSetting.iconWidth,
                        fill: colors.icon_bg,
                        stroke: colors.icon_bg,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'PlusLine', {
                        width: DiagramSetting.iconInWidth,
                        height: DiagramSetting.iconInWidth,
                        fill: null,
                        stroke: colors.icon,
                        strokeWidth: 1
                    })
                ),
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
                    new go.Binding('opacity', 'opacity'),
                    $(go.Shape, 'Circle', {
                        width: DiagramSetting.iconWidth,
                        height: DiagramSetting.iconWidth,
                        fill: colors.icon_bg,
                        stroke: colors.icon_bg,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'PlusLine', {
                        width: DiagramSetting.iconInWidth,
                        height: DiagramSetting.iconInWidth,
                        fill: null,
                        stroke: colors.icon,
                        strokeWidth: 1
                    })
                )
            )
        );

        /**
         * 起始点
         */
        myDiagram.nodeTemplateMap.add(
            DiagramCategory.Start,
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
                        minSize: new go.Size(DiagramSetting.startWidth, DiagramSetting.startWidth),
                        fill: null,
                        stroke: colors.start,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'TriangleRight', {
                        width: DiagramSetting.startInWidth,
                        height: DiagramSetting.startInWidth,
                        fill: colors.start,
                        strokeWidth: 0,
                        margin: new go.Margin(0, 0, 0, 1)
                    })
                )
            )
        );

        /**
         * 结束点
         */
        myDiagram.nodeTemplateMap.add(
            DiagramCategory.End,
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
                        minSize: new go.Size(DiagramSetting.endWidth, DiagramSetting.endWidth),
                        fill: null,
                        stroke: colors.end,
                        strokeWidth: 1
                    }),
                    $(go.Shape, 'Rectangle', {
                        width: DiagramSetting.endInWidth,
                        height: DiagramSetting.endInWidth,
                        fill: colors.end,
                        strokeWidth: 0
                    })
                )
            )
        );

        //notice whenever the selection may have changed
        myDiagram.addDiagramListener('ChangedSelection', function(e: go.DiagramEvent) {
            //_this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
        });
        // // notice when the Paste command may need to be reenabled
        // myDiagram.addDiagramListener("ClipboardChanged", function (e: go.DiagramEvent) {
        //     myDelete(e);
        // });
        // // notice whenever a transaction or undo/redo has occurred
        // // myDiagram.addModelChangedListener(function(e) {
        // //     if (e.isTransactionFinished) myDelete(e);
        // // });

        // const myDelete = (e: go.DiagramEvent) => {
        //     console.log('---------------- delete --------------');
        // }

        myDiagram.commandHandler.doKeyDown = function() {
            var e = myDiagram.lastInput;
            // The meta (Command) key substitutes for "control" for Mac commands
            var control = e.control || e.meta;
            var key = e.key;
            // Quit on any undo/redo key combination:
            if (control && (key === 'Z' || key === 'Y')) return;
            //将要删除
            if (key === 'Del' && _this.props.currKey) {
                // 这个节点 指向的
                const indFrom = _this.props.model.linkDataArray.findIndex(link => link.from === _this.props.currKey);
                // 指向这个节点
                const indTo = _this.props.model.linkDataArray.findIndex(link => link.to === _this.props.currKey);

                //节点  中间节点 、 起始节点 、 终止节点
                if (indFrom > -1 && indTo > -1) {
                    // 1、 中间节点
                    let f = _this.props.model.linkDataArray[indTo];
                    let t = _this.props.model.linkDataArray[indFrom];
                    linksToAdd.push({
                        from: f.from,
                        to: t.to,
                        group: t.group,
                        category: t.category,
                        isCondition: false
                    });
                }
            }
            //call base method with no arguments (default functionality)
            go.CommandHandler.prototype.doKeyDown.call(this);
        };

        this.props.setDiagramHandler(myDiagram);
        return myDiagram;
    }

    /**
     * 高亮选中
     */
    // private getHighlightedColor = (h, shape): string => {
    //     // tslint:disable-next-line: curly
    //     // if (h && mouseType) return mouseType === 'Hover' ? (colors.hover_bg as string) : (colors.drag_bg as string);
    //     // console.log('高亮');

    //     if (this.props.isHight && this.props!.hightNode!.eType === NodeEventType.HightLightNode) {
    //         if (this.props!.hightNode!.toNode!.key === shape.part.key) return colors.drag_bg;
    //     }

    //     let c = shape.part.data.color;
    //     return c ? c : colors.backgroud;
    // };

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

    // private getGroupHighlightedColor = (h, shape): string => {
    //     // tslint:disable-next-line: curly
    //     if (h && mouseType)
    //         return mouseType === 'Hover' ? (colors.groupPanel_hover_bg as string) : (colors.group_panel_bg as string);
    //     // var c = shape.part.data.color;
    //     if (this.props.drager && this.props.drager.name) {
    //         return colors.group_panel_bg;
    //     }

    //     return colors.group_panel_bg;
    // };

    // private getGroupHeaderHighlightedColor = (h, shape): string => {
    //     // tslint:disable-next-line: curly
    //     if (h && mouseType)
    //         return mouseType === 'Hover' ? (colors.groupHeader_bg as string) : (colors.hover_bg as string);

    //     if (this.props.drager && this.props.drager.name) {
    //         return colors.groupHeader_bg;
    //     }

    //     return colors.hover_bg;
    // };

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
        mouseType = 'Hover';
        if (obj instanceof go.Group) {
            if (obj.part!.data!.category === DiagramCategory.ConditionSwitch)
                this.props.setNodeHighlightHandler({
                    eType: NodeEventType.HightLightCondition,
                    toNode: obj.part!.data as WFNodeModel
                });
        }
    }

    /**
     * 鼠标移开
     * @param e
     * @param obj
     */
    private mouseLeaveHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        // this.props.setNodeHighlightHandler(null);
        if (obj instanceof go.Group) {
            if (obj.part!.data!.category === DiagramCategory.ConditionSwitch) this.props.clearNodeHighlightHander();
        }
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
        // mouseType = '';
        // if (obj && obj.part) {
        //     if (obj instanceof go.Link) {
        //         this.props.addNodeByDropLinkHandler({
        //             eType: NodeEventType.Move2Link,
        //             toLink: obj.part!.data as WFLinkModel
        //         });
        //     } else if (obj instanceof go.Group) {
        //         this.props.addNodeByDropNodeHandler({
        //             eType: NodeEventType.Move2Group,
        //             toNode: obj.part!.data as WFNodeModel
        //         });
        //     } else if (obj instanceof go.Node) {
        //         this.props.addNodeByDropNodeHandler({
        //             eType: NodeEventType.Move2Node,
        //             toNode: obj.part!.data as WFNodeModel
        //         });
        //     }
        // }
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
