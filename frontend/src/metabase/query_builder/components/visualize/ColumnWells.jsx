import React from "react";

import cx from "classnames";
import _ from "underscore";

import colors, { alpha } from "metabase/lib/colors";

import Icon from "metabase/components/Icon";

import { formatColumn } from "metabase/lib/formatting";

import { updateSettings } from "metabase/visualizations/lib/settings";
import { getComputedSettingsForSeries } from "metabase/visualizations/lib/settings/visualization";

import ColumnDropTarget from "./dnd/ColumnDropTarget";

export default class ColumnWells extends React.Component {
  render() {
    const {
      question,
      style,
      className,
      children,
      rawSeries,
      query,
      setDatasetQuery,
      onReplaceAllVisualizationSettings,
    } = this.props;

    let wells;
    let onChangeSettings;
    if (rawSeries) {
      const storedSettings = rawSeries[0].card.visualization_settings;
      const computedSettings = getComputedSettingsForSeries(rawSeries);

      wells = computedSettings["_column_wells"];
      onChangeSettings = changedSettings => {
        console.log(changedSettings);
        onReplaceAllVisualizationSettings(
          updateSettings(storedSettings, changedSettings),
        );
      };
    }

    const actionProps = {
      onChangeSettings,
      query,
      setDatasetQuery,
    };

    return (
      <div style={style} className={cx(className, "flex flex-row")}>
        {wells &&
          wells.left && (
            <WellArea vertical>
              {wells.left.map(well => (
                <Well vertical well={well} actionProps={actionProps} />
              ))}
            </WellArea>
          )}
        <div className="flex-full flex flex-column">
          {children}
          {wells &&
            wells.bottom && (
              <WellArea>
                {wells.bottom.map(well => (
                  <Well well={well} actionProps={actionProps} />
                ))}
              </WellArea>
            )}
        </div>
      </div>
    );
  }
}

const WELL_MIN_WIDTH = 180;
const WELL_BORDER = 10;

const WELL_COLUMN_STYLE = {
  backgroundColor: colors["brand"],
  color: colors["text-white"],
};

const getPlaceholderColorStyle = (color, opacity = 0.2) => ({
  backgroundColor: alpha(color, opacity),
  boxShadow: `0 0 0 ${WELL_BORDER}px ${alpha(color, opacity / 2)}`,
});

const WELL_PLACEHOLDER_STYLE = getPlaceholderColorStyle(colors["text-medium"]);

const WELL_VERTICAL_STYLE = {
  // FIXME: ensure browser compatibility
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  whiteSpace: "nowrap",
  display: "inline-block",
  overflow: "visible",
  // minHeight: WELL_MIN_WIDTH,
};

const WELL_HORIZONTAL_STYLE = {
  // minWidth: WELL_MIN_WIDTH,
};

const WellArea = ({ vertical, children }) => (
  <div
    className={cx("flex layout-centered", { "flex-column-reverse": vertical })}
  >
    {children}
  </div>
);

const Well = ({ well, vertical, actionProps }) => {
  return (
    <ColumnDropTarget
      canDrop={column => well.canAdd && well.canAdd(column)}
      onDrop={column => well.onAdd(column, actionProps)}
    >
      {({ hovered, highlighted }) => (
        <span
          className={cx(
            "m3 circular p1 bg-medium h3 text-medium text-centered flex layout-centered",
            vertical ? "py3" : "px3",
          )}
          style={{
            ...(vertical ? WELL_VERTICAL_STYLE : WELL_HORIZONTAL_STYLE),
            ...(well.column
              ? { ...WELL_COLUMN_STYLE, backgroundColor: well.color }
              : WELL_PLACEHOLDER_STYLE),
            ...(hovered
              ? getPlaceholderColorStyle(colors["brand"], 0.5)
              : highlighted
                ? getPlaceholderColorStyle(colors["text-medium"], 0.5)
                : {}),
          }}
        >
          {well.column ? formatColumn(well.column) : well.placeholder}
          {well.onRemove && (
            <Icon
              name="close"
              className={cx(
                "text-light text-medium-hover cursor-pointer",
                vertical ? "mt1" : "ml1",
              )}
              onClick={() => well.onRemove(actionProps)}
            />
          )}
        </span>
      )}
    </ColumnDropTarget>
  );
};
