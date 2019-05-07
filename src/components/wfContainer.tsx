import React from 'react';
import WFDiagram from './wfDiagram';
import WFNode, { wfNodeType } from './wfNode';

import './wfContainer.css';

export default class wfContainer extends React.Component {
    render = () => (
        <div className="wfContainer">
            <div className="wfNodes">
                <WFNode type={wfNodeType.Start} />
                <WFNode type={wfNodeType.Click} />
                <WFNode type={wfNodeType.Data} />
            </div>
            <div className="wfDiagram">
                <WFDiagram />
            </div>
        </div>
    );
}
