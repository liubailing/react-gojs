import React from 'react';
import WFDroper from './wfDroper';
import WFNode, { wfNodeType } from './wfNode';
import './wfContainer.css';
import { DiagramState } from '../reducers/diagramReducer';
import { connect } from 'react-redux';

interface MyDiagramProps extends WFDroperDispatchProps {}

interface WFDroperDispatchProps {}

const mapStateToProps = (state: DiagramState) => {
    return {
        model: state
    };
};

const mapDispatchToProps = (): WFDroperDispatchProps => {
    return {};
};

class WFContainer extends React.PureComponent<MyDiagramProps> {
    constructor(props: MyDiagramProps) {
        super(props);
    }

    render() {
        return (
            <div className="wfContainer" id="wfContainer">
                <div className="wfNodes">
                    <WFNode type={wfNodeType.Btn_Start} />
                    <WFNode type={wfNodeType.Btn_Reset} />
                    <WFNode type={wfNodeType.Click} />
                    <WFNode type={wfNodeType.Data} />
                    <WFNode type={wfNodeType.Loop} />
                    <WFNode type={wfNodeType.Condition} />
                    <WFNode type={wfNodeType.End} />
                </div>
                <div className="wfDiagrams">
                    <WFDroper />
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.intAct();
    }

    intAct() {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFContainer);
