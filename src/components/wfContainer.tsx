import React from 'react';
import WFDroper from './wfDroper';
import WFNode, { wfNodeType } from './wfNode';
import './wfContainer.css';

export default class WFContainer extends React.PureComponent {
    render() {
        return (
            <div className="wfContainer">
                <div className="wfNodes">
                    <WFNode type={wfNodeType.Btn_Start} />
                    <WFNode type={wfNodeType.Btn_Reset} />
                    <WFNode type={wfNodeType.Click} />
                    <WFNode type={wfNodeType.Data} />
                    <WFNode type={wfNodeType.End} />
                </div>
                <div className="wfDiagrams">
                    <WFDroper />
                </div>
            </div>
        );
    }
}
