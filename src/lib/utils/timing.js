export function createTimer(label) {
  const start = performance.now();

  return {
    end() {
      const duration =
        performance.now() - start;

      console.log(
        `[${label}] ${duration.toFixed(0)}ms`
      );

      return duration;
    },
  };
}