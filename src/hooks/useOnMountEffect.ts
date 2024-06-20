import { useEffect, useRef } from 'react';

/**
 * A hook for running some callback *after* the component has mounted.
 */
const useOnMountEffect = (effect: () => void) => {
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    effect();
    mountedRef.current = true;
    // The empty array as the second argument to useEffect makes it run only once,
    // similar to componentDidMount in class components.
  }, [effect]);
};

export default useOnMountEffect;
