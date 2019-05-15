import React from 'react';
import WFContainer from './wfContainer';
import { Provider } from 'react-redux';
import { create } from '../../store';
import { diagramReducer } from '../../reducers/diagramReducer';

import go from 'gojs';

const gojsKey = process.env.REACT_APP_GOJS_KEY;
if (gojsKey) {
    // tslint:disable-next-line:no-any
    (go as any).licenseKey = gojsKey;
}

export default class wfIndex extends React.Component {
    render = () => (
        <Provider store={create(diagramReducer)}>
            <WFContainer />
        </Provider>
    );
}
