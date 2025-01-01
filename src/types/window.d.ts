declare global {
  interface Window {
    fs: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<any>;
      writeFile?: (path: string, data: string) => Promise<void>;
    };
  }
}

export {};
