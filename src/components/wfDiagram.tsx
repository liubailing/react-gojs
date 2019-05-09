import React from 'react';
import go, { Diagram, ToolManager, GraphObject } from 'gojs';
import { NodeModel } from '../reducers/diagramReducer';
import { DiagramModel, LinkModel, GojsDiagram, ModelChangeEvent } from 'react-gojs';
import './wfDiagram.css';
import { UpdateNodeTextEvent } from '../actions/diagram';

interface MyDiagramProps {
    model: DiagramModel<NodeModel, LinkModel>;
    onNodeSelection: (key: string, isSelected: boolean) => void;
    onModelChange: (event: ModelChangeEvent<NodeModel, LinkModel>) => void;
    onTextChange: (event: UpdateNodeTextEvent) => void;
}

class MyDiagram extends React.PureComponent<MyDiagramProps> {
    constructor(props: MyDiagramProps) {
        super(props);
        this.createDiagram = this.createDiagram.bind(this);
        this.onTextEdited = this.onTextEdited.bind(this);
    }
    render() {
        return (
            <GojsDiagram
                diagramId="divDiagram"
                model={this.getMode()}
                createDiagram={this.createDiagram}
                className="divDiagram"
                onModelChange={() => {
                    console.log('onModelChange');
                    this.props.onModelChange;
                }}
            />
        );
    }

    private getMode(): DiagramModel<NodeModel, LinkModel> {
        const a = go.GraphObject.length;
        console.log(a);
        return this.props.model;
    }

    private createDiagram(diagramId: string): Diagram {
        const $ = go.GraphObject.make;
        console.log('create');
        const myDiagram: Diagram = $(go.Diagram, diagramId, {
            contentAlignment: go.Spot.TopCenter,
            initialContentAlignment: go.Spot.LeftCenter,
            layout: $(go.TreeLayout, {
                angle: 90,
                arrangement: go.TreeLayout.ArrangementVertical,
                treeStyle: go.TreeLayout.StyleLayered
            }),
            TextEdited: this.onTextEdited
        });

        //myDiagram.toolManager.panningTool.isEnabled = false;
        myDiagram.toolManager.mouseWheelBehavior = ToolManager.WheelScroll;

        myDiagram.nodeTemplate = $(
            go.Node,
            'Auto',
            {
                mouseEnter: this.nodeMouseEnterHandler,
                mouseLeave: this.nodeMouseLeaveHandler,
                mouseDrop: this.nodeMouseDropHandler,
                locationSpot: go.Spot.Center, // the location is the center of the Shape
                resizeObjectName: 'SHAPE', // user can resize the Shape
                selectionChanged: node => this.props.onNodeSelection(node.key as string, node.isSelected)
            },
            $(
                go.Shape,
                'RoundedRectangle',
                {
                    strokeWidth: 0
                },
                new go.Binding('fill', 'color')
            ),
            $(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label'))
        );

        myDiagram.linkTemplate = $(
            go.Link,
            {
                mouseEnter: this.nodeMouseEnterHandler,
                mouseLeave: this.nodeMouseLeaveHandler,
                mouseDrop: this.nodeMouseDropHandler,
                routing: go.Link.Orthogonal,
                corner: 10
            },
            $(
                go.Shape,
                {
                    strokeWidth: 2
                },
                new go.Binding('stroke', 'color'),
                new go.Binding('text', '1111')
            ),
            $(
                go.Shape,
                {
                    toArrow: 'OpenTriangle',
                    stroke: 'red'
                },
                new go.Binding('stroke', 'color')
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
                // the group begins unexpanded;
                // upon expansion, a Diagram Listener will generate contents for the group
                isSubGraphExpanded: false,
                // when a group is expanded, if it contains no parts, generate a subGraph inside of it
                subGraphExpandedChanged: function(group) {
                    if (group.memberParts.count === 0) {
                        randomGroup(group.data.key);
                    }
                }
            },
            $(go.Shape, 'Rectangle', { fill: null, stroke: 'gray', strokeWidth: 2 }),
            $(
                go.Panel,
                'Vertical',
                { defaultAlignment: go.Spot.Left, margin: 4 },
                $(
                    go.Panel,
                    'Horizontal',
                    { defaultAlignment: go.Spot.Top },
                    // the SubGraphExpanderButton is a panel that functions as a button to expand or collapse the subGraph
                    $('SubGraphExpanderButton'),
                    $(go.TextBlock, { font: 'Bold 18px Sans-Serif', margin: 4 }, new go.Binding('text', 'key'))
                ),
                // create a placeholder to represent the area where the contents of the group are
                $(go.Placeholder, { padding: new go.Margin(0, 10) })
            ) // end Vertical Panel
        ); // end Group

        // Generate a random number of nodes, including groups.
        // If a group's key is given as a parameter, put these nodes inside it
        function randomGroup(group) {
            // all modification to the diagram is within this transaction
            myDiagram.startTransaction('addGroupContents');
            var addedKeys: any = []; // this will contain the keys of all nodes created
            var groupCount = 0; // the number of groups in the diagram, to determine the numbers in the keys of new groups
            myDiagram.nodes.each(function(node) {
                if (node instanceof go.Group) groupCount++;
            });
            // create a random number of groups
            // ensure there are at least 10 groups in the diagram
            var groups = Math.floor(Math.random() * 2);
            if (groupCount < 10) groups += 1;
            for (var i = 0; i < groups; i++) {
                var name = 'group' + (i + groupCount);

                myDiagram.model.addNodeData({ key: name, isGroup: true, group: group });
                addedKeys.push(name);
            }
            var nodes = Math.floor(Math.random() * 3) + 2;
            // create a random number of non-group nodes
            for (var i = 0; i < nodes; i++) {
                var color = go.Brush.randomColor();
                // make sure the color, which will be the node's key, is unique in the diagram before adding the new node
                if (myDiagram.findPartForKey(color) === null) {
                    myDiagram.model.addNodeData({ key: color, group: group });
                    addedKeys.push(color);
                }
            }
            // add at least one link from each node to another
            // this could result in clusters of nodes unreachable from each other, but no lone nodes
            var arr: any = [];
            for (var x in addedKeys) arr.push(addedKeys[x]);
            arr.sort(function(x, y) {
                return -1;
            });
            for (var i = 0; i < arr.length; i++) {
                var from = Math.floor(Math.random() * (arr.length - i)) + i;
                if (from !== i) {
                    //myDiagram.mode.addLinkData({ from: arr[from], to: arr[i] });
                }
            }
            myDiagram.commitTransaction('addGroupContents');
        }

        randomGroup('randomGroup1');

        return myDiagram;
    }

    private nodeMouseEnterHandler(e, obj: GraphObject): void {
        console.log('node-MouseEnter');
    }

    private nodeMouseLeaveHandler(e, obj: GraphObject): void {
        console.log('node-MouseLeave');
    }

    private nodeMouseDropHandler(e, obj: GraphObject): void {
        console.log('node-MouseDrop------------' + this);
    }

    private onTextEdited(e: go.DiagramEvent) {
        const tb = e.subject;
        if (tb === null) {
            return;
        }
        const node = tb.part;
        if (node instanceof go.Node && this.props.onTextChange) {
            this.props.onTextChange({ key: node.key as string, text: tb.text });
        }
    }
}

export default MyDiagram;
