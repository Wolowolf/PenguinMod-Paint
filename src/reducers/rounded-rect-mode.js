import {makeCornerSizeReducer} from './rect-mode';

const CHANGE_ROUNDED_CORNER_SIZE = 'scratch-paint/rounded-rect-mode/CHANGE_ROUNDED_CORNER_SIZE';
const reducer = makeCornerSizeReducer(CHANGE_ROUNDED_CORNER_SIZE);

// Action creators ==================================
const changeRoundedRectCornerSize = function (roundedCornerSize) {
    return {
        type: CHANGE_ROUNDED_CORNER_SIZE,
        roundedCornerSize: roundedCornerSize
    };
};

export {
    reducer as default,
    changeRoundedRectCornerSize
};
