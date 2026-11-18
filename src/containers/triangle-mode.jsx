import PropTypes from 'prop-types';
import Modes from '../lib/modes';
import {changeTrianglePolyCount, changeTrianglePointCount} from '../reducers/triangle-mode';
import TriangleTool from '../helper/tools/triangle-tool';
import TriangleModeComponent from '../components/triangle-mode/triangle-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.TRIANGLE,
    Component: TriangleModeComponent,
    displayName: 'TriangleMode',
    Tool: TriangleTool,
    options: [{
        prop: 'sideCount',
        propType: PropTypes.number.isRequired,
        fromState: state => state.scratchPaint.triangleMode.trianglePolyCount,
        setter: 'setSideCount',
        isMissing: value => typeof value !== 'number',
        fallback: 3,
        action: changeTrianglePolyCount
    }, {
        prop: 'pointCount',
        propType: PropTypes.number.isRequired,
        fromState: state => state.scratchPaint.triangleMode.trianglePointCount,
        setter: 'setPointCount',
        isMissing: value => typeof value !== 'number',
        fallback: 1,
        action: changeTrianglePointCount
    }]
});
