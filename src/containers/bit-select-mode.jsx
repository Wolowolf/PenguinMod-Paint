import paper from '@turbowarp/paper';
import PropTypes from 'prop-types';
import Modes from '../lib/modes';

import {clearFillGradient} from '../reducers/fill-style';
import {clearSelectedItems, setSelectedItems} from '../reducers/selected-items';
import {setCursor} from '../reducers/cursor';

import {getSelectedLeafItems} from '../helper/selection';
import BitSelectTool from '../helper/bit-tools/select-tool';
import SelectModeComponent from '../components/bit-select-mode/bit-select-mode.jsx';
import makeModeContainer from './make-mode-container.jsx';

export default makeModeContainer({
    mode: Modes.BIT_SELECT,
    Component: SelectModeComponent,
    displayName: 'BitSelectMode',
    propTypes: {
        clearGradient: PropTypes.func.isRequired,
        clearSelectedItems: PropTypes.func.isRequired,
        selectedItems: PropTypes.arrayOf(PropTypes.instanceOf(paper.Item)),
        setCursor: PropTypes.func.isRequired,
        setSelectedItems: PropTypes.func.isRequired
    },
    mapStateToProps: state => ({
        selectedItems: state.scratchPaint.selectedItems
    }),
    mapDispatchToProps: dispatch => ({
        clearGradient: () => {
            dispatch(clearFillGradient());
        },
        clearSelectedItems: () => {
            dispatch(clearSelectedItems());
        },
        setCursor: cursorType => {
            dispatch(setCursor(cursorType));
        },
        setSelectedItems: () => {
            dispatch(setSelectedItems(getSelectedLeafItems()));
        }
    }),
    updateTool: (tool, nextProps, props) => {
        if (nextProps.selectedItems !== props.selectedItems) {
            tool.onSelectionChanged(nextProps.selectedItems);
        }
    },
    createTool: props => {
        props.clearGradient();
        return new BitSelectTool(
            props.setSelectedItems,
            props.clearSelectedItems,
            props.setCursor,
            props.onUpdateImage
        );
    }
});
