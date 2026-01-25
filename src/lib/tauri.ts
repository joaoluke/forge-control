import { invoke } from "@tauri-apps/api/core";
import { logger } from "./logger";

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    logger.debug(`Invoking command: ${command}`, args);
    const result = await invoke<T>(command, args);
    logger.info(`Command ${command} executed successfully`);
    return result;
  } catch (error) {
    logger.error(`Command ${command} failed`, error);
    throw error;
  }
}

export { invoke };
