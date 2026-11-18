import paper from '@turbowarp/paper';
import {clearSelection} from '../selection';
import BoundingBoxTool from '../selection-tools/bounding-box-tool';
import NudgeTool from '../selection-tools/nudge-tool';

/**
 * Shared base of every drag-to-draw shape tool (vector and bitmap): a drag on empty canvas draws
 * a new shape, a drag on the selected shape moves or scales it with the bounding box. Each tool
 * extends it and only says how its shape is drawn (drawShape) and finished; the bitmap tools add
 * their own layer on top (bit-tools/bit-shape-tool.js).
 */
class ShapeTool extends paper.Tool {
    static get TOLERANCE () {
        return 2;
    }
    /**
     * @param {string} mode The paint mode this tool belongs to (Modes.*)
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {function} setCursor Callback to set the visible mouse cursor
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (mode, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super();
        this.setSelectedItems = setSelectedItems;
        this.clearSelectedItems = clearSelectedItems;
        this.onUpdateImage = onUpdateImage;
        this.boundingBoxTool = new BoundingBoxTool(
            mode,
            setSelectedItems,
            clearSelectedItems,
            setCursor,
            onUpdateImage
        );
        const nudgeTool = new NudgeTool(mode, this.boundingBoxTool, onUpdateImage);

        // We have to set these functions instead of just declaring them because
        // paper.js tools hook up the listeners in the setter functions.
        this.onMouseDown = this.handleMouseDown;
        this.onMouseMove = this.handleMouseMove;
        this.onMouseDrag = this.handleMouseDrag;
        this.onMouseUp = this.handleMouseUp;
        this.onKeyUp = nudgeTool.onKeyUp;
        this.onKeyDown = nudgeTool.onKeyDown;

        /** The shape being drawn (vector) or the active, still editable shape (bitmap). */
        this.item = null;
        this.colorState = null;
        this.isBoundingBoxMode = null;
        this.active = false;
        /** Vector tools may hit segments and curves of the selected shape; bitmap shapes are whole. */
        this.hitCurves = true;
    }
    getHitOptions () {
        return {
            segments: this.hitCurves,
            stroke: true,
            curves: this.hitCurves,
            fill: true,
            guide: false,
            match: hitResult =>
                (hitResult.item.data && (hitResult.item.data.isScaleHandle || hitResult.item.data.isRotHandle)) ||
                hitResult.item.selected, // Allow hits on bounding box and selected only
            tolerance: ShapeTool.TOLERANCE / paper.view.zoom
        };
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
    }
    setColorState (colorState) {
        this.colorState = colorState;
    }
    /** Called on every first-button press, before the bounding box is tried. */
    onPress () {}
    /**
     * Called when a press starts a new shape (it did not hit the bounding box).
     * @param {paper.ToolEvent} event The mouse down event.
     */
    onStartShape () {} // eslint-disable-line no-unused-vars
    /**
     * Draws this.item for the current drag. Each tool implements it.
     * @param {paper.ToolEvent} event The mouse drag event.
     */
    drawShape () {} // eslint-disable-line no-unused-vars
    /** Called on release of a shape drag, before the shape is kept or dropped. */
    onRelease () {}
    /** @returns {boolean} true if this.item is too small to have been drawn on purpose. */
    isTiny () {
        return this.item.area < ShapeTool.TOLERANCE / paper.view.zoom;
    }
    /** @returns {paper.Item} The finished shape to keep (a tool may replace this.item, e.g. by a path). */
    finishShape () {
        return this.item;
    }
    /** Keeps a drawn shape: selects it and reports the change. */
    keepShape () {
        const shape = this.finishShape();
        this.item = null;
        shape.selected = true;
        this.setSelectedItems();
        this.onUpdateImage();
    }
    /** Called at the end of a shape release, after the shape was kept or dropped. */
    onReleaseEnd () {}
    handleMouseDown (event) {
        if (event.event.button > 0) return; // only first mouse button
        this.active = true;
        this.onPress();

        if (this.boundingBoxTool.onMouseDown(
            event, false /* clone */, false /* multiselect */, false /* doubleClicked */, this.getHitOptions())) {
            this.isBoundingBoxMode = true;
        } else {
            this.isBoundingBoxMode = false;
            clearSelection(this.clearSelectedItems);
            this.onStartShape(event);
        }
    }
    handleMouseDrag (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseDrag(event);
            return;
        }

        this.drawShape(event);
    }
    handleMouseMove (event) {
        this.boundingBoxTool.onMouseMove(event, this.getHitOptions());
    }
    handleMouseUp (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseUp(event);
            this.isBoundingBoxMode = null;
            return;
        }

        this.onRelease();
        if (this.item) {
            if (this.isTiny()) {
                // Tiny shape created unintentionally?
                this.item.remove();
                this.item = null;
            } else {
                this.keepShape();
            }
        }
        this.active = false;
        this.onReleaseEnd();
    }
    deactivateTool () {
        this.boundingBoxTool.deactivateTool();
    }
}

export default ShapeTool;
