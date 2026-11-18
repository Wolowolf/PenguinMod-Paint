import log from '../log/log';

const CHANGE_ROUNDED_CORNER_SIZE = 'scratch-paint/rect-mode/CHANGE_ROUNDED_CORNER_SIZE';
const initialState = {roundedCornerSize: 0};

/**
 * Makes a reducer for a rounded corner size changed by `actionType` (also used by rounded-rect-mode).
 * @param {string} actionType the action that sets the size
 * @returns {function} the reducer
 */
const makeCornerSizeReducer = actionType => function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case actionType:
            if (isNaN(action.roundedCornerSize)) {
                log.warn(`Invalid rounded corner size: ${action.roundedCornerSize}`);
                return state;
            }
            return { roundedCornerSize: Math.floor(Math.max(0, action.roundedCornerSize)) };
        default:
            return state;
    }
};
const reducer = makeCornerSizeReducer(CHANGE_ROUNDED_CORNER_SIZE);

// Action creators ==================================
const changeRoundedCornerSize = function (roundedCornerSize) {
    return {
        type: CHANGE_ROUNDED_CORNER_SIZE,
        roundedCornerSize: roundedCornerSize
    };
};

export {
    reducer as default,
    changeRoundedCornerSize,
    makeCornerSizeReducer
};
