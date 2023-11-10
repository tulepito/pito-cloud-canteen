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
  domainRange?: [number, number];
  customTooltip?: React.FC<TooltipProps<any, any>>;
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

const CustomizeTooltip = (props: TooltipProps<any, any>) => {
  const { payload = [] } = props;

  return (
    <div className={css.tooltipWrapper}>
      <div>{`${payload[0]?.value} đơn hàng`}</div>
      <div>{payload[0]?.payload?.dateLabel}</div>
    </div>
  );
};

const CustomizeXAxisTick = (props: any) => {
  const { payload, x, y } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={24} textAnchor="middle" fill="#8C8C8C">
        {payload.value}
      </text>
    </g>
  );
};

const LineChart: React.FC<TLineChartProps> = (props) => {
  const { dataKey, data } = props;
  const yDomain = [
    0,
    Math.ceil(Math.max(...data.map((item: any) => item[dataKey])) / 5) * 5 + 1,
  ];
  const chartMargins = { top: 0, right: 10, bottom: 0, left: -30 };
  const cartesianGridStyles = {
    stroke: '#F0F0F0', // Set the color of the grid lines
    strokeDasharray: '0', // Optional: Set the dash pattern
    vertical: false, // Optional: Only show horizontal grid lines
  };

  return (
    <ResponsiveContainer width={'100%'} height={264}>
      <RLineChart data={data} margin={chartMargins}>
        <CartesianGrid {...cartesianGridStyles} />
        <XAxis
          dataKey="dateLabel"
          tickLine={false}
          axisLine={false}
          interval={0}
          height={40}
          tick={<CustomizeXAxisTick />}
        />
        <YAxis
          axisLine={false}
          domain={yDomain}
          tickLine={false}
          tick={{ fontSize: 12, color: '#8C8C8C' }}
          tickMargin={10}
        />
        <Tooltip content={CustomizeTooltip} position={{ y: 10 }} />
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
