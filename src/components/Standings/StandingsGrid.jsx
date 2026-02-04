import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import driversStandingsData from '../../data/driversStandings2025.json';
import constructorsStandingsData from '../../data/constructorsStandings2025.json';

const StandingsGrid = () => {
  const [driversExpanded, setDriversExpanded] = useState(false);
  const [constructorsExpanded, setConstructorsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'constructors'

  const driversData = driversStandingsData.standings;
  const constructorsData = constructorsStandingsData.standings;

  const displayedDrivers = driversExpanded ? driversData : driversData.slice(0, 5);
  const displayedConstructors = constructorsExpanded ? constructorsData : constructorsData.slice(0, 5);

  const toggleDriversExpand = () => {
    setDriversExpanded(!driversExpanded);
  };

  const toggleConstructorsExpand = () => {
    setConstructorsExpanded(!constructorsExpanded);
  };

  return (
      <div className="w-full mb-3 sm:mb-4 lg:mb-6">
        {/* Tab Selector */}
        <div className="flex mb-2 sm:mb-3 lg:mb-4 border border-(--border-color) w-fit rounded-full">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
            activeTab === 'drivers'
              ? 'opacity-100'
              : ''
          }`}
          style={{
            backgroundColor: activeTab === 'drivers' ? 'var(--primary-color)' : '',
            color: activeTab === 'drivers' ? '#ffffff' : 'var(--text-color)',
          }}
        >
          Drivers
        </button>
          <button
            onClick={() => setActiveTab('constructors')}
            className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
            activeTab === 'constructors'
              ? 'opacity-100'
              : ''
          }`}
          style={{
            backgroundColor: activeTab === 'constructors' ? 'var(--primary-color)' : '',
            color: activeTab === 'constructors' ? '#ffffff' : 'var(--text-color)',
          }}
        >
          Constructors
        </button>
      </div>

      {/* Drivers Table */}
      {activeTab === 'drivers' && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--header-bg)',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <th
                    className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Rank
                  </th>
                  <th
                    className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Driver
                  </th>
                  <th
                    className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Constructor
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Points
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Wins
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Podiums
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedDrivers.map((driver, index) => (
                  <tr
                    key={driver.rank}
                    className="transition-colors duration-150 hover:opacity-80"
                    style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--bg-color)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <td
                      className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {driver.rank}
                    </td>
                    <td className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4">
                      <div className="flex flex-col">
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {driver.driver.abbreviation}
                        </span>
                        <span
                          className="text-xs opacity-70"
                          style={{ color: 'var(--text-color)' }}
                        >
                          {driver.driver.nationality}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-2 px-4"
                      style={{ color: 'var(--text-color)', opacity: 0.8 }}
                    >
                      {driver.constructor}
                    </td>
                    <td
                      className="py-2 px-4 text-right font-semibold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {driver.points}
                    </td>
                    <td
                      className="py-2 px-4 text-right"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {driver.wins}
                    </td>
                    <td
                      className="py-2 px-4 text-right"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {driver.podiums}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {driversData.length > 5 && (
            <div
              className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-center"
              style={{
                backgroundColor: 'var(--header-bg)',
              }}
            >
              <button
                onClick={toggleDriversExpand}
                className="flex items-center justify-center gap-2 mx-auto transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--primary-color)' }}
              >
                {driversExpanded ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show All Drivers ({driversData.length})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Constructors Table */}
      {activeTab === 'constructors' && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--header-bg)',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <th
                    className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Rank
                  </th>
                  <th
                    className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 text-left text-xs sm:text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Constructor
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Points
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Wins
                  </th>
                  <th
                    className="py-2 px-4 text-right text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    Podiums
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedConstructors.map((constructor, index) => (
                  <tr
                    key={constructor.rank}
                    className="transition-colors duration-150 hover:opacity-80"
                    style={{
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--bg-color)',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <td
                      className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {constructor.rank}
                    </td>
                    <td
                      className="py-1 sm:py-1.5 lg:py-2 px-2 sm:px-3 lg:px-4 font-semibold text-xs sm:text-sm"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {constructor.constructor}
                    </td>
                    <td
                      className="py-2 px-4 text-right font-semibold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {constructor.points}
                    </td>
                    <td
                      className="py-2 px-4 text-right"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {constructor.wins}
                    </td>
                    <td
                      className="py-2 px-4 text-right"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {constructor.podiums}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {constructorsData.length > 5 && (
            <div
              className="px-4 py-2 text-center border-t"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--header-bg)',
              }}
            >
              <button
                onClick={toggleConstructorsExpand}
                className="flex items-center justify-center gap-2 mx-auto transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--primary-color)' }}
              >
                {constructorsExpanded ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show All Constructors ({constructorsData.length})</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StandingsGrid;

