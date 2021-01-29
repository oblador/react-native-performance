import React from 'react';
import { styled } from 'flipper';
import { formatMilliseconds } from './lib/formatMilliseconds';
import {
  COLOR_TEXT,
  COLOR_SEPARATOR,
  COLOR_FADED,
  MARGIN_CONTAINER_VERTICAL,
  MARGIN_CONTAINER_HORIZONTAL,
  drawRoundedRect,
  drawMark,
  Grid,
} from './ui';

const COLORS = ['017AFF', 'FF9601', '29AC48'];
const BAR_HEIGHT = 5;
const BAR_MARGIN_VERTICAL = 4;
const ROW_HEIGHT = BAR_HEIGHT + BAR_MARGIN_VERTICAL;
const CATEGORY_MARGIN_VERTICAL = 15;
const MARK_KNOB_SIZE = 5;
const AXIS_LABEL_FONT_SIZE = 9;
const AXIS_LABEL_MARGIN = 10;
const AXIS_LABEL_FONT = `${AXIS_LABEL_FONT_SIZE}px 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const TOOLTIP_HEIGHT = 20;
const TOOLTIP_CARET_SIZE = 6;

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

const CategoryLabel = styled('div')({
  paddingTop: CATEGORY_MARGIN_VERTICAL,
  paddingBottom: CATEGORY_MARGIN_VERTICAL,
  paddingLeft: MARGIN_CONTAINER_HORIZONTAL,
  paddingRight: 10,
  fontSize: 12,
  color: COLOR_TEXT,
  fontWeight: 500,
  boxSizing: 'border-box',
  overflow: 'hidden',
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
    const categoryMap = measures.reduce((acc, item) => {
      if (!acc.has(item.category)) {
        acc.set(item.category, []);
      }
      acc.get(item.category).push(item);
      return acc;
    }, new Map());
    categoryMap.forEach((value, key, map) => {
      map.set(key, groupMeasures(value));
    });

    const measuresWithLayout = [];
    const categories = Array.from(categoryMap.entries());
    let offsetY = CATEGORY_MARGIN_VERTICAL;
    for (let i = 0; i < categories.length; i++) {
      const color = COLORS[i % COLORS.length];
      const [, groups] = categories[i];

      for (let j = 0; j < groups.length; j++) {
        const group = groups[j];
        for (var k = 0; k < group.length; k++) {
          const measure = group[k];
          const x = measure.startTime - start;
          const y = offsetY + BAR_MARGIN_VERTICAL;
          group[k] = {
            ...measure,
            x,
            y,
            color,
          };
        }
        measuresWithLayout.push(...group);
        offsetY += ROW_HEIGHT;
      }
      offsetY += CATEGORY_MARGIN_VERTICAL * 2;
    }

    return { start, end, categories, measuresWithLayout };
  }, [measures, marks]);

const drawAxis = (ctx, x, height, value) => {
  ctx.beginPath();
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
  measures,
  marks,
  origin,
  zoom,
  height,
  page,
  viewportWidth,
  interval
) => {
  const start = (page - 0.5) * viewportWidth;
  const end = (page + 1.5) * viewportWidth;
  ctx.clearRect(0, 0, end - start, height);

  for (
    let i = Math.max(1, Math.floor(start / zoom / interval));
    i < Math.floor(end / zoom / interval);
    i++
  ) {
    const value = i * interval;
    const x = value * zoom - start - 1;
    drawAxis(ctx, x, height, value);
  }

  for (const mark of marks) {
    const x = zoom * (mark.startTime - origin);
    if (start < x && end > x) {
      drawMark(
        ctx,
        x - start,
        height - AXIS_LABEL_MARGIN - AXIS_LABEL_FONT_SIZE,
        MARK_KNOB_SIZE
      );
    }
  }

  for (const measure of measures) {
    const x = zoom * measure.x;
    const width = zoom * measure.duration;
    if (
      (start < x && end > x) ||
      (start < x + width && end > x + width) ||
      (start > x && end < x + width)
    ) {
      drawRoundedRect(
        ctx,
        x - start,
        measure.y,
        width,
        BAR_HEIGHT,
        BAR_HEIGHT / 2,
        measure.color
      );
    }
  }
};

const hitTest = (x, y, measures) => {
  for (const measure of measures) {
    if (
      x >= measure.x &&
      x <= measure.x + measure.duration &&
      y >= measure.y - BAR_MARGIN_VERTICAL &&
      y <= measure.y + BAR_HEIGHT + BAR_MARGIN_VERTICAL
    ) {
      return measure;
    }
  }
};

export const Timeline = React.memo(({ measures, marks }) => {
  const pixelDensity = window.devicePixelRatio || 1;
  const zoomRef = React.useRef(1);
  const [zoom, setZoom] = React.useState(zoomRef.current);
  const [viewportWidth, setVW] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [tooltip, setTooltip] = React.useState(null);
  const { start, end, categories, measuresWithLayout } = useDeriveMeasureData(
    measures,
    marks
  );

  const table = React.useRef();
  const handleTableRef = React.useCallback(
    ref => {
      table.current = ref;
      if (ref) {
        setVW(ref.offsetWidth);
      }
    },
    [table, setVW]
  );
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
  const width = Math.ceil(duration / interval) * interval * zoom;
  const height = categories.reduce(
    (acc, [, rows]) =>
      acc + CATEGORY_MARGIN_VERTICAL * 2 + rows.length * ROW_HEIGHT,
    AXIS_LABEL_MARGIN + AXIS_LABEL_FONT_SIZE
  );

  const canvas = React.useRef();
  const animationFrame = React.useRef(null);
  const drawTimeline = React.useCallback(() => {
    if (canvas.current) {
      draw(
        canvas.current,
        measuresWithLayout,
        marks,
        start,
        zoom,
        height,
        page,
        viewportWidth,
        interval
      );
    }
  }, [
    canvas,
    measuresWithLayout,
    marks,
    start,
    zoom,
    height,
    page,
    viewportWidth,
    interval,
  ]);

  const updateViewport = React.useCallback(
    target => {
      const { scrollLeft } = target;
      const nextPage = Math.round(scrollLeft / viewportWidth);
      if (nextPage !== page) {
        setPage(nextPage);
      }
    },
    [viewportWidth, page, setPage, drawTimeline]
  );

  const handleScroll = React.useCallback(
    event => updateViewport(event.target),
    [updateViewport]
  );

  const handleRef = React.useCallback(
    ref => {
      canvas.current = ref ? ref.getContext('2d') : null;
      if (ref) {
        canvas.current.scale(pixelDensity, pixelDensity);
        if (table.current) {
          updateViewport(table.current);
        }
      }
    },
    // To avoid glitches in chrome on retina screens we need
    // to set scale every time canvas dimensions change
    [table, canvas, viewportWidth, height]
  );

  const handleMouseMove = React.useCallback(
    event => {
      const x = event.nativeEvent.layerX / zoom;
      const y = event.nativeEvent.offsetY;
      const entry = hitTest(x, y, measuresWithLayout);
      if (!entry && tooltip) {
        setTooltip(null);
      } else if (entry && (!tooltip || tooltip.entry !== entry)) {
        setTooltip({ x, entry });
      }
    },
    [measuresWithLayout, start, zoom, tooltip, setTooltip]
  );

  const handleMouseLeave = React.useCallback(event => setTooltip(null), [
    setTooltip,
  ]);

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
          <CategoryLabel
            style={{
              height: rows.length * ROW_HEIGHT + CATEGORY_MARGIN_VERTICAL * 2,
            }}
          >
            {category}
          </CategoryLabel>
        ))}
      </div>
      <Scrollable
        onWheel={handleWheel}
        onScroll={handleScroll}
        ref={handleTableRef}
      >
        <div
          style={{ width, height, overflow: 'hidden', position: 'relative' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <canvas
            ref={handleRef}
            width={viewportWidth * 2 * pixelDensity}
            height={height * pixelDensity}
            style={{
              width: viewportWidth * 2,
              height,
              transform: `translate(${(page - 0.5) * viewportWidth}px, 0)`,
            }}
          />
        </div>
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              top: tooltip.entry.y + BAR_HEIGHT + TOOLTIP_CARET_SIZE + 1,
              left: tooltip.x * zoom - TOOLTIP_CARET_SIZE,
              backgroundColor: '#000',
              color: 'white',
              height: TOOLTIP_HEIGHT,
              borderRadius: TOOLTIP_HEIGHT / 2,
              lineHeight: `${TOOLTIP_HEIGHT}px`,
              fontSize: 9,
              padding: `0 ${TOOLTIP_HEIGHT / 2}px`,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -TOOLTIP_CARET_SIZE * 2,
                border: `${TOOLTIP_CARET_SIZE}px solid transparent`,
                borderBottomColor: '#000',
              }}
            />
            {tooltip.entry.name} {formatMilliseconds(tooltip.entry.duration)}
          </div>
        )}
      </Scrollable>
    </div>
  );
});
