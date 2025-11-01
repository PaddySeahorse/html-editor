type Procedure<Args extends unknown[]> = (...args: Args) => void;
type DebouncedFunction<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void;
};

export function debounce<Args extends unknown[]>(
  func: Procedure<Args>,
  wait: number
): DebouncedFunction<Args> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced: DebouncedFunction<Args> = ((...args: Args) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  }) as DebouncedFunction<Args>;

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
