import { mkdir, access, writeFile } from 'fs/promises';
import { formatISO } from 'date-fns';

export class Helpers {
  // User should be able to define a path outside this package
  public createDirectory(path: string): Promise<string | undefined> {
    console.log(`Creating path: ${path}`);
    return mkdir(path, { recursive: true });
  }

  public directoryExists(path: string): Promise<void> {
    return access(path);
  }

  public formatDate(date: Date): string {
    const basicISO = formatISO(date, { format: 'basic' });
    return basicISO.split('+')[0];
  }

  public writeToFile(path: string, data: any): Promise<void> {
    return writeFile(path, data);
  }
}

export const helpers = new Helpers();
