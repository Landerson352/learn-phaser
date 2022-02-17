import { Point, ScreenCoords, Segment } from './types';
import { SCREEN, SCREEN_CENTER } from './constants';
import { Camera } from './camera';

export const drawSegment = (
  graphics: Phaser.GameObjects.Graphics,
  segment: Segment,
  p1: ScreenCoords,
  p2: ScreenCoords,
  isBase?: boolean
) => {
  // draw grass
  graphics.fillStyle(segment.color.grass, 1);
  graphics.fillRect(0, p2.y, SCREEN.W, p1.y - p2.y);

  // draw road
  drawPolygon(
    graphics,
    p1.x - p1.w,
    p1.y,
    p1.x + p1.w,
    p1.y,
    p2.x + p2.w,
    p2.y,
    p2.x - p2.w,
    p2.y,
    isBase ? 0xff_99_cc : segment.color.road
  );

  // draw rumble strips
  const rumble_w1 = p1.w / 5;
  const rumble_w2 = p2.w / 5;
  drawPolygon(
    graphics,
    p1.x - p1.w - rumble_w1,
    p1.y,
    p1.x - p1.w,
    p1.y,
    p2.x - p2.w,
    p2.y,
    p2.x - p2.w - rumble_w2,
    p2.y,
    segment.color.rumble
  );
  drawPolygon(
    graphics,
    p1.x + p1.w + rumble_w1,
    p1.y,
    p1.x + p1.w,
    p1.y,
    p2.x + p2.w,
    p2.y,
    p2.x + p2.w + rumble_w2,
    p2.y,
    segment.color.rumble
  );

  const roadLanes = 3;

  // draw lanes
  if (segment.color.lane) {
    const line_w1 = p1.w / 20 / 2;
    const line_w2 = p2.w / 20 / 2;

    const lane_w1 = (p1.w * 2) / roadLanes;
    const lane_w2 = (p2.w * 2) / roadLanes;

    let lane_x1 = p1.x - p1.w;
    let lane_x2 = p2.x - p2.w;

    for (let i = 1; i < roadLanes; i += 1) {
      lane_x1 += lane_w1;
      lane_x2 += lane_w2;

      drawPolygon(
        graphics,
        lane_x1 - line_w1,
        p1.y,
        lane_x1 + line_w1,
        p1.y,
        lane_x2 + line_w2,
        p2.y,
        lane_x2 - line_w2,
        p2.y,
        segment.color.lane
      );
    }
  }
};

export const drawPolygon = (
  graphics: Phaser.GameObjects.Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  color: number
) => {
  graphics.fillStyle(color, 1);
  graphics.beginPath();

  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);
  graphics.lineTo(x3, y3);
  graphics.lineTo(x4, y4);

  graphics.closePath();
  graphics.fill();
};

export const project3D = (
  point: Point,
  camera: Camera,
  width: number,
  offsetZ: number,
  offsetX: number
) => {
  // translate world coordinates to camera coordinates
  const transX = point.world.x - camera.x + offsetX;
  const transY = point.world.y - camera.y;
  const transZ = point.world.z - camera.z + offsetZ;

  // scaling factor baded on the law of similar triangles
  point.scale = camera.distToPlane / transZ;

  // projecting camera coordinates onto a normalized projection plane
  const projectedX = point.scale * transX;
  const projectedY = point.scale * transY;
  const projectedW = point.scale * width;

  // scaling projected coordinates to the screen coordinates
  point.screen.x = Math.round((1 + projectedX) * SCREEN_CENTER.X);
  point.screen.y = Math.round((1 - projectedY) * SCREEN_CENTER.Y);
  point.screen.w = Math.round(projectedW * SCREEN_CENTER.X);
};