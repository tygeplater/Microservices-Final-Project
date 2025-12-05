import React, { useEffect, useState } from 'react';
import { fetchSchedule, fetchWeekendResults } from '../api/api.hub';
import { ScheduleEvent, DriverResult } from '../models/models';
import { Header, Footer } from "../components/index"

interface DriverStanding {
  driverId: string;
  abbreviation: string;
  teamColor: string;
  fullName: string;
  positions: { round: number; position: number; cumulativePoints: number }[];
}

export function Standings() {
  const [year, setYear] = useState<number>(2024);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStandings();
  }, [year]);

  const loadStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the schedule
      const scheduleData: ScheduleEvent[] = await fetchSchedule(year);
      
      // Filter completed events (events in the past)
      const today = new Date();
      const completedEvents = scheduleData.filter(event => {
        const eventDate = new Date(event.EventDate);
        return eventDate < today;
      });

      setSchedule(completedEvents);

      // Fetch results for each completed event
      const driverPointsMap: Map<string, {
        info: Partial<DriverResult>;
        positions: { round: number; position: number; cumulativePoints: number }[];
        cumulativePoints: number;
      }> = new Map();

      for (const event of completedEvents) {

        // Skip Pre-Season Testing
        if (event.RoundNumber === 0) {
          continue;
        }
        
        try {
          const results: DriverResult[] = await fetchWeekendResults(year, event.RoundNumber);
          
          // Track which drivers raced in this event
          const driversInThisRound = new Set<string>();
  
          // Update cumulative points and positions
          results.forEach((result) => {
            driversInThisRound.add(result.DriverId);
            
            if (!driverPointsMap.has(result.DriverId)) {
              driverPointsMap.set(result.DriverId, {
                info: result,
                positions: [],
                cumulativePoints: 0,
              });
            }

            const driverData = driverPointsMap.get(result.DriverId)!;
            driverData.cumulativePoints += result.Points;
          });

          // Calculate positions after this round
          const sortedDrivers = Array.from(driverPointsMap.entries())
            .filter(([driverId, data]) => data.positions.length > 0 || driversInThisRound.has(driverId))
            .sort((a, b) => b[1].cumulativePoints - a[1].cumulativePoints);

          sortedDrivers.forEach(([driverId, data], index) => {
            data.positions.push({
              round: event.RoundNumber,
              position: index + 1,
              cumulativePoints: data.cumulativePoints,
            });
          });
        } catch (err) {
          console.error(`Error fetching results for round ${event.RoundNumber}:`, err);
        }
      }

      // Convert to array format
      const standingsArray: DriverStanding[] = Array.from(driverPointsMap.entries())
        .filter(([driverId, data]) => {
          return data.positions.length > 0;
        })
        .map(([driverId, data], index) => {
          // Generate a unique color for each driver based on their index
          const hue = (index * 137.5) % 360;
          const saturation = 70 + (index % 3) * 10;
          const lightness = 50 + (index % 2) * 10;
          
          return {
            driverId,
            abbreviation: data.info.Abbreviation || driverId,
            teamColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            fullName: data.info.FullName || driverId,
            positions: data.positions,
          };
        })
        .sort((a, b) => {
          const aFinal = a.positions[a.positions.length - 1]?.position || 999;
          const bFinal = b.positions[b.positions.length - 1]?.position || 999;
          return aFinal - bFinal;
        });

      setDriverStandings(standingsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (driverStandings.length === 0 || schedule.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data available</div>;
    }

    const maxRound = Math.max(...schedule.map(e => e.RoundNumber));
    const chartWidth = 1400;
    const chartHeight = 700;
    const padding = { top: 40, right: 220, bottom: 60, left: 60 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const maxPosition = Math.max(...driverStandings.map(d => 
      Math.max(...d.positions.map(p => p.position))
    ));

    return (
      <svg width={chartWidth} height={chartHeight} className="border border-gray-300 bg-gray-900">
        {/* Y-axis gridlines */}
        {Array.from({ length: maxPosition }, (_, i) => i + 1).map(pos => {
          const y = padding.top + ((pos - 1) / maxPosition) * plotHeight;
          return (
            <g key={`grid-${pos}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke="#444"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 10}
                y={y + 5}
                textAnchor="end"
                fill="#999"
                fontSize="12"
              >
                {pos}
              </text>
            </g>
          );
        })}

        {/* X-axis gridlines and labels */}
        {schedule.map((event, idx) => {
          const x = padding.left + (event.RoundNumber / maxRound) * plotWidth;
          return (
            <g key={`x-grid-${event.RoundNumber}`}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + plotHeight}
                stroke="#444"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {idx % 5 === 0 && (
                <text
                  x={x}
                  y={padding.top + plotHeight + 20}
                  textAnchor="middle"
                  fill="#999"
                  fontSize="12"
                >
                  {event.RoundNumber}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 20}
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
          fontWeight="bold"
        >
          Round
        </text>
        <text
          x={20}
          y={chartHeight / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
          fontWeight="bold"
          transform={`rotate(-90, 20, ${chartHeight / 2})`}
        >
          Position
        </text>

        {/* Driver lines */}
        {driverStandings.map((driver) => {
          const color = driver.teamColor;
          
          const points = driver.positions.map(pos => {
            const x = padding.left + (pos.round / maxRound) * plotWidth;
            const y = padding.top + ((pos.position - 1) / maxPosition) * plotHeight;
            return { x, y, round: pos.round, position: pos.position };
          });

          const pathData = points.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
          ).join(' ');

          return (
            <g key={driver.driverId}>
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                opacity="0.9"
              />
              {points.map((point, idx) => (
                <circle
                  key={`${driver.driverId}-${idx}`}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={color}
                  stroke="#000"
                  strokeWidth="1"
                />
              ))}
            </g>
          );
        })}

        {/* Legend */}
        {driverStandings.map((driver, idx) => {
          const x = chartWidth - padding.right + 20;
          const y = padding.top + idx * 22;
          const color = driver.teamColor;

          return (
            <g key={`legend-${driver.driverId}`}>
              <line
                x1={x}
                y1={y}
                x2={x + 30}
                y2={y}
                stroke={color}
                strokeWidth="3"
              />
              <text
                x={x + 40}
                y={y + 5}
                fill="#fff"
                fontSize="11"
              >
                {driver.fullName}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
  <>
    <Header />
    <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Championship Standings</h1>
          <div className="flex items-center gap-4">
            <label htmlFor="year" className="font-semibold">Year:</label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-md"
              min="2018"
              max={new Date().getFullYear()}
            />
            <button
              onClick={loadStandings}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl">Loading championship data...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          {renderChart()}
        </div>
      )}
    </div>
    <Footer />
  </>
  );
};

export default Standings;
