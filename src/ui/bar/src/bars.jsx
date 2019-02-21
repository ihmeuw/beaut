import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isFinite from 'lodash/isFinite';
import isUndefined from 'lodash/isUndefined';
import pick from 'lodash/pick';

import {
  adjustDomainScale,
  combineStyles,
  CommonDefaultProps,
  CommonPropTypes,
  computeDataMax,
  computeDomainScale,
  computeRangeScale,
  isVertical,
  memoizeByLastCall,
  propResolver,
} from '../../../utils';

import Bar from './bar';

/**
 * `import { Bars } from 'ihme-ui'`
 */
export default class Bars extends React.PureComponent {
  constructor(props) {
    super(props);

    this.combineStyles = memoizeByLastCall(combineStyles);
    this.computeDataMax = memoizeByLastCall(computeDataMax);
  }

  getDomainScale() {
    const {
      align,
      bandPadding,
      bandPaddingInner,
      bandPaddingOuter,
      categories,
      orientation,
      scales,
      width,
      height,
    } = this.props;

    const vertical = isVertical(orientation);

    const scale = (vertical ? scales.x : scales.y);
    const domainScale = scale
      // If a scaling function was passed via the `scales` prop, we make a copy of it (to avoid mutating the original).
      ? scale.copy()
      // Otherwise we compute the scaling function.
      : computeDomainScale(categories, orientation, vertical ? width : height);

    // Adjust the domain scale based on alignment and padding.
    return adjustDomainScale(
      domainScale,
      align,
      !isUndefined(bandPaddingInner) ? bandPaddingInner : bandPadding,
      !isUndefined(bandPaddingOuter) ? bandPaddingOuter : bandPadding,
    );
  }

  getRangeScale() {
    const {
      data,
      dataAccessors,
      orientation,
      rangeMax,
      scales,
      height,
      width,
    } = this.props;

    const vertical = isVertical(orientation);

    const scale = vertical ? scales.y : scales.x;
    if (scale) {
      return scale.copy();
    }

    const max = !isUndefined(rangeMax) ? rangeMax : this.computeDataMax(data, dataAccessors.value);
    return computeRangeScale(max, orientation, vertical ? height : width);
  }

  render() {
    const {
      className,
      clipPathId,
      colorScale,
      data,
      dataAccessors,
      fill,
      focus,
      height,
      orientation,
      rectClassName,
      rectStyle,
      selection,
      style,
    } = this.props;

    const childProps = pick(this.props, [
      'focusedClassName',
      'focusedStyle',
      'onClick',
      'onMouseLeave',
      'onMouseMove',
      'onMouseOver',
      'selectedClassName',
      'selectedStyle',
    ]);

    const vertical = isVertical(orientation);
    const domainScale = this.getDomainScale();
    const rangeScale = this.getRangeScale();
    const bandwidth = domainScale.bandwidth();

    return (
      <g
        className={className && classNames(className)}
        clipPath={clipPathId && `url(#${clipPathId})`}
        style={this.combineStyles(style, data)}
      >
        {data.map((datum) => {
          const fillValue = propResolver(datum, dataAccessors.fill);
          const category = propResolver(datum, dataAccessors.category);
          const value = propResolver(datum, dataAccessors.value);

          /* eslint-disable no-multi-spaces */
          const x         = vertical ? domainScale(category) : 0;
          const y         = vertical ? rangeScale(value)     : domainScale(category);
          const barHeight = vertical ? height - y            : bandwidth;
          const barWidth  = vertical ? bandwidth             : rangeScale(value);
          /* eslint-enable no-multi-space */

          return (
            <Bar
              className={rectClassName}
              key={category}
              datum={datum}
              x={x}
              y={y}
              height={barHeight}
              width={barWidth}
              fill={colorScale && (isFinite(fillValue) ? colorScale(fillValue) : fill)}
              focused={focus === datum}
              selected={selection.includes(datum)}
              style={rectStyle}
              {...childProps}
            />
          );
        })}
      </g>
    );
  }
}

Bars.propTypes = {
  /**
   * Ordinal scaleBand align property. Sets the alignment of `<Bars />`s to the
   * specified value which must be in the range [0, 1].
   * See https://github.com/d3/d3-scale/blob/master/README.md#scaleBand for reference.
   */
  align: PropTypes.number,

  /**
   * Ordinal scaleBand padding property. A convenience method for setting the inner and
   * outer padding of `<Bars />`s to the same padding value
   * See https://github.com/d3/d3-scale/blob/master/README.md#scaleBand for reference.
   */
  bandPadding: PropTypes.number,

  /**
   * Ordinal scaleBand paddingInner property. Sets the inner padding of `<Bars />`s to the
   * specified value which must be in the range [0, 1].
   * See https://github.com/d3/d3-scale/blob/master/README.md#scaleBand for reference.
   */
  bandPaddingInner: PropTypes.number,

  /**
   * Ordinal scaleBand paddingOuter property. Sets the outer padding of `<Bars />`s to the
   * specified value which must be in the range [0, 1].
   * See https://github.com/d3/d3-scale/blob/master/README.md#scaleBand for reference.
   */
  bandPaddingOuter: PropTypes.number,

  categories: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,

  /**
   * className applied to outermost wrapping `<g>`.
   */
  className: CommonPropTypes.className,

  /**
   * If a clip path is applied to a container element (e.g., an `<AxisChart />`),
   * clip all children of `<Bars />` to that container by passing in the clip path URL id.
   */
  clipPathId: PropTypes.string,

  /**
   * If provided will determine color of rendered `<Bar />`s
   */
  colorScale: PropTypes.func,

  /**
   * Array of datum objects
   */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  /**
   * Accessors on datum objects
   *   fill          : property on datum denoting its fill color (will be passed to `props.colorScale`)
   *   category (req): property on datum denoting its category (the chart domain)
   *   value:   (req): property on datum denoting its data value (the chart range)
   *
   * Each accessor can either be a string or function. If a string, it is assumed to be the name of a
   * property on datum objects; full paths to nested properties are supported (e.g., { `x`: 'values.year', ... }).
   * If a function, it is passed datum objects as its first and only argument.
   */
  dataAccessors: PropTypes.shape({
    fill: CommonPropTypes.dataAccessor,
    category: CommonPropTypes.dataAccessor.isRequired,
    value: CommonPropTypes.dataAccessor.isRequired,
  }).isRequired,

  /**
   * If `props.colorScale` is undefined, each `<Bar />` will be given this same fill value.
   */
  fill: PropTypes.string,

  /**
   * The datum object corresponding to the `<Bar />` currently focused.
   */
  focus: PropTypes.object,

  /**
   * className applied if `<Bar />` has focus.
   */
  focusedClassName: CommonPropTypes.className,

  /**
   * inline styles applied to focused `<Bar />`
   * If an object, spread into inline styles.
   * If a function, passed underlying datum corresponding to its `<Bar />`,
   * and return value is spread into inline styles;
   * signature: (datum) => obj
   */
  focusedStyle: CommonPropTypes.style,

  /**
   *  Pixel height of bar chart.
   */
  height: PropTypes.number,

  /**
   *  Pixel width of bar chart.
   */
  width: PropTypes.number,

  /**
   * onClick callback.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onClick: PropTypes.func,

  /**
   * onMouseLeave callback.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseLeave: PropTypes.func,

  /**
   * onMouseMove callback.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseMove: PropTypes.func,

  /**
   * onMouseOver callback.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseOver: PropTypes.func,

  /**
   * Orientation in which bars should be created.
   * Defaults to vertical, but option for horizontal orientation supported.
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),

  rangeMax: PropTypes.number,

  /**
   * className applied to each `<Bar />`
   */
  rectClassName: CommonPropTypes.className,

  /**
   * Inline styles passed to each `<Bar />`
   */
  rectStyle: CommonPropTypes.style,

  /**
   * `x` and `y` scales for positioning `<Bar />`s.
   * Object with keys: `x`, and `y`.
   */
  scales: PropTypes.shape({
    x: PropTypes.func,
    y: PropTypes.func,
  }),

  /**
   * className applied to `<Bar />`s if selected
   */
  selectedClassName: CommonPropTypes.className,

  /**
   * Array of datum objects corresponding to selected `<Bar />`s
   */
  selection: PropTypes.array,

  /**
   * Inline styles applied to wrapping element (`<g>`) of scatter shapes
   */
  style: CommonPropTypes.style,
};

Bars.defaultProps = {
  fill: 'steelblue',
  onClick: CommonDefaultProps.noop,
  onMouseLeave: CommonDefaultProps.noop,
  onMouseMove: CommonDefaultProps.noop,
  onMouseOver: CommonDefaultProps.noop,
  bandPadding: 0.05,
  orientation: 'vertical',
};
