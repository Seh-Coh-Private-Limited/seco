// src/components/ProgramInsights.js
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { db } from '../firebase'; // Adjust the import path to your Firebase config
import { collection, query, where, getDocs } from 'firebase/firestore';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ProgramInsights = ({ program }) => {
  const [chartData, setChartData] = useState(null);
  const [totalApplications, setTotalApplications] = useState(0);

  // Fetch and process form response data from Firestore
  useEffect(() => {
    const fetchFormResponses = async () => {
      try {
        // Step 1: Query the programmes collection to find the document where id matches program.id
        const programmesRef = collection(db, 'programmes');
        const programmeQuery = query(programmesRef, where('id', '==', program.id));
        const programmeSnapshot = await getDocs(programmeQuery);

        if (programmeSnapshot.empty) {
          console.error(`No program found with id: ${program.id}`);
          setChartData({ labels: [], datasets: [] });
          setTotalApplications(0);
          return;
        }

        // Assume the first matching document (id should be unique)
        const programmeDoc = programmeSnapshot.docs[0];
        const programmeDocId = programmeDoc.id;

        // Step 2: Query the formResponses subcollection under the matched program
        const formResponsesRef = collection(db, `programmes/${programmeDocId}/formResponses`);
        const formResponsesQuery = query(formResponsesRef);
        const formResponsesSnapshot = await getDocs(formResponsesQuery);

        // Process the submittedAt strings
        const responseDates = formResponsesSnapshot.docs.map(doc => {
          const submittedAt = doc.data().submittedAt;
          return submittedAt ? new Date(submittedAt) : null;
        }).filter(date => date !== null && !isNaN(date.getTime()));

        setTotalApplications(responseDates.length); // Set total applications count

        if (responseDates.length === 0) {
          setChartData({ labels: [], datasets: [] });
          return;
        }

        // Aggregate data by date (count submissions per day)
        const dateCounts = {};
        responseDates.forEach(date => {
          const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          dateCounts[dayKey] = (dateCounts[dayKey] || 0) + 1;
        });

        // Sort dates chronologically
        const sortedDates = Object.keys(dateCounts).sort((a, b) => {
          return new Date(a) - new Date(b);
        });

        // Prepare chart data based on actual submission dates
        const labels = sortedDates;
        const data = sortedDates.map(date => dateCounts[date]);

        // Set chart data
        setChartData({
          labels,
          datasets: [
            {
              label: 'Day-wise Applications',
              data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.1,
              pointRadius: 4,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching form responses:', error);
        setChartData({ labels: [], datasets: [] });
        setTotalApplications(0);
      }
    };

    if (program?.id) {
      fetchFormResponses();
    }
  }, [program?.id]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 0,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          stepSize: 1,
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
      x: {
        ticks: {
          font: { size: 12 },
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
    },
  };

  if (!chartData) {
    return null; // Return null while data is loading
  }

  return (
    <div className="md:px-36 overflow-none mt-8">
      <h3 className="text-lg font-semibold mb-4">Program Insights</h3>
      <Card className="p-4">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Total Applications: {totalApplications}</p>
          </div>
          {totalApplications > 0 ? (
            <div className="mb-4 h-64">
              <Line data={chartData} options={options} />
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">No applications to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Card and CardContent components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export default ProgramInsights;