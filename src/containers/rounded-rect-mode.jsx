import PropTypes from 'prop-types';
import Modes from '../lib/modes';
import {changeRoundedRectCornerSize} from '../reducers/rounded-rect-mode';
import RectTool from '../helper/tools/rect-tool';
import RoundedRectModeComponent from '../components/rounded-rect-mode/rounded-rect-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.ROUNDED_RECT,
    Component: RoundedRectModeComponent,
    displayName: 'RoundedRectMode',
    Tool: RectTool,
    toolMode: Modes.ROUNDED_RECT,
    options: [{
        prop: 'roundedCornerSize',
        propType: PropTypes.number.isRequired,
        fromState: state => state.scratchPaint.roundedRectMode.roundedCornerSize,
        setter: 'setRoundedCornerSize',
        isMissing: value => typeof value !== 'number',
        fallback: 0,
        action: changeRoundedRectCornerSize
    }]
});
