import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ChartProps = {
  title: string;
  labels: string[];
  data: number[];
  backgroundColor?: string;
};

export const Chart = ({ title, labels, data, backgroundColor = 'rgba(53, 162, 235, 0.5)' }: ChartProps) => {
  const chartData = {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar options={options} data={chartData} />;
};
