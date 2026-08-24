import { NextRequest, NextResponse } from "next/server";
import * as satellite from "satellite.js";

interface SpaceObjectInput {
  name: string;
  line1: string;
  line2: string;
}

export async function POST(req: NextRequest) {
  try {
    const { satellites = [], debris = [] } =
      await req.json();

    const objects = [
      ...satellites.map((s: SpaceObjectInput) => ({
        ...s,
        type: "satellite",
      })),
      ...debris.map((d: SpaceObjectInput) => ({
        ...d,
        type: "debris",
      })),
    ];

    const sats: {
      name: string;
      satrec: satellite.SatRec;
    }[] = [];

    for (const obj of objects) {
      try {
        const satrec = satellite.twoline2satrec(
          obj.line1,
          obj.line2
        );

        if (!satrec.error) {
          sats.push({
            name: obj.name,
            satrec,
          });
        }
      } catch {
        continue;
      }
    }

    const collisions: any[] = [];

    const start = new Date();

    const stepMinutes = 0.25; // 15 sec
    const totalMinutes = 60;

    const steps =
      Math.floor(totalMinutes / stepMinutes) + 1;

    const positions = sats.map((s) => {
      const arr = [];

      for (let k = 0; k < steps; k++) {
        const t = new Date(
          start.getTime() +
            k * stepMinutes * 60 * 1000
        );

        const pv = satellite.propagate(
          s.satrec,
          t
        );

        arr.push(
          pv?.position &&
            typeof pv.position !== "boolean"
            ? pv.position
            : null
        );
      }

      return arr;
    });

    for (let i = 0; i < sats.length; i++) {
      for (let j = i + 1; j < sats.length; j++) {
        let minDistance = Infinity;
        let bestTimeSec = 0;

        for (let k = 0; k < steps; k++) {
          const p1 = positions[i][k];
          const p2 = positions[j][k];

          if (!p1 || !p2) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;

          const dist = Math.sqrt(
            dx * dx +
              dy * dy +
              dz * dz
          );

          if (dist < minDistance) {
            minDistance = dist;
            bestTimeSec =
              Math.floor(
                k *
                  stepMinutes *
                  60
              );
          }
        }

        if (minDistance < 20) {
          let risk = "LOW";

          if (minDistance < 1)
            risk = "CRITICAL";
          else if (minDistance < 5)
            risk = "HIGH";
          else if (minDistance < 10)
            risk = "MEDIUM";

          collisions.push({
            object1: sats[i].name,
            object2: sats[j].name,
            risk,
            closestDistanceKm: minDistance,
            timeToClosestApproachSec:
              bestTimeSec,
          });
        }
      }
    }

    return NextResponse.json({
      totalCollisions:
        collisions.length,
      alerts: collisions,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}