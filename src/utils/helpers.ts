export async function asyncHandler<T>(
  p: Promise<T>,
): Promise<[any | undefined, T | undefined]> {
  try {
    return [, await p];
  } catch (e) {
    return [e, undefined];
  }
}
