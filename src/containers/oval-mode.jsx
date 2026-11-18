import Modes from '../lib/modes';
import OvalTool from '../helper/tools/oval-tool';
import OvalModeComponent from '../components/oval-mode/oval-mode.jsx';
import {makeVectorShapeMode} from './make-mode-container.jsx';

export default makeVectorShapeMode({
    mode: Modes.OVAL,
    Component: OvalModeComponent,
    displayName: 'OvalMode',
    Tool: OvalTool
});
