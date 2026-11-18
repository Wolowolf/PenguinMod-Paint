import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {commitOvalToBitmap} from '../bitmap';
import {getSquareDimensions} from '../math';
import BitShapeTool from './bit-shape-tool';

/**
 * Tool for drawing ovals.
 */
class OvalTool extends BitShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.BIT_OVAL, 'ellipse', commitOvalToBitmap,
            setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
    }
    onStartShape (event) {
        super.onStartShape(event);
        this.item = new paper.Shape.Ellipse({
            point: event.downPoint,
            size: 0,
            strokeScaling: false
        });
        this.styleItem();
        this.item.data = {zoomLevel: paper.view.zoom};
    }
    drawShape (event) {
        const downPoint = new paper.Point(event.downPoint.x, event.downPoint.y);
        const point = new paper.Point(event.point.x, event.point.y);
        const squareDimensions = getSquareDimensions(event.downPoint, event.point);
        if (event.modifiers.shift) {
            this.item.size = squareDimensions.size.abs();
        } else {
            this.item.size = downPoint.subtract(point);
        }

        if (event.modifiers.alt) {
            this.item.position = downPoint;
        } else if (event.modifiers.shift) {
            this.item.position = squareDimensions.position;
        } else {
            this.item.position = downPoint.subtract(this.item.size.multiply(0.5));
        }
        this.styleItem();
    }
}

export default OvalTool;
