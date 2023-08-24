
export const debounce = <T extends any[]>(
  cb: (...args: T) => void,
  delay: number = 400
) => {
  let timeout: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};
