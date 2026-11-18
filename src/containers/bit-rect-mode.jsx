import Modes from '../lib/modes';
import RectTool from '../helper/bit-tools/rect-tool';
import RectModeComponent from '../components/bit-rect-mode/bit-rect-mode.jsx';
import {makeBitmapShapeMode} from './make-mode-container.jsx';

export default makeBitmapShapeMode({
    mode: Modes.BIT_RECT,
    Component: RectModeComponent,
    displayName: 'BitRectMode',
    Tool: RectTool
});
