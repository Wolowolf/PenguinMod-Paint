import {dispatchColorChange} from '../lib/make-color-style-reducer';
import PropTypes from 'prop-types';
import Modes from '../lib/modes';
import GradientTypes from '../lib/gradient-types';

import FillModeComponent from '../components/bit-fill-mode/bit-fill-mode.jsx';

import {changeFillColor, changeFillColor2, DEFAULT_COLOR} from '../reducers/fill-style';
import {clearSelectedItems} from '../reducers/selected-items';
import {changeGradientType} from '../reducers/fill-mode-gradient-type';
import {clearSelection} from '../helper/selection';
import FillTool from '../helper/bit-tools/fill-tool';
import {generateSecondaryColor, MIXED} from '../helper/style-path';
import makeModeContainer from './make-mode-container.jsx';

export default makeModeContainer({
    mode: Modes.BIT_FILL,
    Component: FillModeComponent,
    displayName: 'BitFillMode',
    propTypes: {
        changeGradientType: PropTypes.func.isRequired,
        clearSelectedItems: PropTypes.func.isRequired,
        color: PropTypes.string,
        color2: PropTypes.string,
        styleGradientType: PropTypes.oneOf(Object.keys(GradientTypes)).isRequired,
        fillModeGradientType: PropTypes.oneOf(Object.keys(GradientTypes)),
        onChangeFillColor: PropTypes.func.isRequired
    },
    mapStateToProps: state => ({
        fillModeGradientType: state.scratchPaint.fillMode.gradientType, // Last user-selected gradient type
        color: state.scratchPaint.color.fillColor.primary,
        color2: state.scratchPaint.color.fillColor.secondary,
        styleGradientType: state.scratchPaint.color.fillColor.gradientType
    }),
    mapDispatchToProps: dispatch => ({
        clearSelectedItems: () => {
            dispatch(clearSelectedItems());
        },
        changeGradientType: gradientType => {
            dispatch(changeGradientType(gradientType));
        },
        onChangeFillColor: (fillColor, index) =>
            dispatchColorChange(dispatch, changeFillColor, changeFillColor2, fillColor, index)
    }),
    updateTool: (tool, nextProps, props) => {
        if (nextProps.color !== props.color) {
            tool.setColor(nextProps.color);
        }
        if (nextProps.color2 !== props.color2) {
            tool.setColor2(nextProps.color2);
        }
        if (nextProps.fillModeGradientType !== props.fillModeGradientType) {
            tool.setGradientType(nextProps.fillModeGradientType);
        }
    },
    createTool: props => {
        clearSelection(props.clearSelectedItems);

        // Force the default brush color if fill is MIXED or transparent
        let color = props.color;
        if (props.color === MIXED) {
            color = DEFAULT_COLOR;
            props.onChangeFillColor(DEFAULT_COLOR, 0);
        }
        const gradientType = props.fillModeGradientType ?
            props.fillModeGradientType : props.styleGradientType;
        let color2 = props.color2;
        if (gradientType !== props.styleGradientType) {
            if (props.styleGradientType === GradientTypes.SOLID) {
                color2 = generateSecondaryColor(color);
                props.onChangeFillColor(color2, 1);
            }
            props.changeGradientType(gradientType);
        }
        if (props.color2 === MIXED) {
            color2 = generateSecondaryColor();
            props.onChangeFillColor(color2, 1);
        }
        const tool = new FillTool(props.onUpdateImage);
        tool.setColor(color);
        tool.setColor2(color2);
        tool.setGradientType(gradientType);
        return tool;
    }
});
