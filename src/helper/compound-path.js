import {getParentIf} from './item';

const isCompoundPath = function (item) {
    return item && item.className === 'CompoundPath';
};

const isCompoundPathChild = function (item) {
    if (item.parent) {
        return item.parent.className === 'CompoundPath';
    }
    return false;
};


const getItemsCompoundPath = item => getParentIf(item, isCompoundPath);

export {
    isCompoundPath,
    isCompoundPathChild,
    getItemsCompoundPath
};
