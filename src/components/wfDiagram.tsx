import React from 'react';
import go, { Diagram, ToolManager, GraphObject } from 'gojs';
import { DiagramState, WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import './wfDiagram.css';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
    nodeSelected,
    nodeDeselected,
    removeNode,
    removeLink,
    UpdateNodeTextEvent,
    UpdateNodeText,
    addNode,
    setDiagram,
    newNode,
    linkDropedTo,
    nodeDropedTo,
    addNodeByDropLink,
    addNodeByDropNode,
    setNodeHighlight
} from '../actions/diagram';
import { DiagramModel, ModelChangeEvent, GojsDiagram, ModelChangeEventType } from 'react-gojs';
import { Action } from 'typescript-fsa';

interface MyDiagramProps extends WFDroperDispatchProps {
    model: DiagramModel<WFNodeModel, WFLinkModel>;
}

const mapStateToProps = (state: DiagramState) => {
    return {
        ...state
    };
};

interface WFDroperDispatchProps {
    onNodeSelectionHandler: (key: string, isSelected: boolean) => void;
    onModelChangeHandler: (event: ModelChangeEvent<WFNodeModel, WFLinkModel>) => void;
    onTextChangeHandler: (event: UpdateNodeTextEvent) => void;
    setDiagramHandler: (diagram: Diagram) => void;
    addNodeHandler: (name: string) => void;
    newNodeHandler: (name: string) => void;
    linkDropedToHandler: (link: WFLinkModel) => void;
    nodeDropedToHandler: (key: string) => void;
    addNodeByDropLinkHandler: (name: any) => void;
    addNodeByDropNodeHandler: (name: string) => void;
    setNodeHighlightHandler: (node: any) => void;
}

const mapDispatchToProps = (
    dispatch: Dispatch<Action<string> | Action<Diagram> | Action<WFLinkModel> | Action<UpdateNodeTextEvent>>
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
        onTextChangeHandler: (event: UpdateNodeTextEvent) => {
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
        linkDropedToHandler: (link: WFLinkModel) => {
            dispatch(linkDropedTo(link));
        },
        nodeDropedToHandler: (key: string) => {
            dispatch(nodeDropedTo(key));
        },
        addNodeByDropLinkHandler: (name: string) => {
            dispatch(addNodeByDropLink(`${name}-${++count}`));
        },
        addNodeByDropNodeHandler: (name: string) => {
            dispatch(addNodeByDropNode(`${name}-${++count}`));
        },
        setNodeHighlightHandler: (node: any) => {
            dispatch(setNodeHighlight(node));
        }
    };
};

let mouseType = '';
let count = 0;
let myDiagram: Diagram;

class MyDiagram extends React.PureComponent<MyDiagramProps> {
    constructor(props: MyDiagramProps) {
        super(props);
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
            $(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label'))
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
                new go.Binding('stroke', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                {
                    toArrow: 'OpenTriangle',
                    stroke: 'red'
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('stroke', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
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
                mouseEnter: this.mouseEnterHandler,
                mouseLeave: this.mouseLeaveHandler,
                mouseDragEnter: this.mouseDragEnterHandler,
                mouseDragLeave: this.mouseDragLeaveHandler,
                mouseDrop: this.mouseDropHandler,
                // the group begins unexpanded;
                // upon expansion, a Diagram Listener will generate contents for the group
                isSubGraphExpanded: true
                // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                // subGraphExpandedChanged: function(group) {
                //     if (group.memberParts.count === 0) {
                //     }
                // }
            },
            $(
                go.Shape,
                'Rectangle',
                {
                    stroke: '#ddd',
                    strokeWidth: 1
                },
                new go.Binding('stroke', '#fff'),
                new go.Binding('fill', 'isHighlighted', this.getHighlightedColor).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Panel,
                'Vertical',
                {
                    defaultAlignment: go.Spot.Left,
                    margin: 4
                },
                $(
                    go.Panel,
                    'Horizontal',
                    {
                        defaultAlignment: go.Spot.Top
                    },
                    // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                    $('SubGraphExpanderButton'),
                    $(
                        go.TextBlock,
                        {
                            font: 'Bold 18px Sans-Serif',
                            margin: 4
                        },
                        new go.Binding('text', 'label')
                    )
                ),
                // create a placeholder to represent the area where the contents of the group are
                $(go.Placeholder, { padding: new go.Margin(0, 10) })
            ) // end Vertical Panel
        ); // end Group

        this.props.setDiagramHandler(myDiagram);
        return myDiagram;
    }

    private getHighlightedColor = (h, shape): string => {
        if (h) return mouseType === 'Hover' ? '#ddd' : 'red';
        var c = shape.part.data.color;
        return c ? c : 'white';
        //return  'white';
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
            let l = (obj as any)!.jb;
            if (l) {
                this.props.linkDropedToHandler(l as WFLinkModel);
                this.props.addNodeByDropLinkHandler('new');
            }
        } else if (obj instanceof go.Group) {
            let l = (obj as any)!.jb;
            if (l) {
                this.props.nodeDropedToHandler(l.key as string);
                this.props.addNodeByDropNodeHandler('');
            }
        } else if (obj instanceof go.Node) {
            let l = (obj as any)!.jb;
            if (l) {
                this.props.nodeDropedToHandler(l.key as string);
                this.props.addNodeByDropNodeHandler('');
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
            this.props.onTextChangeHandler({ key: node.key as string, text: tb.text });
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyDiagram);
