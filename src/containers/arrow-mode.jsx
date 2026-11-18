import Modes from '../lib/modes';
import ArrowTool from '../helper/tools/arrow-tool';
import ArrowModeComponent from '../components/arrow-mode/arrow-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.ARROW,
    Component: ArrowModeComponent,
    displayName: 'ArrowMode',
    Tool: ArrowTool
});
