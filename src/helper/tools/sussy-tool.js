import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {selectablePaths} from '../selectable-shapes';
import ShapeTool from './shape-tool';

/**
 * Tool for drawing the ready-made shapes of the Shapes button (selectable-shapes.js).
 */
class SussyTool extends ShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.SUSSY, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
        this.shape = 'smile';
    }
    setShape (shape) {
        // NOTE: Purposefully not doing live updates here since users probably dont want that for this tool.
        this.shape = shape;
    }
    drawShape (event) {
        if (this.item) this.item.remove();

        const rawBounds = new paper.Rectangle(event.downPoint, event.point);
        const pathData = selectablePaths[this.shape];
        this.item = new paper.CompoundPath(pathData);

        const shapeBounds = this.item.bounds.clone();
        const shapeRatio = shapeBounds.width / shapeBounds.height;
        let finalBounds = rawBounds;

        if (event.modifiers.shift) {
            const {width, height} = rawBounds.size;
            let w0 = width;
            let h0 = height;

            // adjust to keep aspect ratio
            if (width / height > shapeRatio) w0 = Math.sign(width) * Math.abs(height * shapeRatio);
            else h0 = Math.sign(height) * Math.abs(width / shapeRatio);

            const opposite = event.downPoint.add(new paper.Point(w0, h0));
            finalBounds = new paper.Rectangle(
                new paper.Point(
                    Math.min(event.downPoint.x, opposite.x),
                    Math.min(event.downPoint.y, opposite.y)
                ),
                new paper.Point(
                    Math.max(event.downPoint.x, opposite.x),
                    Math.max(event.downPoint.y, opposite.y)
                )
            );
        }

        this.item.bounds = finalBounds;
        if (event.modifiers.alt) this.item.position = event.downPoint;
        else this.item.position = this.item.bounds.center;

        styleShape(this.item, this.colorState);
    }
    isTiny () {
        return Math.abs(this.item.area) < ShapeTool.TOLERANCE / paper.view.zoom;
    }
}

export default SussyTool;
