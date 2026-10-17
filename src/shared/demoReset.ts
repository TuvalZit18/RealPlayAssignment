// Fired on window when the user presses "Reset demo". The app announces the
// reset; anything that keeps its own demo state (the mock backend) listens.
// This keeps app code from importing the mock.
export const DEMO_RESET_EVENT = 'realplay:demo-reset';

export function announceDemoReset(): void {
  window.dispatchEvent(new Event(DEMO_RESET_EVENT));
}
