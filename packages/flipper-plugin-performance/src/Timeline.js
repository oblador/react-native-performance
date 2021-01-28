import React from 'react';
import { styled } from 'flipper';
import {
  COLOR_TEXT,
  COLOR_SEPARATOR,
  COLOR_FADED,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
  Grid,
} from './ui';

const ROW_VERTICAL_PADDING = MARGIN_CONTAINER_HORIZONTAL / 2;
const ROW_LABEL_WIDTH = 90;
const COLORS = ['017AFF', 'FF9601', '29AC48'];

const BAR_HEIGHT = 5;
const BAR_MARGIN_VERTICAL = 4;
const ROW_HEIGHT = BAR_HEIGHT + BAR_MARGIN_VERTICAL;
const CATEGORY_MARGIN_TOP = 10;

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

const MARGIN_SECTION_VERTICAL = 15;
const Section = styled('div')({
  paddingTop: MARGIN_SECTION_VERTICAL,
  paddingBottom: MARGIN_SECTION_VERTICAL,
});

const Category = styled('div')({
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingRight: 10,
  fontSize: 12,
  color: COLOR_TEXT,
  fontWeight: 500,
  marginTop: CATEGORY_MARGIN_TOP,
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

const drawRoundedRect = (ctx, x, y, width, height, radius, color) => {
  if (width === 0) {
    return;
  }
  ctx.fillStyle = `#${color}33`;
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
  ctx.strokeStyle = `#${color}`;
  ctx.stroke();
};

const MARK_KNOB_SIZE = 5;
const MARK_WIDTH = 1;

const drawMark = (ctx, x, height, color = 'FC3E3E') => {
  ctx.beginPath();
  ctx.moveTo(x, MARK_KNOB_SIZE + 1);
  ctx.lineTo(x, height);
  ctx.strokeStyle = `#${color}`;
  ctx.stroke();
  drawRoundedRect(
    ctx,
    x - MARK_KNOB_SIZE / 2,
    1,
    MARK_KNOB_SIZE,
    MARK_KNOB_SIZE,
    MARK_KNOB_SIZE / 2,
    color
  );
};

const AXIS_LABEL_FONT_SIZE = 9;
const AXIS_LABEL_MARGIN = 10;
const AXIS_LABEL_FONT = `${AXIS_LABEL_FONT_SIZE}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;

const drawAxis = (ctx, value, height, zoom) => {
  ctx.beginPath();
  const x = value * zoom - 1;
  ctx.moveTo(x, AXIS_LABEL_MARGIN);
  ctx.lineTo(x, height - AXIS_LABEL_MARGIN - AXIS_LABEL_FONT_SIZE);
  ctx.strokeStyle = COLOR_SEPARATOR;
  ctx.stroke();
  ctx.font = AXIS_LABEL_FONT;
  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR_FADED;
  ctx.fillText(`${value} ms`, x, height - 1);
};

const draw = (
  ctx,
  categories,
  marks,
  origin,
  zoom,
  width,
  height,
  viewport,
  ratio,
  interval,
  numberOfIntervals
) => {
  const { start, end } = viewport;
  ctx.clearRect(start, 0, end - start, height);

  for (
    let i = Math.max(1, Math.floor(start / zoom / interval));
    i < Math.floor(end / zoom / interval);
    i++
  ) {
    drawAxis(ctx, i * interval, height, zoom);
  }

  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    const x = zoom * (mark.startTime - origin);
    if (start < x && end > x) {
      drawMark(ctx, x, height - AXIS_LABEL_MARGIN - AXIS_LABEL_FONT_SIZE);
    }
  }

  let offsetY = MARGIN_SECTION_VERTICAL;
  for (let i = 0; i < categories.length; i++) {
    const color = COLORS[i % COLORS.length];
    const [, groups] = categories[i];

    for (let j = 0; j < groups.length; j++) {
      const group = groups[j];
      for (let measure of group) {
        const x = zoom * (measure.startTime - origin);
        const width = zoom * measure.duration;
        if (
          (start < x && end > x) ||
          (start < x + width && end > x + width) ||
          (start > x && end < x + width)
        ) {
          const y = offsetY + BAR_MARGIN_VERTICAL;
          drawRoundedRect(ctx, x, y, width, BAR_HEIGHT, BAR_HEIGHT / 2, color);
        }
      }
      offsetY += ROW_HEIGHT;
    }
    offsetY += MARGIN_SECTION_VERTICAL;
  }
};

export const Timeline = React.memo(({ measures, marks }) => {
  const ratio = window.devicePixelRatio || 1;
  const zoomRef = React.useRef(1);
  const [zoom, setZoom] = React.useState(zoomRef.current);
  const [viewport, setViewport] = React.useState({ start: 0, end: 0 });
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
  const duration = end - start;
  const interval = 200 / 2 ** Math.ceil(Math.log2(zoom));
  const numberOfIntervals = Math.ceil(duration / interval);
  const width = interval * numberOfIntervals * zoom;
  const height = categories.reduce(
    (acc, [, rows]) =>
      acc + MARGIN_SECTION_VERTICAL * 2 + rows.length * ROW_HEIGHT,
    AXIS_LABEL_MARGIN + AXIS_LABEL_FONT_SIZE
  );

  const canvas = React.useRef();
  const animationFrame = React.useRef(null);
  const drawTimeline = React.useCallback(() => {
    if (canvas.current) {
      draw(
        canvas.current,
        categories,
        marks,
        start,
        zoom,
        width,
        height,
        viewport,
        ratio,
        interval,
        numberOfIntervals
      );
    }
  }, [
    canvas,
    categories,
    marks,
    start,
    zoom,
    ratio,
    width,
    height,
    viewport,
    interval,
    numberOfIntervals,
  ]);

  const updateViewport = React.useCallback(
    target => {
      const { scrollLeft, scrollWidth, offsetWidth } = target;
      const frame = Math.round(scrollLeft / offsetWidth);
      const nextViewport = {
        start: Math.max(0, (frame - 0.5) * offsetWidth),
        end: Math.min(end * zoom, (frame + 1.5) * offsetWidth),
      };
      if (
        nextViewport.start !== viewport.start ||
        nextViewport.end !== viewport.end
      ) {
        setViewport(nextViewport);
      }
    },
    [zoom, viewport, drawTimeline]
  );

  const handleScroll = React.useCallback(
    event => updateViewport(event.target),
    [updateViewport]
  );

  const handleRef = React.useCallback(
    ref => {
      canvas.current = ref ? ref.getContext('2d') : null;
      if (ref) {
        canvas.current.scale(ratio, ratio);
        updateViewport(ref);
      }
    },
    // To avoid glitches in chrome we need to set scale
    // every time size has changed
    [canvas, width, height, ratio, zoom]
  );

  React.useLayoutEffect(drawTimeline, [drawTimeline]);

  if (measures.length === 0 && marks.length === 0) {
    return null;
  }

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
      <Scrollable onWheel={handleWheel} onScroll={handleScroll} ref={table}>
        <canvas
          ref={handleRef}
          width={width * ratio}
          height={height * ratio}
          style={{ width, height }}
        />
      </Scrollable>
    </div>
  );
});
