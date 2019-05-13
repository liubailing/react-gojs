import React from 'react';
import './wfDiagram.css';
import { DiagramState, modelSelector, WFNodeModel, WFLinkModel } from '../reducers/diagramReducer';
import { connect } from 'react-redux';
import { DiagramModel, LinkModel } from 'react-gojs';
import WFDiagram from './wfDiagram';
import { wfNodeType } from './wfNode';
import { Action } from 'typescript-fsa';
import { Dispatch } from 'redux';
import go from 'gojs';
import { linkDropedTo, nodeDropedTo, addNodeByDropLink, addNodeByDropNode, setNodeHighlight } from '../actions/diagram';

interface WFDroperProps extends WFDroperDispatchProps {
    model: DiagramModel<WFNodeModel, LinkModel>;
    state: DiagramState;
}

const mapStateToProps = (state: DiagramState) => {
    return {
        model: modelSelector(state),
        state: state
    };
};

interface WFDroperDispatchProps {
    initHandler: (type: wfNodeType) => void;
    setNodeHighlightHandler: (node: any) => void;
    linkDropedToHandler: (link: WFLinkModel) => void;
    nodeDropedToHandler: (key: string) => void;
    addNodeByDropLinkHandler: (name: string) => void;
    addNodeByDropNodeHandler: (name: string) => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action<string | null> | Action<WFLinkModel>>): WFDroperDispatchProps => {
    return {
        initHandler: (type: wfNodeType) => {},
        setNodeHighlightHandler: (node: any) => {
            dispatch(setNodeHighlight(node));
        },
        linkDropedToHandler: (link: WFLinkModel) => {
            dispatch(linkDropedTo(link));
        },
        nodeDropedToHandler: (key: string) => {
            dispatch(nodeDropedTo(key));
        },
        addNodeByDropLinkHandler: (name: string) => {
            dispatch(addNodeByDropLink(`${name}`));
        },
        addNodeByDropNodeHandler: (name: string) => {
            dispatch(addNodeByDropNode(`${name}`));
        }
    };
};

const WFDroper: React.FC<WFDroperProps> = ({
    model,
    state,
    initHandler,
    setNodeHighlightHandler,
    linkDropedToHandler,
    nodeDropedToHandler,
    addNodeByDropLinkHandler,
    addNodeByDropNodeHandler
}) => {
    return (
        <div
            className="wfDiagram"
            style={{ backgroundColor: '#fff' }}
            onDragEnter={(e: any) => {
                if (!state.drager) e.preventDefault();
                e.target.style.backgroundColor = '#ddd';
            }}
            onDragLeave={(e: any) => {
                e.target.style.backgroundColor = '';
            }}
            onDragOver={(event: any) => {
                event.preventDefault();
                event.target.style.backgroundColor = '';
                const myDiagram = state.diagram;
                let pixelratio = myDiagram.computePixelRatio();
                // prevent default action
                // (open as link for some elements in some browsers)
                event.preventDefault();
                // Dragging onto a Diagram
                if (state.drager && event && event.clientX) {
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
                        setNodeHighlightHandler(curnode);
                    } else if (curnode instanceof go.Group) {
                        setNodeHighlightHandler(curnode);
                    } else if (curnode instanceof go.Node) {
                        setNodeHighlightHandler(curnode);
                    } else {
                        setNodeHighlightHandler(null);
                    }
                }
            }}
            onDrop={(event: any) => {
                event.preventDefault();
                event.target.style.backgroundColor = '';
                const myDiagram = state.diagram;
                let pixelratio = myDiagram.computePixelRatio();
                // prevent default action
                // (open as link for some elements in some browsers)
                event.preventDefault();
                // Dragging onto a Diagram
                if (state.drager && event && event.clientX) {
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
                        let l = (curnode as any)!.jb;
                        if (l) {
                            linkDropedToHandler(l as WFLinkModel);
                            addNodeByDropLinkHandler('new');
                        }
                        console.log('-------------------Link ----------------');
                    } else if (curnode instanceof go.Group) {
                        let l = (curnode as any)!.jb;
                        if (l) {
                            nodeDropedToHandler(l.key as string);
                            addNodeByDropNodeHandler('new');
                        }
                        console.log('-------------------Group ----------------');
                    } else if (curnode instanceof go.Node) {
                        console.log('-------------------Node ----------------');
                    } else {
                    }
                }
            }}
        >
            <WFDiagram model={model} />
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFDroper);
