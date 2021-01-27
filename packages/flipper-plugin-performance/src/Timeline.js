import React from 'react';
import { styled } from 'flipper';
import {
  COLOR_TEXT,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
  LABEL_HEIGHT,
  LABEL_MARGIN,
  Grid,
} from './ui';

const ROW_VERTICAL_PADDING = MARGIN_CONTAINER_HORIZONTAL / 2;
const ROW_LABEL_WIDTH = 90;
const COLORS = ['017AFF', 'FF9601', '29AC48'];

const RowHeader = styled('th')({
  color: COLOR_TEXT,
  fontSize: 13,
  fontWeight: 500,
  width: ROW_LABEL_WIDTH + MARGIN_CONTAINER_HORIZONTAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingTop: ROW_VERTICAL_PADDING,
  paddingBottom: ROW_VERTICAL_PADDING,
  textAlign: 'left',
  verticalAlign: 'middle',
});

const BAR_HEIGHT = 5;
const BAR_MARGIN_VERTICAL = 4;
const ROW_HEIGHT = BAR_HEIGHT + BAR_MARGIN_VERTICAL;
const CATEGORY_MARGIN_TOP = 10;

const TimelineEntry = React.memo(
  ({ title, origin, startTime, duration, zoom, color = '017AFF' }) => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: Math.round(zoom * (startTime - origin)),
        display: 'block',
        width: Math.round(zoom * duration),
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: `#${color}`,
        backgroundColor: `#${color}33`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: 9,
      }}
      title={title}
    ></div>
  )
);

const MARK_KNOB_SIZE = 7;
const MARK_WIDTH = 1;

const TimelineMark = React.memo(
  ({ title, origin, startTime, zoom, color = '#013E5D' }) => (
    <div
      style={{
        position: 'absolute',
        top: MARK_KNOB_SIZE,
        left: Math.round(zoom * (startTime - origin)),
        bottom: LABEL_HEIGHT + LABEL_MARGIN,
        width: MARK_WIDTH,
        display: 'block',
        backgroundColor: color,
      }}
      title={title}
    >
      <div
        style={{
          position: 'absolute',
          top: -MARK_KNOB_SIZE,
          left: MARK_KNOB_SIZE / -2 + MARK_WIDTH,
          width: MARK_KNOB_SIZE,
          height: MARK_KNOB_SIZE,
          borderColor: color,
          borderStyle: 'solid',
          borderWidth: MARK_WIDTH,
          borderRadius: MARK_KNOB_SIZE / 2,
        }}
      ></div>
    </div>
  )
);

const groupMeasures = measures => {
  const groups = [];
  for (const measure of measures) {
    let group = groups.find(group => {
      const last = group[group.length - 1];
      return last.startTime + last.duration < measure.startTime;
    });
    if (!group) {
      group = [];
      groups.push(group);
    }
    group.push(measure);
  }
  return groups;
};

const Scrollable = styled('div')({
  width: '100%',
  paddingLeft: 10,
  paddingRight: 10,
  overflowX: 'auto',
  overflowY: 'hidden',
  position: 'relative',
});

const Section = styled('div')({
  marginTop: 10,
  marginBottom: 20,
});

const Category = styled('div')({
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingRight: 10,
  fontSize: 12,
  fontWeight: 500,
  marginTop: CATEGORY_MARGIN_TOP,
});

const Row = styled('div')({
  position: 'relative',
  height: ROW_HEIGHT,
});

const initialScrollState = {
  pointerX: 0,
  timelinePosition: 0,
  containerOffsetX: 0,
};

const useDeriveMeasureData = (measures, marks) =>
  React.useMemo(() => {
    const entries = measures.concat(marks);
    const start = entries.reduce(
      (acc, item) => Math.min(acc, item.startTime),
      Infinity
    );
    const end = entries.reduce(
      (acc, item) => Math.max(acc, item.startTime + (item.duration || 0)),
      start
    );
    const categories = measures.reduce((acc, item) => {
      if (!acc.has(item.category)) {
        acc.set(item.category, []);
      }
      acc.get(item.category).push(item);
      return acc;
    }, new Map());
    categories.forEach((value, key, map) => {
      map.set(key, groupMeasures(value));
    });
    return { start, end, categories: Array.from(categories.entries()) };
  }, [measures, marks]);

const formatGridLabel = value => `${value} ms`;

export const Timeline = React.memo(({ measures, marks }) => {
  const zoomRef = React.useRef(1);
  const [zoom, setZoom] = React.useState(zoomRef.current);
  const { start, end, categories } = useDeriveMeasureData(measures, marks);

  const table = React.useRef();
  const scrollState = React.useRef(initialScrollState);
  const handleWheel = React.useCallback(
    event => {
      if (event.ctrlKey || !event.deltaX) {
        const prevZoom = zoomRef.current;
        const pointerX = event.clientX;
        if (scrollState.current.pointerX !== pointerX) {
          const containerOffsetX = table.current.getBoundingClientRect().x;
          const timelinePosition =
            (table.current.scrollLeft + pointerX - containerOffsetX) / prevZoom;
          scrollState.current = {
            containerOffsetX,
            timelinePosition,
            pointerX,
          };
        }
        zoomRef.current = Math.min(
          5,
          Math.max(10e-2, zoomRef.current - event.deltaY / 100)
        );
        setZoom(zoomRef.current);
        const { containerOffsetX, timelinePosition } = scrollState.current;
        const containerPointerX = pointerX - containerOffsetX;
        const timelinePointerX = timelinePosition * zoomRef.current;
        const scrollLeft = timelinePointerX - containerPointerX;
        table.current.scrollLeft = scrollLeft;
      } else {
        scrollState.current = initialScrollState;
      }
    },
    [zoomRef, scrollState]
  );

  if (measures.length === 0 && marks.length === 0) {
    return null;
  }
  const duration = end - start;
  const interval = 200 / 2 ** Math.ceil(Math.log2(zoom));
  const numberOfIntervals = Math.ceil(duration / interval) + 1;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        paddingTop: 10,
        marginBottom: MARGIN_CONTAINER_VERTICAL,
      }}
    >
      <div>
        {categories.map(([category, rows], i) => (
          <Section style={{ height: rows.length * ROW_HEIGHT }}>
            <Category>{category}</Category>
          </Section>
        ))}
      </div>
      <Scrollable onWheel={handleWheel} ref={table}>
        <Grid
          numberOfIntervals={numberOfIntervals}
          interval={interval}
          zoom={zoom}
          formatLabel={formatGridLabel}
        />
        {marks.map(mark => (
          <TimelineMark
            key={`${mark.name}:${mark.startTime}`}
            title={mark.name}
            origin={start}
            zoom={zoom}
            startTime={mark.startTime}
          />
        ))}
        {categories.map(([category, rows], i) => (
          <Section>
            {rows.map((measures, row) => (
              <Row>
                {measures.map((measure, j) => (
                  <TimelineEntry
                    key={`${measure.name}:${measure.startTime}`}
                    title={measure.name}
                    origin={start}
                    color={COLORS[i % COLORS.length]}
                    zoom={zoom}
                    startTime={measure.startTime}
                    duration={measure.duration}
                  />
                ))}
              </Row>
            ))}
          </Section>
        ))}
      </Scrollable>
    </div>
  );
});
