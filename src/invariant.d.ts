declare module 'invariant' {
  export default function invariant(
    condition: unknown,
    format?: string,
    ...args: unknown[]
  ): asserts condition;
}
