import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {getSquareDimensions} from '../math';
import ShapeTool from './shape-tool';

/**
 * Tool for drawing ovals.
 */
class OvalTool extends ShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.OVAL, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
    }
    onStartShape (event) {
        this.item = new paper.Shape.Ellipse({
            point: event.downPoint,
            size: 0
        });
        styleShape(this.item, this.colorState);
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

        styleShape(this.item, this.colorState);
    }
    isTiny () {
        return Math.abs(this.item.size.width * this.item.size.height) < ShapeTool.TOLERANCE / paper.view.zoom;
    }
    finishShape () {
        const ovalPath = this.item.toPath(true /* insert */);
        this.item.remove();
        return ovalPath;
    }
}

export default OvalTool;
