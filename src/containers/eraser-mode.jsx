import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Modes from '../lib/modes';
import BlobMode from './blob-mode';
import {changeBrushSize} from '../reducers/eraser-mode';
import {clearSelectedItems} from '../reducers/selected-items';
import EraserModeComponent from '../components/eraser-mode/eraser-mode.jsx';
import {changeMode} from '../reducers/modes';

class EraserMode extends BlobMode {
    componentDidMount () {
        if (this.props.isEraserModeActive) {
            this.activateTool();
        }
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.isEraserModeActive && !this.props.isEraserModeActive) {
            this.activateTool();
        } else if (!nextProps.isEraserModeActive && this.props.isEraserModeActive) {
            this.deactivateTool();
        } else if (nextProps.isEraserModeActive && this.props.isEraserModeActive) {
            this.props.eraserModeState.brushType = this.props.brushModeState?.brushType;
            this.blob.setOptions({
                isEraser: true,
                ...nextProps.eraserModeState
            });
        }
    }
    shouldComponentUpdate (nextProps) {
        return nextProps.isEraserModeActive !== this.props.isEraserModeActive;
    }
    activateTool () {
        this.props.eraserModeState.brushType = this.props.brushModeState?.brushType;
        this.blob.activateTool({isEraser: true, ...this.props.eraserModeState});
    }
    render () {
        return (
            <EraserModeComponent
                isSelected={this.props.isEraserModeActive}
                onMouseDown={this.props.handleMouseDown}
            />
        );
    }
}

EraserMode.propTypes = {
    clearSelectedItems: PropTypes.func.isRequired,
    eraserModeState: PropTypes.shape({
        brushSize: PropTypes.number.isRequired,
        simplifySize: PropTypes.number,
        brushType: "CIRCLE"
    }),
    /* used to extract brush type */
    brushModeState: PropTypes.shape({
        brushSize: PropTypes.number.isRequired,
        simplifySize: PropTypes.number,
        brushType: "CIRCLE"
    }),
    handleMouseDown: PropTypes.func.isRequired,
    isEraserModeActive: PropTypes.bool.isRequired,
    onUpdateImage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    eraserModeState: state.scratchPaint.eraserMode,
    brushModeState: state.scratchPaint.brushMode,
    isEraserModeActive: state.scratchPaint.mode === Modes.ERASER
});
const mapDispatchToProps = dispatch => ({
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    changeBrushSize: brushSize => {
        dispatch(changeBrushSize(brushSize));
    },
    handleMouseDown: () => {
        dispatch(changeMode(Modes.ERASER));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EraserMode);
