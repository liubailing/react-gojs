import React from 'react';
import WFDroper from './wfDroper';
import WFNode, { WFNodeType } from './wfNode';
import './wfContainer.css';
import { DiagramState } from '../../reducers/diagramReducer';
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

    render = () => {
        let arr: WFNodeType[] = [];
        for (const key in WFNodeType) {
            if (WFNodeType.hasOwnProperty(key)) {
                arr.push(WFNodeType[key] as WFNodeType);
            }
        }

        return (
            <div className="wfContainer" id="wfContainer">
                <div className="wfNodes">
                    {arr &&
                        arr.map(function(e, i) {
                            return <WFNode key={i} type={e} />;
                        })}
                    <WFNode type="" />
                </div>
                <div className="wfDiagrams">
                    <WFDroper />
                </div>
            </div>
        );
    };

    componentDidMount() {
        this.intAct();
    }

    intAct() {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WFContainer);
