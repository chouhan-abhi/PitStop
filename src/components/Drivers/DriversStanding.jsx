import React from 'react';

export const DriversStanding = ({ driversData, driversLoading, driversIsError, driversError }) => {
  if (driversLoading) {
    return <div className="text-center text-lg">Loading driver standings...</div>;
  }

  if (driversIsError) {
    return <div className="text-center text-red-500">Error: {driversError.message}</div>;
  }

  const driverPositions = {};
  driversData.forEach(pos => {
    if (!driverPositions[pos.driver_number] || new Date(pos.date) > new Date(driverPositions[pos.driver_number].date)) {
      driverPositions[pos.driver_number] = pos;
    }
  });

  const standings = Object.values(driverPositions).sort((a, b) => a.position - b.position);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Driver Standings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-600 text-left text-gray-300">Position</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left text-gray-300">Driver</th>
              <th className="py-2 px-4 border-b border-gray-600 text-left text-gray-300">Team</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((driver) => (
              <tr key={driver.driver_number} className="hover:bg-gray-600 group">
                <td className="py-2 px-4 border-b border-gray-600">{driver.position}</td>
                <td className="py-2 px-4 border-b border-gray-600 flex items-center">
                  {driver.headshot_url && (
                    <img 
                      src={driver.headshot_url} 
                      alt={driver.full_name} 
                      className="w-8 h-8 rounded-full mr-3 border-2 group-hover:border-red-500 transition-colors duration-200"
                      style={{borderColor: `#${driver.team_colour}`}}
                    />
                  )}
                  <span className="font-semibold text-white">{driver.full_name}</span>
                </td>
                <td className="py-2 px-4 border-b border-gray-600" style={{color: `#${driver.team_colour}`}}>{driver.team_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
