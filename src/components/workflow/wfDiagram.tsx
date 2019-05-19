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
    UpdateNodeText,
    //addNode,
    setDiagram,
    //newNode,
    addNodeBySelf,
    addNodeByDropLink,
    addNodeByDropNode
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
    addNodeBySelfHandler: (ev: NodeEvent) => void;
    addNodeByDropLinkHandler: (ev: NodeEvent) => void;
    addNodeByDropNodeHandler: (ev: NodeEvent) => void;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string> | Action<Diagram> | Action<any> | Action<NodeEvent>>
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
            if (myDiagram.findNodeForKey(4)) myDiagram.findNodeForKey(4)!.isSelected = true;

            switch (event.eventType) {
                case ModelChangeEventType.Remove:
                    if (event.nodeData) {
                        dispatch(
                            removeNode({ eType: NodeEventType.Delete, key: event.nodeData.key, newLinks: linksToAdd })
                        );
                    }
                    if (event.linkData) {
                        //dispatch(removeLink(event.linkData));
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

        addNodeBySelfHandler: (ev: NodeEvent) => {
            dispatch(addNodeBySelf(ev));
        },
        addNodeByDropLinkHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropLink(ev));
        },
        addNodeByDropNodeHandler: (ev: NodeEvent) => {
            dispatch(addNodeByDropNode(ev));
        }
    };
};

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
            initialContentAlignment: go.Spot.RightCenter,
            layout: $(go.TreeLayout, {
                angle: 90,
                treeStyle: go.TreeLayout.StyleLayered,
                layerSpacing: DiagramSetting.layerSpacing,
                comparer: go.LayoutVertex.smartComparer
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

        /**
         * 画线
         */
        const drawLink = () => {
            myDiagram.linkTemplateMap.add(
                DiagramCategory.WFLink,
                $(
                    go.Link,
                    {
                        mouseLeave: this.mouseLeaveHandler,
                        mouseEnter: this.mouseEnterHandler,
                        movable: false,
                        deletable: false
                    },
                    new go.Binding('location'),
                    $(go.Shape, {
                        name: 'link_Body',
                        stroke: colors.link,
                        strokeWidth: 1
                    }),

                    $(go.Shape, {
                        name: 'link_Arr',
                        toArrow: 'Standard',
                        scale: 1.2,
                        strokeWidth: 0,
                        fill: colors.link
                    }),
                    $(go.Shape, 'Rectangle', {
                        width: DiagramSetting.nodeWith / 2,
                        height: DiagramSetting.layerSpacing + 5,
                        opacity: DiagramSetting.linkOpacity,
                        fill: colors.link
                    }),
                    $(
                        go.Panel,
                        'Auto',
                        {
                            padding: new go.Margin(0, 0, 10, 0),
                            alignment: go.Spot.Top
                        },
                        $(go.Shape, 'Circle', {
                            name: 'btn_add',
                            width: DiagramSetting.linkIconWidth,
                            height: DiagramSetting.linkIconWidth,
                            fill: colors.link_icon_bg,
                            strokeWidth: 0
                        }),
                        $(go.Shape, 'PlusLine', {
                            width: DiagramSetting.linkIconInWidth,
                            height: DiagramSetting.linkIconInWidth,
                            fill: null,
                            stroke: colors.link_icon,
                            strokeWidth: 2
                        }),
                        //new go.Binding('fill', 'color'),
                        // new go.Binding('fill', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                        // new go.Binding('stroke', 'isHighlighted', this.getLinkPlusLineHighlightedColor).ofObject(), // binding source is Node.isHighlighted
                        new go.Binding('opacity', 'isHighlighted', this.getLinkPlusLineHighlightedopacity).ofObject() // binding source is Node.isHighlighted
                    )
                )
            );
        };

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
        const drawNode = () => {
            myDiagram.nodeTemplateMap.add(
                DiagramCategory.WFNode,
                $(
                    go.Node,
                    'Auto',
                    {
                        mouseEnter: this.mouseEnterHandler,
                        mouseLeave: this.mouseLeaveHandler,
                        movable: DiagramSetting.moveNode,
                        // selectionChanged: node => {
                        //     this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                        // },
                        padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
                        minSize: new go.Size(DiagramSetting.nodeWith, DiagramSetting.nodeHeight)
                    },
                    $(
                        go.Shape,
                        'RoundedRectangle',
                        {
                            name: 'node_Body',
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
        };

        // 划循环分组
        const drawGroupLoop = () => {
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
                            layerSpacing: DiagramSetting.layerSpacing,
                            arrangementSpacing: new go.Size(30, 10)
                        }),

                        mouseEnter: this.mouseEnterHandler,
                        mouseLeave: this.mouseLeaveHandler,

                        movable: DiagramSetting.moveLoop,
                        padding: new go.Margin(DiagramSetting.padding, 0, DiagramSetting.padding, 0),
                        // the group begins unexpanded;
                        // upon expansion, a Diagram Listener will generate contents for the group
                        isSubGraphExpanded: true,
                        // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                        selectionChanged: node => {
                            this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                        },
                        subGraphExpandedChanged: function(group) {}
                    },

                    $(go.Shape, 'RoundedRectangle', {
                        name: 'group_Body',
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }),
                    $(
                        go.Panel,
                        'Vertical',
                        {
                            defaultAlignment: go.Spot.Left
                        },
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                name: 'group_Top',
                                padding: 5,
                                background: colors.group_bg
                            },
                            $('SubGraphExpanderButton', {
                                alignment: go.Spot.Center
                            }),
                            $(
                                go.TextBlock,
                                {
                                    name: 'group_Title',
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
        };

        //条件线
        const drawLinkCond = () => {
            myDiagram.linkTemplateMap.add(
                DiagramCategory.ConditionLink,
                $(
                    go.Link,
                    {
                        opacity: DiagramSetting.linkOpacity
                    },
                    new go.Binding('fromSpot', 'fromSpot', go.Spot.parse),
                    new go.Binding('toSpot', 'toSpot', go.Spot.parse),
                    new go.Binding('direction'),
                    new go.Binding('extension'),
                    new go.Binding('inset'),
                    $(go.Shape, { stroke: 'gray' }, new go.Binding('stroke', 'color')),
                    $(
                        go.Shape,
                        { fromArrow: 'BackwardOpenTriangle', segmentIndex: 2, stroke: 'gray' },
                        new go.Binding('stroke', 'color')
                    ),
                    $(
                        go.Shape,
                        { toArrow: 'OpenTriangle', segmentIndex: -3, stroke: 'gray' },
                        new go.Binding('stroke', 'color')
                    ),
                    $(
                        go.TextBlock,
                        {
                            segmentIndex: 2,
                            segmentFraction: 0.5,
                            segmentOrientation: go.Link.OrientUpright,
                            alignmentFocus: go.Spot.Bottom,
                            stroke: 'gray',
                            font: '8pt sans-serif'
                        },
                        new go.Binding('text', '', showDistance).ofObject(),
                        new go.Binding('stroke', 'color')
                    )
                )
            );
        };

        // 条件分组
        const drawGroupCond = () => {
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
                            layerSpacing: DiagramSetting.layerSpacing
                        }),
                        //locationSpot: go.Spot.TopRight, // the location is the center of the Shape,

                        mouseEnter: this.mouseEnterHandler,
                        mouseLeave: this.mouseLeaveHandler,

                        movable: DiagramSetting.moveCond,
                        selectionChanged: node => {
                            this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                        },
                        // the group begins unexpanded;
                        // upon expansion, a Diagram Listener will generate contents for the group
                        isSubGraphExpanded: true,
                        // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                        subGraphExpandedChanged: function(group) {}
                    },
                    $(go.Shape, 'RoundedRectangle', {
                        name: 'group_Body',
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }),
                    $(
                        go.Panel,
                        'Vertical',
                        {
                            defaultAlignment: go.Spot.Left
                        },
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                name: 'group_Top',
                                padding: 5,
                                background: colors.group_bg
                            },
                            $('SubGraphExpanderButton', {
                                alignment: go.Spot.Center
                            }),
                            $(
                                go.TextBlock,
                                {
                                    name: 'group_Title',
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
                            minSize: new go.Size(DiagramSetting.ConditionWidth, 0)
                        })
                    ) // end Vertical Panel
                )
            ); // end Group
        };

        // 条件分组
        const drawGroupCond1 = () => {
            myDiagram.groupTemplateMap.add(
                DiagramCategory.ConditionGroup,
                $(
                    go.Group,
                    'Auto',
                    {
                        // define the group's internal layout
                        layout: $(go.GridLayout, {
                            sorting: go.TreeLayout.SortingAscending
                        }),

                        //locationSpot: go.Spot.TopRight, // the location is the center of the Shape,
                        mouseEnter: this.mouseEnterHandler,
                        mouseLeave: this.mouseLeaveHandler,

                        movable: DiagramSetting.moveCond,
                        selectionChanged: node => {
                            this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                        },
                        // the group begins unexpanded;
                        // upon expansion, a Diagram Listener will generate contents for the group
                        isSubGraphExpanded: true,
                        // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                        subGraphExpandedChanged: function(group) {}
                    },

                    $(go.Shape, 'RoundedRectangle', {
                        name: 'group_Body',
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }),
                    $(
                        go.Panel,
                        'Vertical',
                        {
                            defaultAlignment: go.Spot.Left
                        },
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                name: 'group_Top',
                                padding: 5,
                                background: colors.group_bg
                            },
                            $('SubGraphExpanderButton', {
                                alignment: go.Spot.Center
                            }),
                            $(
                                go.TextBlock,
                                {
                                    name: 'group_Title',
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
        };

        //条件分支
        const drawGroupCondBranch = () => {
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
                            layerSpacing: DiagramSetting.layerSpacing
                        }),
                        locationSpot: go.Spot.Bottom,
                        locationObjectName: 'HEADER',
                        minLocation: new go.Point(0, 0),
                        maxLocation: new go.Point(9999, 0),
                        selectionObjectName: 'HEADER',

                        mouseLeave: this.mouseLeaveHandler,
                        mouseEnter: this.mouseEnterHandler,

                        mouseDrop: this.mouseDropHandler,

                        selectionChanged: node => {
                            this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
                        },

                        movable: DiagramSetting.moveCondBranch,

                        // the group begins unexpanded;
                        // upon expansion, a Diagram Listener will generate contents for the group
                        isSubGraphExpanded: true,
                        // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                        subGraphExpandedChanged: function(group) {
                            //debugger;
                            //console.log(group.subGraph.)
                        }
                    },
                    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                    $(go.Shape, 'RoundedRectangle', {
                        name: 'group_Body',
                        stroke: colors.group_border,
                        strokeWidth: 0.1,
                        fill: colors.group_bg
                    }),
                    $(
                        go.Panel,
                        'Vertical',
                        {
                            defaultAlignment: go.Spot.Left
                        },
                        $(
                            go.Panel,
                            'Horizontal',
                            {
                                name: 'group_Top',
                                padding: 5,
                                background: colors.group_bg
                            },
                            $('SubGraphExpanderButton', {
                                alignment: go.Spot.Center
                            }),
                            $(
                                go.TextBlock,
                                {
                                    name: 'group_Title',
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
                            name: 'left_Spot',
                            alignment: go.Spot.Left,
                            margin: new go.Margin(20, 0, 0, 1),
                            toLinkable: false,
                            cursor: 'pointer',
                            opacity: DiagramSetting.spotOpacity,
                            click: (e: go.InputEvent, thisObj: GraphObject) => {
                                this.props.addNodeBySelfHandler({
                                    eType: NodeEventType.AddPrvNode,
                                    toNode: thisObj.part!.data as WFNodeModel
                                });

                                go.GridLayout.Ascending;
                            }
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
                            strokeWidth: 1
                        })
                    ),
                    // output port
                    $(
                        go.Panel,
                        'Auto',
                        {
                            name: 'right_Spot',
                            alignment: go.Spot.Right,
                            margin: new go.Margin(20, 0, 0, 1),
                            portId: 'from',
                            fromLinkable: false,
                            cursor: 'pointer',
                            opacity: DiagramSetting.spotOpacity,
                            click: (e: go.InputEvent, thisObj: GraphObject) => {
                                this.props.addNodeBySelfHandler({
                                    eType: NodeEventType.AddNextNode,
                                    toNode: thisObj.part!.data as WFNodeModel
                                });
                            }
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
                            strokeWidth: 1
                        })
                    )
                )
            );
        };

        const drawStart_End = () => {
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
                        deletable: false,
                        mouseDragEnter: this.mouseDragEnterHandler,
                        mouseDragLeave: this.mouseDragLeaveHandler,
                        mouseDrop: this.mouseDropHandler
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
                            margin: new go.Margin(0, 0, 0, 2)
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
        };

        drawNode();
        drawLink();
        drawLinkCond();
        DiagramSetting.test ? drawGroupCond() : drawGroupCond1();
        drawGroupCondBranch();
        drawGroupLoop();
        drawStart_End();

        //notice whenever the selection may have changed
        myDiagram.addDiagramListener('ChangedSelection', function(e: go.DiagramEvent) {
            //_this.props.onNodeSelectionHandler(node.key as string, node.isSelected as boolean);
        });

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

        function showDistance(link) {
            var numpts = link.pointsCount;
            if (numpts < 2) return '';
            var p0 = link.getPoint(0);
            var pn = link.getPoint(numpts - 1);
            var ang = link.direction;
            if (isNaN(ang)) return Math.floor(Math.sqrt(p0.distanceSquaredPoint(pn))) + '';
            var rad = (ang * Math.PI) / 180;
            return Math.floor(Math.abs(Math.cos(rad) * (p0.x - pn.x)) + Math.abs(Math.sin(rad) * (p0.y - pn.y))) + '';
        }

        this.props.setDiagramHandler(myDiagram);

        return myDiagram;
    }

    /**
     * 鼠标移上
     * @param e
     * @param obj
     */
    private mouseEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        // used by both the Button Binding and by the changeColor click function

        let node = (obj as any).part;
        if (node && node.diagram) {
            node.diagram.startTransaction('Change color');

            let lbody = node.findObject('link_Body');
            if (lbody) lbody.stroke = colors.link_highlight;

            let linkArr = node.findObject('link_Arr');
            if (linkArr) linkArr.fill = colors.link_highlight;

            let nbody = node.findObject('node_Body');
            if (nbody) nbody.fill = colors.highlight;

            let shape = node.findObject('group_Body');
            if (shape) shape.fill = colors.group_highlight;

            let top = node.findObject('group_Top');
            if (top) top.background = colors.group_highlight;

            let title = node.findObject('group_Title');
            if (title) title.stroke = colors.group_highlight_font;

            let btn = node.findObject('btn_add');
            if (btn) {
                btn.fill = colors.link_highlight;
            }

            let lspot = node.findObject('left_Spot');
            if (lspot) {
                lspot.opacity = 1;
            }
            let rspot = node.findObject('right_Spot');
            if (rspot) {
                rspot.opacity = 1;
            }

            node.diagram.commitTransaction('Change color');
        }
    }

    /**
     * 鼠标移开
     * @param e
     * @param obj
     */
    private mouseLeaveHandler(e: go.InputEvent, obj: GraphObject): void {
        let node = (obj as any).part;
        if (node && node.diagram) {
            node.diagram.startTransaction('Change color');

            let lbody = node.findObject('link_Body');
            if (lbody) lbody.stroke = colors.link;

            let linkArr = node.findObject('link_Arr');
            if (linkArr) linkArr.fill = colors.link;

            let nbody = node.findObject('node_Body');
            if (nbody) nbody.fill = colors.backgroud;

            let shape = node.findObject('group_Body');
            if (shape) shape.fill = colors.group_bg;

            let top = node.findObject('group_Top');
            if (top) top.background = colors.group_bg;

            let title = node.findObject('group_Title');
            if (title) title.stroke = colors.group_font;

            let btn = node.findObject('btn_add');
            if (btn) {
                btn.fill = colors.link;
            }

            let lspot = node.findObject('left_Spot');
            if (lspot) {
                lspot.opacity = 0;
            }
            let rspot = node.findObject('right_Spot');
            if (rspot) {
                rspot.opacity = 0;
            }

            node.diagram.commitTransaction('Change color');
        }
    }

    /**
     * 鼠标 拖拽移上
     * @param e
     * @param obj
     */
    private mouseDragEnterHandler(e: go.InputEvent, obj: GraphObject): void {}

    /**
     * 鼠标 拖拽移开
     * @param e
     * @param obj
     */
    private mouseDragLeaveHandler(e: go.InputEvent, obj: GraphObject, obj1: GraphObject): void {}

    /**
     * 鼠标 拖拽
     * @param e
     * @param obj
     */
    private mouseDropHandler(e: go.InputEvent, obj: GraphObject): void {
        // mouseType = '';
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

    private getLinkPlusLineHighlightedopacity = (h, shape): number => {
        if (this.props.drager && this.props.drager.name) {
            return 1;
        }
        return 0;
    };

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

    //Update the layout from the controls, and then perform the layout again
    // private layout=() =>{
    //     myDiagram.startTransaction("change Layout");
    //     var lay = myDiagram.layout;
    //     lay.sorting = go.GridLayout.s
    //     myDiagram.commitTransaction("change Layout");
    // }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyDiagram);
