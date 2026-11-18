import PropTypes from 'prop-types';
import BufferedInputHOC from './buffered-input-hoc.jsx';

/**
 * Higher Order Component to manage inputs that submit on change and <enter>
 * (the buffered input with its own change, <enter> and blur handling)
 * @param {React.Component} Input text input that consumes onChange, onBlur, onKeyPress
 * @returns {React.Component} Live input that calls onSubmit on change and <enter>
 */
export default function (Input) {
    class LiveInput extends BufferedInputHOC(Input) {
        handleKeyPress (e) {
            if (e.key === 'Enter') {
                this.handleChange(e);
                e.target.blur();
            }
        }
        handleFlush () {
            this.setState({value: null});
        }
        handleChange (e) {
            const isNumeric = typeof this.props.value === 'number';
            const validatesNumeric = isNumeric ? !isNaN(e.target.value) : true;
            if (e.target.value !== null && validatesNumeric) {
                let val = Number(e.target.value);
                if (typeof this.props.max !== 'undefined' && val > Number(this.props.max)) {
                    val = this.props.max;
                }
                if (typeof this.props.min !== 'undefined' && val < Number(this.props.min)) {
                    val = this.props.min;
                }
                this.props.onSubmit(val);
            }
            this.setState({value: e.target.value});
        }
    }

    LiveInput.propTypes = {
        max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        onSubmit: PropTypes.func.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    return LiveInput;
}
