import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import Blobbiness from '../helper/blob-tools/blob';

/**
 * Shared base of the brush and eraser modes: owns their Blobbiness tool.
 * Subclasses add activateTool, the prop handling and render.
 */
class BlobMode extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'activateTool',
            'deactivateTool'
        ]);
        this.blob = new Blobbiness(
            this.props.onUpdateImage, this.props.clearSelectedItems);
    }
    componentWillUnmount () {
        if (this.blob.tool) {
            this.deactivateTool();
        }
    }
    deactivateTool () {
        this.blob.deactivateTool();
    }
}

BlobMode.propTypes = {
    clearSelectedItems: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired
};

export default BlobMode;
