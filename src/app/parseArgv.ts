export interface AppArgs {
  [key: string]: string;
}

export const parseArgv = <T>([node, file, ...argv]: string[]): T => {
  const parsedArgs = {};
  argv.forEach((arg) => {
    const [key, value] = arg.split('=');
    parsedArgs[key] = value;
  });
  return parsedArgs as T;
};
