import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import ShapeTool from './shape-tool';

const constructArrowPath = (left, lineWidth, lineLength, headWidth, headLength) => {
    if (typeof lineWidth !== "number") {
        lineWidth = 24;
    }
    if (typeof lineLength !== "number") {
        lineLength = 60;
    }
    if (typeof headWidth !== "number") {
        headWidth = 60;
    }
    if (typeof headLength !== "number") {
        headLength = 60;
    }

    if (left) {
        return `M 0 ${lineWidth} H ${0 - lineLength} V ${headWidth} L ${0 - (lineLength + headLength)} 0 L ${0 - lineLength} ${0 - headWidth} V ${0 - lineWidth} H 0 Z`;
    }
    return `M 0 ${0 - lineWidth} H ${lineLength} V ${0 - headWidth} L ${lineLength + headLength} 0 L ${lineLength} ${headWidth} V ${lineWidth} H 0 Z`;
};

/**
 * Tool for drawing arrows.
 */
class ArrowTool extends ShapeTool {
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super(Modes.ARROW, setSelectedItems, clearSelectedItems, setCursor, onUpdateImage);
        this.resetArrowState();
    }
    resetArrowState () {
        this.arrowPathState = {
            length: 60,
            angle: 0,
            width: 24,
            head: {
                length: 60,
                width: 60
            }
        };
        this.canModifyState = true;
        this.arrowPathLocked = false;
        this.arrowPathLockedState = {};
        this.arrowPathLockedPositionSet = false;
        this.arrowPathLockedPosition = {x: 0, y: 0};
    }
    onPress () {
        this.resetArrowState();
    }
    radToDeg (rad) {
        return rad * 180 / Math.PI;
    }
    calculateDirection (x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const direction = 90 - this.radToDeg(Math.atan2(dy, dx));
        return direction;
    }
    calculateDistance (x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt((dx * dx) + (dy * dy));
    }
    drawShape (event) {
        if (this.item) {
            this.item.remove();
        }

        // set some stuff for locking if alt is pressed
        // alt allows other pieces of the arrow to be modified
        const pathOptions = this.arrowPathState;
        if (event.modifiers.alt) {
            this.canModifyState = false;
            this.arrowPathLocked = true;
            if (!this.arrowPathLockedPositionSet) {
                this.arrowPathLockedPosition = {
                    x: event.point.x,
                    y: event.point.y
                };
            }
            this.arrowPathLockedPositionSet = true;
        } else {
            this.canModifyState = true;
            this.arrowPathLocked = false;
            this.arrowPathLockedPositionSet = false;
            this.arrowPathLockedPosition = { x: 0, y: 0 };
        }

        if (this.canModifyState) {
            const x1 = event.downPoint.x;
            const y1 = event.downPoint.y;

            const x2 = event.point.x;
            const y2 = event.point.y;

            pathOptions.length = this.calculateDistance(x1, y1, x2, y2);
        }

        if (this.canModifyState) {
            const x1 = event.downPoint.x;
            const y1 = event.downPoint.y;

            const x2 = event.point.x;
            const y2 = event.point.y;

            pathOptions.angle = 90 - this.calculateDirection(x1, y1, x2, y2);
            if (event.modifiers.shift) {
                pathOptions.angle = Math.round((pathOptions.angle / 360) * 8) * 45;
            }
        }

        // set extra modifications
        if (event.modifiers.alt) {
            if (event.modifiers.shift) {
                // edit arrow point
                const x1 = this.arrowPathLockedPosition.x;
                const y1 = this.arrowPathLockedPosition.y;

                const x2 = event.point.x;
                const y2 = event.point.y;

                pathOptions.head.length = this.calculateDistance(x1, y1, x2, y1);
                pathOptions.head.width = this.calculateDistance(x1, y1, x1, y2);
            } else {
                // edit arrow width
                const x1 = this.arrowPathLockedPosition.x;
                const y1 = this.arrowPathLockedPosition.y;

                const x2 = event.point.x;
                const y2 = event.point.y;

                pathOptions.width = this.calculateDistance(x1, y1, x2, y2);
            }
        }

        this.item = new paper.Path(constructArrowPath(
            event.modifiers.control,
            pathOptions.width, pathOptions.length,
            pathOptions.head.width,
            pathOptions.head.length
        ));

        // create new position
        if ((!this.arrowPathLocked) && this.arrowPathLockedState) {
            this.item.position = event.downPoint;

            const dimensions = new paper.Point(event.point.getDistance(event.downPoint),0);
            this.item.position = event.downPoint.add(dimensions.multiply(0.5));
        } else if (this.arrowPathLocked) {
            this.item.position = this.arrowPathLockedState;
        }

        if (this.canModifyState) {
            this.item.rotate(pathOptions.angle, event.downPoint);
        }

        this.arrowPathLockedState = {
            x: this.item.position.x,
            y: this.item.position.y,
        };

        styleShape(this.item, this.colorState);
    }
    onRelease () {
        this.arrowPathLockedPositionSet = false;
        this.arrowPathLockedPosition = {x: 0, y: 0};
    }
}

export default ArrowTool;
