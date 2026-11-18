import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {getSquareDimensions} from '../math';
import ShapeTool from './shape-tool';

/**
 * Tool for drawing rectangles, with or without rounded corners. The Rectangle and the
 * Rounded Rectangle buttons both use it, each with its own mode.
 */
class RectTool extends ShapeTool {
    /**
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {function} setCursor Callback to set the visible mouse cursor
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     * @param {string} [mode] Modes.RECT (default) or Modes.ROUNDED_RECT
     */
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage, mode = Modes.RECT) {
        super(mode, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
        this.roundedCornerSize = 0;
    }
    setRoundedCornerSize (newCornerSize) {
        this.roundedCornerSize = newCornerSize;

        // if editing a rect, update the curves
        const oldRect = paper.project.selectedItems[0];
        if (oldRect) {
            const rounded = new paper.Path.Rectangle(oldRect.bounds, newCornerSize);
            oldRect.segments = rounded.segments;
            oldRect.closed = true;
            rounded.remove();
            this.setSelectedItems();
            this.onUpdateImage();
        }
    }
    drawShape (event) {
        if (this.item) {
            this.item.remove();
        }

        const rect = new paper.Rectangle(event.downPoint, event.point);
        const squareDimensions = getSquareDimensions(event.downPoint, event.point);
        if (event.modifiers.shift) {
            rect.size = squareDimensions.size.abs();
        }

        this.item = new paper.Path.Rectangle(rect, this.roundedCornerSize === 0 ? null : this.roundedCornerSize);
        if (event.modifiers.alt) {
            this.item.position = event.downPoint;
        } else if (event.modifiers.shift) {
            this.item.position = squareDimensions.position;
        } else {
            const dimensions = event.point.subtract(event.downPoint);
            this.item.position = event.downPoint.add(dimensions.multiply(0.5));
        }

        styleShape(this.item, this.colorState);
    }
}

export default RectTool;
