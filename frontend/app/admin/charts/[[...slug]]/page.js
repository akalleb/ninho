'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import withAdminLayoutNext from '../../../../src/layout/withAdminLayoutNext';

// Loading component to maintain layout structure
const ChartLoading = () => (
  <div className="p-50 text-center">
    <Spin size="large" />
  </div>
);

// Chart components use window object - disable SSR to prevent errors
// Add loading component to prevent layout shifts
const ChartJs = dynamic(() => import('../../../../src/container/charts/ChartJs'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const ApexCharts = dynamic(() => import('../../../../src/container/charts/ApexCharts'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const GoogleChart = dynamic(() => import('../../../../src/container/charts/GoogleCharts'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsBarChart = dynamic(() => import('../../../../src/container/charts/recharts/Bar'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsAreaChart = dynamic(() => import('../../../../src/container/charts/recharts/Area'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsComposed = dynamic(() => import('../../../../src/container/charts/recharts/Composed'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsLine = dynamic(() => import('../../../../src/container/charts/recharts/Line'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsPie = dynamic(() => import('../../../../src/container/charts/recharts/Pie'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsRadar = dynamic(() => import('../../../../src/container/charts/recharts/Radar'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});
const RechartsRadial = dynamic(() => import('../../../../src/container/charts/recharts/Radial'), { 
  ssr: false,
  loading: () => <ChartLoading />,
});

function ChartsRoutesPage() {
  const params = useParams();
  const slug = params?.slug?.[0] || '';

  let Component = null;

  if (slug === 'chartjs') {
    Component = ChartJs;
  } else if (slug === 'apexcharts') {
    Component = ApexCharts;
  } else if (slug === 'google-chart') {
    Component = GoogleChart;
  } else if (slug === 'recharts/bar' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'bar')) {
    Component = RechartsBarChart;
  } else if (slug === 'recharts/area' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'area')) {
    Component = RechartsAreaChart;
  } else if (slug === 'recharts/composed' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'composed')) {
    Component = RechartsComposed;
  } else if (slug === 'recharts/line' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'line')) {
    Component = RechartsLine;
  } else if (slug === 'recharts/pie' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'pie')) {
    Component = RechartsPie;
  } else if (slug === 'recharts/radar' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'radar')) {
    Component = RechartsRadar;
  } else if (slug === 'recharts/radial' || (params?.slug?.[0] === 'recharts' && params?.slug?.[1] === 'radial')) {
    Component = RechartsRadial;
  }

  if (!Component) {
    return <div>Page not found</div>;
  }

  return <Component />;
}

export default withAdminLayoutNext(ChartsRoutesPage);

