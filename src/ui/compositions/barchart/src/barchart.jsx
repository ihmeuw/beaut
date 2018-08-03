import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  castArray,
} from 'lodash';

import {
  combineStyles,
  CommonPropTypes,
  memoizeByLastCall,
} from '../../../../utils';

import styles from './style.css';
import AxisChart from './../../../axis-chart';
import { XAxis, YAxis } from './../../../axis';
import Bars from './../../../bar/src/bars';
import ResponsiveContainer from '../../../responsive-container';
import Legend from './../../../legend';

export default class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.combineStyles = memoizeByLastCall(combineStyles);
    this.castSelectionAsArray = memoizeByLastCall((selection) => castArray(selection));
    this.state = {
      selectedItems: [],
    };
  }

  renderTitle() {
    const {
      labelAccessors,
      titleClassName,
      titleStyle,
    } = this.props;
    if (!labelAccessors.title) return null;
    return (
      <div className={classNames(styles.title, titleClassName)} style={titleStyle}>
        {labelAccessors.title}
      </div>
    );
  }

  renderLegend() {
    const {
      legendAccessors,
      legendKey,
      legendClassName,
      legendStyle,
    } = this.props;
    if (!legendAccessors) return null;
    return (
      <div className={classNames(styles.legend, legendClassName)} style={legendStyle}>
        <div className={styles['legend-wrapper']}>
          <Legend
            items={legendAccessors}
            labelKey={legendKey.labelKey}
            shapeColorKey={legendKey.shapeColorKey}
            shapeTypeKey={legendKey.shapeTypeKey}
          />
        </div>
      </div>
    );
  }

  renderChart() {
    const {
      chartStyle,
      data,
      dataAccessors,
      fill,
      focus,
      height,
      labelAccessors,
      onClick,
      onMouseOver,
      onMouseLeave,
      onMouseMove,
      orientation,
      scaleAccessors,
      bandPositions,
      width,
    } = this.props;

    return (
      <div className={classNames(styles.chart, chartStyle)}>
        {this.renderTitle()}
        <ResponsiveContainer>
          {this.renderLegend()}
          <AxisChart
            width={width}
            height={height}
            xDomain={scaleAccessors.xDomain}
            yDomain={scaleAccessors.yDomain}
            xScaleType={scaleAccessors.xScale}
            yScaleType={scaleAccessors.yScale}
          >
            <XAxis
              label={labelAccessors.xLabel}
            />
            <YAxis
              label={labelAccessors.yLabel}
            />
            <Bars
              align={bandPositions.align}
              bandPaddingOuter={bandPositions.bandPaddingOuter}
              bandPadding={bandPositions.bandPadding}
              bandPaddingInner={bandPositions.bandPaddingInner}
              dataAccessors={dataAccessors}
              data={data}
              fill={fill}
              focus={focus}
              onClick={onClick}
              onMouseOver={onMouseOver}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              orientation={orientation}
              style={chartStyle}
              selection={this.state.selectedItems}
            />
          </AxisChart>
        </ResponsiveContainer>
      </div>
    );
  }

  render() {
    const { className, style } = this.props;
    return (
      <div className={classNames(styles['chart-container'], className)} style={style}>
        {this.renderChart()}
      </div>
    );
  }
}

BarChart.propTypes = {
  /**
   * Ordinal scaleBand align property. Sets the alignment of `<Bars />`s to the to the
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

  /**
   * Values used for the d3 scale band properties
   *    align: property used for the align property to alter d3 scaleBand alignment
   *    bandPadding: property used for the bandPadding to alter d3 scaleBand inner and outer padding
   *    bandPaddingInner: property used for the bandPaddingInner to alter d3 scaleBand inner padding
   *    bandPaddingOuter: property used for the bandPaddingOuter to alter d3 scaleBand outer padding
   */
  bandPositions: PropTypes.shape({
    align: PropTypes.number,
    bandPadding: PropTypes.number,
    bandPaddingInner: PropTypes.number,
    bandPaddingOuter: PropTypes.number
  }),

  /**
   * inline styles applied to div wrapping the chart
   */
  chartStyle: PropTypes.object,

  /**
   * Array of datum objects
   */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  /**
   * Accessors on datum objects
   *   fill: property on datum to provide fill (will be passed to `props.colorScale`)
   *   key: unique dimension of datum (required)
   *   stack: property on datum to position bars svg element rect in x-direction
   *   value: property on datum to position bars svg element rect in y-direction
   *   layer: property on datum to position bars svg element rect in categorical format. (grouped/stacked)
   *
   * Each accessor can either be a string or function. If a string, it is assumed to be the name of a
   * property on datum objects; full paths to nested properties are supported (e.g., { `x`: 'values.year', ... }).
   * If a function, it is passed datum objects as its first and only argument.
   */
  dataAccessors: PropTypes.shape({
    fill: PropTypes.string,
    key: PropTypes.string.isRequired,
    stack: PropTypes.string,
    value: PropTypes.string,
    layer: PropTypes.string,
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
   * Accessors to label properties
   *    title: property used to access the title of the composite component
   *    xLabel: property used to access the xLabel of the composite component
   *    yLabel: property used to access the yLabel of the composite component
   */
  labelAccessors: PropTypes.shape({
    title: PropTypes.string,
    xLabel: PropTypes.string,
    yLabel: PropTypes.string
  }),

  /**
   * Accessors to legend properties
   *    labelKey: property used to access the path to label in item objects (e.g., 'name', 'properties.label')
   *    shapeColorKey: property used to access the path to shape color in item objects (e.g., 'color', 'properties.color')
   *    shapeTypeKey: property used to access the path to shape type in item objects (e.g., 'type', 'properties.type')
   */
  legendAccessors: PropTypes.shape({
    labelKey: PropTypes.string,
    shapeColorKey: PropTypes.string,
    shapeTypeKey: PropTypes.string
  }),

  /**
   * path to label in item objects (e.g., 'name', 'properties.label')
   * or a function to resolve the label
   * signature: function (item) {...}
   */
  legendKey: PropTypes.string,

  /**
   * className applied to div wrapping the title
   */
  legendClassName: CommonPropTypes.className,

  /**
   * inline styles applied to div wrapping the legend
   */
  legendStyle: PropTypes.object,

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
  orientation: PropTypes.string,

  /**
   * Accessors to scales properties
   *    xDomain: property used to access the xDomain of the scales object
   *    yDomain: property used to access the yDomain of the scales object
   *    xScale: property used to access the xScale  of the scales object
   *    yScale: property used to access the yScale of the scales object
   */
  scaleAccessors: PropTypes.shape({
    xDomain: PropTypes.string,
    yDomain: PropTypes.string,
    xScale: PropTypes.string,
    yScale: PropTypes.string,
  }),

  /**
   * className applied to div wrapping the title
   */
  titleClassName: CommonPropTypes.className,

  /**
   * inline styles applied to div wrapping the title
   */
  titleStyle: PropTypes.object,

  style: PropTypes.object,

  height: PropTypes.number,

  width: PropTypes.number,

  className: PropTypes.string,
};

BarChart.defaultProps = {
  orientation: 'vertical',
  fill: 'steelblue',
  bandPositions: {
    align: 0.5
  },
  labelAccessors: {
    xLabel: 'X Axis',
    yLabel: 'Y Axis',
  },
};
