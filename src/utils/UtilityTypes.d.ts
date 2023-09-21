export type EnsureOneProp<T, K extends keyof T> = {
  [P in K]: T[P];
};
