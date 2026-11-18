import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {getSquareDimensions} from '../math';
import ShapeTool from './shape-tool';

/**
 * Tool for drawing triangles, polygons and stars.
 */
class TriangleTool extends ShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.TRIANGLE, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
        this.sideCount = 3;
        this.pointCount = 1;
    }
    setSideCount (sideCount) {
        this.sideCount = sideCount;
        this.updateExistingShape();
    }
    setPointCount (pointCount) {
        this.pointCount = pointCount;
        this.updateExistingShape();
    }
    calculateSegments () {
        const segs = [];

        for (let i = 0; i < this.sideCount; i++) {
            const angle = (i / this.sideCount) * Math.PI * 2;
            const angleIn = angle + ((1 / this.sideCount) * Math.PI);

            segs.push(new paper.Point(Math.sin(angle) * 50, -Math.cos(angle) * 50));
            if (this.pointCount !== 1) {
                segs.push(new paper.Point(
                    Math.sin(angleIn) * 50 * this.pointCount,
                    -Math.cos(angleIn) * 50 * this.pointCount
                ));
            }
        }

        return segs;
    }
    updateExistingShape () {
        // if editing a tri, update the curves
        const oldTri = paper.project.selectedItems[0];
        if (oldTri) {
            const path = new paper.Path({segments: this.calculateSegments(), closed: true});
            path.bounds = oldTri.bounds;
            oldTri.segments = path.segments;
            oldTri.closed = true;
            path.remove();
            this.setSelectedItems();
            this.onUpdateImage();
        }
    }
    drawShape (event) {
        if (this.item) {
            this.item.remove();
        }

        const bounds = new paper.Rectangle(event.downPoint, event.point);
        const squareDimensions = getSquareDimensions(event.downPoint, event.point);
        if (event.modifiers.shift) {
            bounds.size = squareDimensions.size.abs();
        }

        this.item = new paper.Path({segments: this.calculateSegments(), closed: true});
        this.item.bounds = bounds;
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

export default TriangleTool;
