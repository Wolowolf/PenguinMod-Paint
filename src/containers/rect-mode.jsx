import PropTypes from 'prop-types';
import Modes from '../lib/modes';
import {changeRoundedCornerSize} from '../reducers/rect-mode';
import RectTool from '../helper/tools/rect-tool';
import RectModeComponent from '../components/rect-mode/rect-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.RECT,
    Component: RectModeComponent,
    displayName: 'RectMode',
    Tool: RectTool,
    options: [{
        prop: 'roundedCornerSize',
        propType: PropTypes.number.isRequired,
        fromState: state => state.scratchPaint.rectMode.roundedCornerSize,
        setter: 'setRoundedCornerSize',
        isMissing: value => typeof value !== 'number',
        fallback: 0,
        action: changeRoundedCornerSize
    }]
});
