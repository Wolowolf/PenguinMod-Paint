import PropTypes from 'prop-types';
import Modes from '../lib/modes';
import {changeCurrentlySelectedShape} from '../reducers/sussy-mode';
import SussyTool from '../helper/tools/sussy-tool';
import SussyModeComponent from '../components/sussy-mode/sussy-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.SUSSY,
    Component: SussyModeComponent,
    displayName: 'SussyMode',
    Tool: SussyTool,
    options: [{
        prop: 'shape',
        propType: PropTypes.string.isRequired,
        fromState: state => state.scratchPaint.sussyMode.shape,
        setter: 'setShape',
        isMissing: value => !value,
        fallback: 'smile',
        action: changeCurrentlySelectedShape
    }]
});
