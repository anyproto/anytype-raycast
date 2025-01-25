import { exec as execCallback } from "child_process";
import { promisify } from "util";

export async function isAnytypeRunning(): Promise<boolean> {
  const exec = promisify(execCallback);
  try {
    const { stdout } = await exec("pgrep anytype");
    return stdout !== "";
  } catch {
    return false;
  }
}

export async function openAppInBackground(name: string = "Anytype") {
  const exec = promisify(execCallback);
  try {
    await exec(`osascript -e 'tell application "${name}" to launch'`);
  } catch (error) {
    console.error(`Failed to open ${name} in background:`, error);
  }
}

export async function waitForAnytypeOpen() {
  return new Promise<void>((resolve) => {
    const interval = setInterval(async () => {
      const running = await isAnytypeRunning();
      if (running) {
        clearInterval(interval);
        setTimeout(resolve, 1500); // wait additionally to ensure api is ready
      }
    }, 1000);
  });
}
