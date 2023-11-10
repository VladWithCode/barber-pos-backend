import { Types, isValidObjectId } from 'mongoose';

export async function asyncHandler<T>(
  p: Promise<T>,
): Promise<[any | undefined, T | undefined]> {
  try {
    return [, await p];
  } catch (e) {
    return [e, undefined];
  }
}

export function numberToSafeAmount(n: number): number {
  let safeN = 0;
  const [i, d] = n.toFixed(2).split('.');

  safeN += parseInt(d);

  safeN += parseInt(i) * 100;

  return safeN;
}

export function numberToCurrency(n: number) {
  const withDecs = n / 100;
  const [int, decs] = withDecs.toFixed(2).split('.');

  return `$${(+int).toLocaleString()}.${decs || '00'}`;
}

export function isValidId(s: string): boolean {
  let testStr = '';
  if (s.length === 12) testStr = new Types.ObjectId(s).toString();
  else return isValidObjectId(s);

  return testStr === s;
}

const formatter = Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  day: 'numeric',
  month: 'long',
});

export function dateToLongDate(d: Date) {
  return formatter.format(d);
}
