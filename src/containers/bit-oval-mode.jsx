import Modes from '../lib/modes';
import OvalTool from '../helper/bit-tools/oval-tool';
import OvalModeComponent from '../components/bit-oval-mode/bit-oval-mode.jsx';
import {makeBitmapShapeMode} from './make-mode-container.jsx';

export default makeBitmapShapeMode({
    mode: Modes.BIT_OVAL,
    Component: OvalModeComponent,
    displayName: 'BitOvalMode',
    Tool: OvalTool
});
