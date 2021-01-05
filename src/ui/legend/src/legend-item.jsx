import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash/bindAll';

import {
  combineStyles,
  CommonDefaultProps,
  CommonPropTypes,
  memoizeByLastCall,
  propResolver,
} from '../../../utils';

import styles from './legend-item.css';
import { Shape } from '../../shape';

/**
 * import { LegendItem } from 'ihme-ui';
 *
 * Default ItemComponent used by `<Legend />`.
 */
export default class LegendItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.combineItemStyles = memoizeByLastCall(combineStyles);

    bindAll(this, [
      'onClear',
      'onClick',
      'onMouseLeave',
      'onMouseMove',
      'onMouseOver',
    ]);
  }

  onClear(event) {
    const {
      item,
      onClear,
    } = this.props;

    onClear(event, item, this);
  }

  onClick(event) {
    const {
      item,
      onClick,
    } = this.props;

    // want to check below if item is clickable, so should not provide noop default
    if (!onClick) return;
    onClick(event, item, this);
  }

  onMouseLeave(event) {
    const {
      item,
      onMouseLeave,
    } = this.props;

    onMouseLeave(event, item, this);
  }

  onMouseMove(event) {
    const {
      item,
      onMouseMove,
    } = this.props;

    onMouseMove(event, item, this);
  }

  onMouseOver(event) {
    const {
      item,
      onMouseOver,
    } = this.props;

    onMouseOver(event, item, this);
  }

  renderLabel() {
    const {
      item,
      LabelComponent,
      labelKey
    } = this.props;

    // if a custom label component is passed in, render it
    if (LabelComponent) return <LabelComponent item={item} />;

    // if labelKey is a function, call it with the current item
    // otherwise, object access
    return propResolver(item, labelKey);
  }

  render() {
    const {
      className,
      item,
      onClick,
      onClear,
      shapeColorKey,
      shapeTypeKey,
      style,
    } = this.props;

    const fill = propResolver(item, shapeColorKey);
    const type = propResolver(item, shapeTypeKey);

    return (
      <li
        className={classNames(styles.li, className)}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onMouseOver={this.onMouseOver}
        style={this.combineItemStyles(style, item)}
      >
        {typeof onClear === 'function' ? (
          <svg
            className={classNames(styles.clickable, styles.svg)}
            height="1em"
            onClick={this.onClear}
            viewBox="-8 -8 16 16"
            width="1em"
          >
            <path d="M-3,-3L3,3 M-3,3L3,-3" stroke="black" strokeWidth="1.5" />
          </svg>
        ) : null}
        <div
          className={classNames(styles['label-shape-wrapper'], {
            [styles.clickable]: typeof onClick === 'function',
          })}
          onClick={this.onClick}
        >
          <svg
            viewBox="-8 -8 16 16" // bounds of <Shape /> with default size of 64 (8x8)
            width="1em" height="1em"
            className={styles.svg}
          >
            <Shape shapeType={type} fill={fill} />
          </svg>
          <span className={styles.label}>
            {this.renderLabel()}
          </span>
        </div>
      </li>
    );
  }
}

LegendItem.propTypes = {
  /**
   * classname(s) to apply to li
   */
  className: CommonPropTypes.className,

  /**
   * legend item to render
   */
  item: PropTypes.object.isRequired,

  /**
   * custom component to render for each label, passed current item;
   * must be passable to React.createElement
   */
  LabelComponent: PropTypes.func,

  /**
   * path to label in item objects (e.g., 'name', 'properties.label')
   * or a function to resolve the label
   * signature: function (item) {...}
   */
  labelKey: CommonPropTypes.dataAccessor.isRequired,

  /**
   * callback when 'clear' icon is clicked;
   * signature: (SyntheticEvent, item, instance) => {}
   */
  onClear: PropTypes.func,

  /**
   * callback when legend item is clicked;
   * signature: (SyntheticEvent, item, instance) => {}
   */
  onClick: PropTypes.func,

  /**
   * onMouseLeave callback
   * signature: (SyntheticEvent, item, instance) => {...}
   */
  onMouseLeave: PropTypes.func,

  /**
   * onMouseMove callback
   * signature: (SyntheticEvent, item, instance) => {...}
   */
  onMouseMove: PropTypes.func,

  /**
   * onMouseOver callback
   * signature: (SyntheticEvent, item, instance) => {...}
   */
  onMouseOver: PropTypes.func,

  /**
   * path to shape color in item objects (e.g., 'color', 'properties.color')
   * or a function to resolve the color
   * signature: (item) => {...}
   */
  shapeColorKey: CommonPropTypes.dataAccessor.isRequired,

  /**
   * path to shape type in item objects (e.g., 'type', 'properties.type')
   * or a function to resolve the type
   * if a function: signature: (item) => {...}
   * must be one of [supported shape types](https://github.com/ihmeuw/ihme-ui/blob/main/src/utils/shape.js#L23)
   */
  shapeTypeKey: CommonPropTypes.dataAccessor.isRequired,

  /**
   * inline-styles to be applied to individual legend item <li>
   * if a function, passed item as argument. Signature: (item): {} => { ... }.
   */
  style: CommonPropTypes.style,
};

LegendItem.defaultProps = {
  onMouseLeave: CommonDefaultProps.noop,
  onMouseMove: CommonDefaultProps.noop,
  onMouseOver: CommonDefaultProps.noop,
};
