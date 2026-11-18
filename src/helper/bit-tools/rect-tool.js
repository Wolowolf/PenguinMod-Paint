import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {commitRectToBitmap} from '../bitmap';
import {getSquareDimensions} from '../math';
import BitShapeTool from './bit-shape-tool';

/**
 * Tool for drawing rects.
 */
class RectTool extends BitShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.BIT_RECT, 'rectangle', commitRectToBitmap,
            setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
    }
    drawShape (event) {
        const dimensions = event.point.subtract(event.downPoint);
        const baseRect = new paper.Rectangle(event.downPoint, event.point);
        const squareDimensions = getSquareDimensions(event.downPoint, event.point);
        if (event.modifiers.shift) {
            baseRect.size = squareDimensions.size.abs();
        }

        if (this.item) this.item.remove();
        this.item = new paper.Shape.Rectangle(baseRect);
        this.item.strokeJoin = 'round';
        this.item.strokeScaling = false;
        this.item.data = {zoomLevel: paper.view.zoom};
        this.styleItem();

        if (event.modifiers.alt) {
            this.item.position = event.downPoint;
        } else if (event.modifiers.shift) {
            this.item.position = squareDimensions.position;
        } else {
            this.item.position = event.downPoint.add(dimensions.multiply(.5));
        }
    }
}

export default RectTool;
