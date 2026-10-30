import { MOUSE, TOUCH } from 'three';

// Keep right-drag and two-finger pan available even when single-drag rotates.
export function configurePanControls(controls, pan) {
  controls.mouseButtons.LEFT = pan ? MOUSE.PAN : MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = MOUSE.PAN;
  controls.touches.ONE = pan ? TOUCH.PAN : TOUCH.ROTATE;
  controls.touches.TWO = TOUCH.DOLLY_PAN;
}
