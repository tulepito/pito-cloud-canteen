import { useState } from 'react';
import type { DotProps, TooltipProps } from 'recharts';
import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TChartPoint } from '@src/utils/types';

import css from './LineChart.module.scss';

type TLineChartProps = {
  dataKey: string;
  data: TChartPoint[];
  domainRange?: number[];
  customTooltip?: React.FC<TooltipProps<any, any>>;
  onYAxisTickFormattingFc?: (value: number) => string;
  isMobile?: boolean;
};

const CustomizeDot = (props: DotProps) => {
  const { cx = 0, cy = 0 } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={25}
      x={cx - 12.5}
      y={cy - 12.5}
      viewBox="0 0 25 25"
      fill="none">
      <g filter="url(#filter0_dd_1137_116159)">
        <circle cx="12.5" cy="11.5" r="6.5" fill="#262626" />
        <circle cx="12.5" cy="11.5" r={8} stroke="white" strokeWidth={3} />
      </g>
      <defs>
        <filter
          id="filter0_dd_1137_116159"
          width={25}
          height={25}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={1} />
          <feGaussianBlur stdDeviation={1} />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1137_116159"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={1} />
          <feGaussianBlur stdDeviation="1.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1137_116159"
            result="effect2_dropShadow_1137_116159"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1137_116159"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

const CustomizeXAxisTick = (props: any) => {
  const { payload, x, y } = props;

  const XLabel = payload.value.includes(' - ') ? (
    payload.value.split(' - ').map((date: string, index: number) => (
      <text
        key={index}
        fontSize={12}
        dy={24 * (index + 1)}
        textAnchor="middle"
        fill="#8C8C8C">
        {date}
      </text>
    ))
  ) : (
    <text dy={24} fontSize={12} textAnchor="middle" fill="#8C8C8C">
      {payload.value}
    </text>
  );

  return <g transform={`translate(${x},${y})`}>{XLabel}</g>;
};

const CustomizeYAxisTick = (props: any) => {
  const { payload, formattingFc, ...rest } = props;

  const tickValue = formattingFc ? formattingFc(payload.value) : payload.value;

  return (
    <text {...rest} fontSize={12} textAnchor="middle" fill="#8C8C8C">
      <tspan x={rest.x} dy="0.355em">
        {tickValue}
      </tspan>
    </text>
  );
};

const LineChart: React.FC<TLineChartProps> = (props) => {
  const {
    dataKey,
    data,
    customTooltip,
    onYAxisTickFormattingFc,
    domainRange,
    isMobile = false,
  } = props;
  const [activeItem, setActiveItem] = useState<any>(null);
  const dataLength = data.length;
  const yDomain = [
    0,
    Math.ceil(Math.max(...data.map((item: any) => item[dataKey])) / 5) * 5 +
      Math.ceil(
        Math.min(
          ...data
            .map((item: any) => item[dataKey])
            .filter((item) => item !== 0),
        ) / 5,
      ),
  ];
  const chartMargins = { top: 0, right: 10, bottom: 0, left: -40 };
  const cartesianGridStyles = {
    stroke: '#F0F0F0', // Set the color of the grid lines
    strokeDasharray: '0', // Optional: Set the dash pattern
    vertical: false, // Optional: Only show horizontal grid lines
  };

  const tooltipXPosition =
    dataLength > 1 &&
    (activeItem?.activeTooltipIndex === 0 ||
      activeItem?.activeTooltipIndex === dataLength - 1)
      ? undefined
      : (activeItem?.activeCoordinate?.x || 0) - 70; // tooltip width / 2;

  const chartWidth =
    dataLength > 7
      ? `${Math.ceil(dataLength / 7) * (isMobile ? 100 : 50)}%`
      : '100%';

  return (
    <ResponsiveContainer width={chartWidth} height={264}>
      <RLineChart
        data={data}
        margin={chartMargins}
        onMouseMove={(e) => setActiveItem(e)}>
        <CartesianGrid {...cartesianGridStyles} />
        <XAxis
          dataKey="dateLabel"
          tickLine={false}
          axisLine={false}
          interval={0}
          height={60}
          tick={<CustomizeXAxisTick />}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          className={css.yAxis}
          axisLine={false}
          domain={domainRange || yDomain}
          tickLine={false}
          tick={(yAxisProps: any) => (
            <CustomizeYAxisTick
              {...yAxisProps}
              formattingFc={onYAxisTickFormattingFc}
            />
          )}
        />
        <Tooltip
          content={customTooltip}
          position={{ x: tooltipXPosition, y: 0 }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#262626"
          dot={CustomizeDot}
          activeDot={CustomizeDot}
          strokeWidth={3}
        />
      </RLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
