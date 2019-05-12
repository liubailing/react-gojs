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
    addNodeByDropNode
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
        }
    };
};

let mouseType = '';
let count = 0;
let toKey = '';
let pixelratio = 0;
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
                model={this.getMode()}
                createDiagram={this.createDiagram}
                onModelChange={this.props.onModelChangeHandler}
            />
        );
    }

    private getMode(): DiagramModel<WFNodeModel, WFLinkModel> {
        const a = go.GraphObject.length;
        console.log(a);
        return this.props.model;
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

        pixelratio = myDiagram.computePixelRatio();

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
                new go.Binding('fill', 'isHighlighted', function(h, shape) {
                    if (h) return mouseType === 'DRAG' ? 'red' : 'green';
                    var c = shape.part.data.color;
                    return c ? c : 'white';
                }).ofObject() // binding source is Node.isHighlighted
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
                new go.Binding('stroke', 'isHighlighted', function(h, shape) {
                    if (h) return mouseType === 'DRAG' ? 'red' : 'green';
                    var c = shape.part.data.color;
                    return c ? c : 'white';
                }).ofObject() // binding source is Node.isHighlighted
            ),
            $(
                go.Shape,
                {
                    toArrow: 'OpenTriangle',
                    stroke: 'red'
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('stroke', 'isHighlighted', function(h, shape) {
                    if (h) return mouseType === 'DRAG' ? 'red' : 'green';
                    var c = shape.part.data.color;
                    return c ? c : 'white';
                }).ofObject() // binding source is Node.isHighlighted
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
                    fill: '#fff',
                    stroke: 'gray',
                    strokeWidth: 1
                },
                new go.Binding('stroke', 'fff'),
                new go.Binding('fill', 'isHighlighted', function(h, shape) {
                    if (h) return mouseType === 'DRAG' ? 'red' : 'green';
                    var c = shape.part.data.color;
                    return c ? c : 'white';
                }).ofObject() // binding source is Node.isHighlighted
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

        this.initDrag();
        return myDiagram;
    }

    private initDrag(): void {
        // *********************************************************
        // First, set up the infrastructure to do HTML drag-and-drop
        // *********************************************************
        let dragged: any = null; // A reference to the element currently being dragged
        let _this = this;
        // This event should only fire on the drag targets.
        // Instead of finding every drag target,
        // we can add the event to the document and disregard
        // all elements that are not of class "draggable"

        let wfContainer: HTMLElement | null = document.getElementById('wfContainer');

        if (!wfContainer) return;

        wfContainer.addEventListener(
            'dragstart',
            function(event: any) {
                console.log(event.target.className);
                if (event.target.className !== 'wfNode') return;
                // Some data must be set to allow drag
                event.dataTransfer.setData('text', event.target.textContent);
                // store a reference to the dragged element and the offset of the mouse from the center of the element
                dragged = event.target;
                dragged.offsetX = event.offsetX - dragged.clientWidth / 2;
                dragged.offsetY = event.offsetY - dragged.clientHeight / 2;
                // Objects during drag will have a red border
                event.target.style.border = '1px solid red';
                event.target.style.opCity = '0.4';
            },
            false
        );
        // This event resets styles after a drag has completed (successfully or not)
        wfContainer.addEventListener(
            'dragend',
            function(event) {
                // reset the border of the dragged element
                if (dragged) {
                    dragged.style.border = '';
                }
                _this.setNodeHighlight(null);
            },
            false
        );
        // Next, events intended for the drop target - the Diagram div
        let div: HTMLElement | null = document.getElementById('divDiagram');
        if (div) {
            div.addEventListener(
                'dragenter',
                function(event) {
                    // Here you could also set effects on the Diagram,
                    // such as changing the background color to indicate an acceptable drop zone
                    // Requirement in some browsers, such as Internet Explorer
                    event.preventDefault();
                },
                false
            );
            div.addEventListener(
                'dragover',
                function(event: any) {
                    // We call preventDefault to allow a drop
                    // But on divs that already contain an element,
                    // we want to disallow dropping
                    if (dragged && this === myDiagram.div && event && event.clientX) {
                        var can = event.target;
                        //var pixelratio = window.devicePixelRatio;//window.PIXELRATIO
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
                        var curnode = myDiagram.findPartAt(point, true);

                        if (curnode instanceof go.Link) {
                            console.log('----------------------begin highlight Link -------------------');
                            _this.setNodeHighlight(curnode);
                        } else if (curnode instanceof go.Node) {
                            console.log('----------------------begin highlight Node -------------------');
                            _this.setNodeHighlight(curnode, true);
                        } else if (curnode instanceof go.Diagram) {
                            console.log('----------------------begin highlight Diagram -------------------');
                        } else if (curnode instanceof go.Group) {
                            console.log('----------------------begin highlight Group -------------------');
                        } else {
                            //highlight(null);
                        }
                    }
                    if (event.target.className === 'divDiagram') {
                        // Disallow a drop by returning before a call to preventDefault:
                        return;
                    }
                    // Allow a drop on everything else
                    event.preventDefault();
                },
                false
            );
            div.addEventListener(
                'dragleave',
                function(event: any) {
                    // reset background of potential drop target
                    if (event.target.className == 'divDiagram') {
                        event.target.style.background = '';
                    }
                    _this.setNodeHighlight(null);
                },
                false
            );
            // handle the user option for removing dragged items from the Palette
            //var remove:HTMLElement|null = document.getElementById('remove');
            div.addEventListener(
                'drop',
                function(event: any) {
                    // prevent default action
                    // (open as link for some elements in some browsers)
                    event.preventDefault();
                    // Dragging onto a Diagram
                    if (dragged && this === myDiagram.div && event && event.clientX) {
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

                        if (curnode instanceof go.Link) {
                            _this.props.addNodeByDropLinkHandler('new');
                        } else if (curnode instanceof go.Node) {
                            _this.props.nodeDropedToHandler(curnode.key as string);
                            _this.props.addNodeByDropNodeHandler('new');
                        } else if (curnode instanceof go.Diagram) {
                        } else if (curnode instanceof go.Group) {
                        } else {
                            //highlight(null);
                        }

                        //myDiagram.startTransaction('new node');
                        // myDiagram.model.addNodeData({
                        //     location: point,
                        //     text: event.dataTransfer.getData('text'),
                        //     color: "lightyellow"
                        // });
                        //
                        // if (toKey) _this.props.onNodeSelectionHandler(toKey, true);
                        // console.log(toKey);
                        // _this.props.addNodeHandler('new');
                        //myDiagram.commitTransaction('new node');
                        // remove dragged element from its old location
                        //if (remove && remove.c) dragged.parentNode.removeChild(dragged);
                    }
                    // If we were using drag data, we could get it here, ie:
                    // var data = event.dataTransfer.getData('text');
                },
                false
            );
        }
    }

    // highlight stationary nodes during an external drag-and-drop into a Diagram
    private setNodeHighlight(node, setSelect: boolean = false): void {
        // may be null
        var oldskips = myDiagram.skipsUndoManager;
        myDiagram.skipsUndoManager = true;
        myDiagram.startTransaction('highlight');
        if (node !== null) {
            myDiagram.highlight(node);
            if (setSelect && toKey != node.key) {
                toKey = node.key;
            }
        } else {
            myDiagram.clearHighlighteds();
        }
        myDiagram.commitTransaction('highlight');
        myDiagram.skipsUndoManager = oldskips;
    }

    /**
     * 鼠标移上
     * @param e
     * @param obj
     */
    private mouseEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        this.setNodeHighlight(obj);
    }

    /**
     * 鼠标移开
     * @param e
     * @param obj
     */
    private mouseLeaveHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = '';
        this.setNodeHighlight(null);
    }

    /**
     * 鼠标 拖拽移上
     * @param e
     * @param obj
     */
    private mouseDragEnterHandler(e: go.InputEvent, obj: GraphObject): void {
        mouseType = 'DRAG';
        this.setNodeHighlight(obj);
    }

    /**
     * 鼠标 拖拽移开
     * @param e
     * @param obj
     */
    private mouseDragLeaveHandler(e: go.InputEvent, obj: GraphObject, obj1: GraphObject): void {
        mouseType = 'DRAG';
        this.setNodeHighlight(null);
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
