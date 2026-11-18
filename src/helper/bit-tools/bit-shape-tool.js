import paper from '@turbowarp/paper';
import {styleShape} from '../style-path';
import {getRaster} from '../layer';
import ShapeTool from '../tools/shape-tool';

/**
 * Shared base of the bitmap shape tools (rectangle, oval). The drawn shape stays an editable
 * paper Shape (this.item) while it is selected, and is painted into the bitmap when it gets
 * deselected, when a new shape starts, or when the tool is switched off.
 */
class BitShapeTool extends ShapeTool {
    /**
     * @param {string} mode The paint mode this tool belongs to (Modes.*)
     * @param {string} shapeType The paper Shape type this tool draws ('rectangle', 'ellipse')
     * @param {function} commitToBitmap Paints a Shape of that type into a raster (bitmap.js)
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {function} setCursor Callback to set the visible mouse cursor
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (mode, shapeType, commitToBitmap, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(mode, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
        this.shapeType = shapeType;
        this.commitToBitmap = commitToBitmap;
        this.color = null;
        this.hitCurves = false;
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
        if ((!this.item || !this.item.isInserted()) &&
                selectedItems && selectedItems.length === 1 && selectedItems[0].shape === this.shapeType) {
            // Infer that an undo occurred and get back the active shape
            this.item = selectedItems[0];
            if (this.item.data.zoomLevel !== paper.view.zoom) {
                this.item.strokeWidth = this.item.strokeWidth / this.item.data.zoomLevel * paper.view.zoom;
                this.item.data.zoomLevel = paper.view.zoom;
                this.thickness = this.item.strokeWidth;
            }
            this.filled = this.item.strokeWidth === 0;
            // The color comes from the color state reducers, which update it on every selection change.
        } else if (this.item && this.item.isInserted() && !this.item.selected) {
            // Shape got deselected
            this.commitShape();
        }
    }
    styleItem () {
        styleShape(this.item, {
            fillColor: this.filled ? this.color : null,
            strokeColor: this.filled ? null : this.color,
            strokeWidth: this.filled ? 0 : this.thickness
        });
    }
    setColor (color) {
        this.color = color;
        if (this.item) this.styleItem();
    }
    setFilled (filled) {
        if (this.filled === filled) return;
        this.filled = filled;
        if (this.item && this.item.isInserted()) {
            this.styleItem();
            this.onUpdateImage();
        }
    }
    setThickness (thickness) {
        if (this.thickness === thickness * paper.view.zoom) return;
        this.thickness = thickness * paper.view.zoom;
        if (this.item && this.item.isInserted() && !this.filled) {
            this.item.strokeWidth = this.thickness;
        }
        if (this.item && this.item.isInserted()) {
            this.item.data.zoomLevel = paper.view.zoom;
            this.onUpdateImage();
        }
    }
    onStartShape () {
        this.commitShape();
    }
    isTiny () {
        return Math.abs(this.item.size.width * this.item.size.height) < ShapeTool.TOLERANCE / paper.view.zoom;
    }
    keepShape () {
        // Hit testing does not work correctly unless the width and height are positive
        this.item.size = new paper.Point(Math.abs(this.item.size.width), Math.abs(this.item.size.height));
        this.item.selected = true;
        this.styleItem();
        this.setSelectedItems();
    }
    onReleaseEnd () {
        this.onUpdateImage();
    }
    commitShape () {
        if (!this.item || !this.item.isInserted()) return;

        this.commitToBitmap(this.item, getRaster());
        this.item.remove();
        this.item = null;
    }
    deactivateTool () {
        this.commitShape();
        super.deactivateTool();
    }
}

export default BitShapeTool;
