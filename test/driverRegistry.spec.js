import { describe, expect, it } from "vitest";

import {
  mergeDriverRecords,
  enrichDriversWithPositions,
  buildDriversByNumber,
} from "../src/common/drivers/driverRegistry.js";
import { processSessionsData, mergeDriversWithPositions } from "../src/common/utils/dataProcessing.js";

describe("mergeDriverRecords", () => {
  it("merges OpenF1 headshots into Ergast drivers by driver_number", () => {
    const ergast = [
      {
        driverId: "hamilton",
        driver_number: 44,
        full_name: "Lewis Hamilton",
        headshot_url: null,
        season: { position: 1, points: 100 },
      },
    ];
    const openF1 = [
      {
        driver_number: 44,
        full_name: "Lewis HAMILTON",
        headshot_url: "https://example.com/lewis.jpg",
        team_name: "Ferrari",
        team_colour: "E80020",
      },
    ];

    const merged = mergeDriverRecords(ergast, openF1);
    expect(merged).toHaveLength(1);
    expect(merged[0].headshot_url).toBe("https://example.com/lewis.jpg");
    expect(merged[0].team_name).toBe("Ferrari");
    expect(merged[0].season.points).toBe(100);
  });
});

describe("mergeDriversWithPositions", () => {
  it("includes drivers only present in position data", () => {
    const drivers = [{ driver_number: 1, full_name: "Driver A" }];
    const positions = [
      { driver_number: 1, position: 1, full_name: "Driver A" },
      { driver_number: 99, position: 2, full_name: "Reserve Driver", team_name: "Team X" },
    ];

    const result = mergeDriversWithPositions(drivers, positions);
    expect(result).toHaveLength(2);
    expect(result[1].driver_number).toBe(99);
    expect(result[1].full_name).toBe("Reserve Driver");
  });
});

describe("processSessionsData", () => {
  it("preserves starting grid position on first insert", () => {
    const positions = [
      {
        session_key: 1,
        session_name: "Race",
        driver_number: 44,
        position: 1,
        startingPosition: 3,
        starting_grid_position: 3,
        date: "2025-03-16T14:00:00Z",
      },
    ];

    const sessions = processSessionsData(positions);
    const driver = sessions[1].drivers[44];
    expect(driver.finalPosition).toBe(1);
    expect(driver.startingPosition).toBe(3);
  });
});

describe("enrichDriversWithPositions", () => {
  it("adds position field from position rows", () => {
    const drivers = [{ driver_number: 1, full_name: "A" }];
    const positions = [{ driver_number: 1, position: 2, finalPosition: 2 }];
    const enriched = enrichDriversWithPositions(drivers, positions);
    expect(enriched[0].position).toBe(2);
  });

  it("buildDriversByNumber maps by number", () => {
    const map = buildDriversByNumber([{ driver_number: 16, full_name: "C" }]);
    expect(map.get(16).full_name).toBe("C");
  });
});
