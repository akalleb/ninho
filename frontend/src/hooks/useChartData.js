import { useRef, useState, useEffect } from 'react';

const useChartData = () => {
  const [chartData, setChartData] = useState({});
  const ref = useRef();

  useEffect(() => {
    if (ref.current && ref.current.chartInstance) {
      const { data } = ref.current.chartInstance;
      setChartData(data);
    }
  }, []);

  return { ref, chartData };
};

export default useChartData;
