import paper from '@turbowarp/paper';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import {MIXED} from '../helper/style-path';
import ColorStyleProptype from '../lib/color-style-proptype';
import GradientTypes from '../lib/gradient-types';

import {changeFillColor, clearFillGradient, DEFAULT_COLOR} from '../reducers/fill-style';
import {changeStrokeColor, clearStrokeGradient} from '../reducers/stroke-style';
import {changeMode} from '../reducers/modes';
import {clearSelectedItems, setSelectedItems} from '../reducers/selected-items';
import {setCursor} from '../reducers/cursor';
import {clearSelection, getSelectedLeafItems} from '../helper/selection';

/**
 * Makes the container of one paint tool button: it shows the button, switches to the tool's mode
 * when the button is pressed, creates the tool when the mode becomes active and removes it when
 * another mode is chosen. Each tool configures it:
 * @param {object} config The tool's configuration
 * @param {string} config.mode The tool's mode (Modes.*)
 * @param {React.Component} config.Component The tool's button
 * @param {string} config.displayName The container's name (for React tools)
 * @param {function} config.mapStateToProps state => the tool's own props from the Redux state
 * @param {function} config.mapDispatchToProps dispatch => the tool's own callbacks
 * @param {object} config.propTypes The prop types of those props
 * @param {function} config.createTool props => a new, configured tool (activated by the container)
 * @param {function} config.updateTool (tool, nextProps, props) => passes changed props to the active tool
 * @returns {React.Component} The connected container.
 */
const makeModeContainer = config => {
    class ModeContainer extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'activateTool',
                'deactivateTool'
            ]);
        }
        componentDidMount () {
            if (this.props.isModeActive) {
                this.activateTool();
            }
        }
        componentWillReceiveProps (nextProps) {
            if (this.tool) {
                config.updateTool(this.tool, nextProps, this.props);
            }

            if (nextProps.isModeActive && !this.props.isModeActive) {
                this.activateTool();
            } else if (!nextProps.isModeActive && this.props.isModeActive) {
                this.deactivateTool();
            }
        }
        shouldComponentUpdate (nextProps) {
            return nextProps.isModeActive !== this.props.isModeActive;
        }
        componentWillUnmount () {
            if (this.tool) {
                this.deactivateTool();
            }
        }
        activateTool () {
            this.tool = config.createTool(this.props);
            this.tool.activate();
        }
        deactivateTool () {
            this.tool.deactivateTool();
            this.tool.remove();
            this.tool = null;
        }
        render () {
            const ModeComponent = config.Component;
            return (
                <ModeComponent
                    isSelected={this.props.isModeActive}
                    onMouseDown={this.props.handleMouseDown}
                />
            );
        }
    }

    ModeContainer.displayName = config.displayName;
    ModeContainer.propTypes = {
        handleMouseDown: PropTypes.func.isRequired,
        isModeActive: PropTypes.bool.isRequired,
        onUpdateImage: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
        ...config.propTypes
    };

    const mapStateToProps = state => ({
        isModeActive: state.scratchPaint.mode === config.mode,
        ...config.mapStateToProps(state)
    });
    const mapDispatchToProps = dispatch => ({
        handleMouseDown: () => {
            dispatch(changeMode(config.mode));
        },
        ...config.mapDispatchToProps(dispatch)
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(ModeContainer);
};

/**
 * Make sure that at least one of fill/stroke is set, and that MIXED is not one of the colors.
 * If fill and stroke color are both missing, set fill to default and stroke to transparent.
 * If exactly one of fill or stroke color is set, set the other one to transparent.
 * @param {object} props The vector shape container's props.
 */
const validateColorState = props => {
    const {strokeWidth} = props.colorState;
    const fillColor1 = props.colorState.fillColor.primary;
    let fillColor2 = props.colorState.fillColor.secondary;
    let fillGradient = props.colorState.fillColor.gradientType;
    const strokeColor1 = props.colorState.strokeColor.primary;
    let strokeColor2 = props.colorState.strokeColor.secondary;
    let strokeGradient = props.colorState.strokeColor.gradientType;

    if (fillColor2 === MIXED) {
        props.clearFillGradient();
        fillColor2 = null;
        fillGradient = GradientTypes.SOLID;
    }
    if (strokeColor2 === MIXED) {
        props.clearStrokeGradient();
        strokeColor2 = null;
        strokeGradient = GradientTypes.SOLID;
    }

    const fillColorMissing = fillColor1 === MIXED ||
        (fillGradient === GradientTypes.SOLID && fillColor1 === null) ||
        (fillGradient !== GradientTypes.SOLID && fillColor1 === null && fillColor2 === null);
    const strokeColorMissing = strokeColor1 === MIXED ||
        strokeWidth === null ||
        strokeWidth === 0 ||
        (strokeGradient === GradientTypes.SOLID && strokeColor1 === null) ||
        (strokeGradient !== GradientTypes.SOLID && strokeColor1 === null && strokeColor2 === null);

    if (fillColorMissing && strokeColorMissing) {
        props.onChangeFillColor(DEFAULT_COLOR);
        props.clearFillGradient();
        props.onChangeStrokeColor(null);
        props.clearStrokeGradient();
    } else if (fillColorMissing && !strokeColorMissing) {
        props.onChangeFillColor(null);
        props.clearFillGradient();
    } else if (!fillColorMissing && strokeColorMissing) {
        props.onChangeStrokeColor(null);
        props.clearStrokeGradient();
    }
};

/**
 * Makes the container of a vector shape tool (rectangle, oval, triangle, ...).
 * @param {object} config The tool's configuration
 * @param {string} config.mode The tool's mode (Modes.*)
 * @param {React.Component} config.Component The tool's button
 * @param {string} config.displayName The container's name
 * @param {function} config.Tool The tool class (helper/tools/*-tool.js)
 * @param {string} [config.toolMode] Passed to the tool as its mode, for a tool class shared by two buttons
 * @param {Array<object>} [config.options] The tool's own settings, each
 *     {prop, propType, fromState: state => value, setter: tool method name,
 *      isMissing: value => bool, fallback: value set when missing, action: value => Redux action}
 * @returns {React.Component} The connected container.
 */
const makeVectorShapeMode = ({mode, Component, displayName, Tool, toolMode, options = []}) => {
    const dispatchName = option => `onChange_${option.prop}`;
    const optionPropTypes = {};
    for (const option of options) {
        optionPropTypes[option.prop] = option.propType;
        optionPropTypes[dispatchName(option)] = PropTypes.func.isRequired;
    }
    return makeModeContainer({
        mode,
        Component,
        displayName,
        propTypes: {
            clearFillGradient: PropTypes.func.isRequired,
            clearStrokeGradient: PropTypes.func.isRequired,
            clearSelectedItems: PropTypes.func.isRequired,
            colorState: PropTypes.shape({
                fillColor: ColorStyleProptype,
                strokeColor: ColorStyleProptype,
                strokeWidth: PropTypes.number
            }).isRequired,
            onChangeFillColor: PropTypes.func.isRequired,
            onChangeStrokeColor: PropTypes.func.isRequired,
            selectedItems: PropTypes.arrayOf(PropTypes.instanceOf(paper.Item)),
            setCursor: PropTypes.func.isRequired,
            setSelectedItems: PropTypes.func.isRequired,
            ...optionPropTypes
        },
        mapStateToProps: state => {
            const props = {
                colorState: state.scratchPaint.color,
                selectedItems: state.scratchPaint.selectedItems
            };
            for (const option of options) props[option.prop] = option.fromState(state);
            return props;
        },
        mapDispatchToProps: dispatch => {
            const props = {
                clearSelectedItems: () => {
                    dispatch(clearSelectedItems());
                },
                clearFillGradient: () => {
                    dispatch(clearFillGradient());
                },
                clearStrokeGradient: () => {
                    dispatch(clearStrokeGradient());
                },
                setSelectedItems: () => {
                    dispatch(setSelectedItems(getSelectedLeafItems(), false /* bitmapMode */));
                },
                setCursor: cursorString => {
                    dispatch(setCursor(cursorString));
                },
                onChangeFillColor: fillColor => {
                    dispatch(changeFillColor(fillColor));
                },
                onChangeStrokeColor: strokeColor => {
                    dispatch(changeStrokeColor(strokeColor));
                }
            };
            for (const option of options) {
                props[dispatchName(option)] = value => {
                    dispatch(option.action(value));
                };
            }
            return props;
        },
        updateTool: (tool, nextProps, props) => {
            if (nextProps.colorState !== props.colorState) {
                tool.setColorState(nextProps.colorState);
            }
            if (nextProps.selectedItems !== props.selectedItems) {
                tool.onSelectionChanged(nextProps.selectedItems);
            }
            for (const option of options) {
                if (nextProps[option.prop] !== props[option.prop]) {
                    tool[option.setter](nextProps[option.prop]);
                }
            }
        },
        createTool: props => {
            clearSelection(props.clearSelectedItems);
            validateColorState(props);
            for (const option of options) {
                if (option.isMissing(props[option.prop])) {
                    props[dispatchName(option)](option.fallback);
                }
            }

            const tool = new Tool(
                props.setSelectedItems,
                props.clearSelectedItems,
                props.setCursor,
                props.onUpdateImage,
                toolMode
            );
            for (const option of options) tool[option.setter](props[option.prop]);
            tool.setColorState(props.colorState);
            return tool;
        }
    });
};

/**
 * Makes the container of a bitmap shape tool (rectangle, oval).
 * @param {object} config The tool's configuration
 * @param {string} config.mode The tool's mode (Modes.*)
 * @param {React.Component} config.Component The tool's button
 * @param {string} config.displayName The container's name
 * @param {function} config.Tool The tool class (helper/bit-tools/*-tool.js)
 * @returns {React.Component} The connected container.
 */
const makeBitmapShapeMode = ({mode, Component, displayName, Tool}) => makeModeContainer({
    mode,
    Component,
    displayName,
    propTypes: {
        clearSelectedItems: PropTypes.func.isRequired,
        color: ColorStyleProptype,
        filled: PropTypes.bool,
        onChangeFillColor: PropTypes.func.isRequired,
        selectedItems: PropTypes.arrayOf(PropTypes.instanceOf(paper.Item)),
        setCursor: PropTypes.func.isRequired,
        setSelectedItems: PropTypes.func.isRequired,
        thickness: PropTypes.number.isRequired,
        zoom: PropTypes.number.isRequired
    },
    mapStateToProps: state => ({
        color: state.scratchPaint.color.fillColor,
        filled: state.scratchPaint.fillBitmapShapes,
        selectedItems: state.scratchPaint.selectedItems,
        thickness: state.scratchPaint.bitBrushSize,
        zoom: state.scratchPaint.viewBounds.scaling.x
    }),
    mapDispatchToProps: dispatch => ({
        clearSelectedItems: () => {
            dispatch(clearSelectedItems());
        },
        setCursor: cursorString => {
            dispatch(setCursor(cursorString));
        },
        setSelectedItems: () => {
            dispatch(setSelectedItems(getSelectedLeafItems(), true /* bitmapMode */));
        },
        onChangeFillColor: fillColor => {
            dispatch(changeFillColor(fillColor));
        }
    }),
    updateTool: (tool, nextProps, props) => {
        if (nextProps.color !== props.color) {
            tool.setColor(nextProps.color);
        }
        if (nextProps.selectedItems !== props.selectedItems) {
            tool.onSelectionChanged(nextProps.selectedItems);
        }
        if (nextProps.filled !== props.filled) {
            tool.setFilled(nextProps.filled);
        }
        if (nextProps.thickness !== props.thickness ||
                nextProps.zoom !== props.zoom) {
            tool.setThickness(nextProps.thickness);
        }
    },
    createTool: props => {
        clearSelection(props.clearSelectedItems);
        // Force the default brush color if fill is MIXED or transparent
        const fillColorPresent = props.color.primary !== MIXED && props.color.primary !== null;
        if (!fillColorPresent) {
            props.onChangeFillColor(DEFAULT_COLOR);
        }
        const tool = new Tool(
            props.setSelectedItems,
            props.clearSelectedItems,
            props.setCursor,
            props.onUpdateImage
        );
        tool.setColor(props.color);
        tool.setFilled(props.filled);
        tool.setThickness(props.thickness);
        return tool;
    }
});

export {
    makeModeContainer as default,
    makeVectorShapeMode,
    makeBitmapShapeMode
};
