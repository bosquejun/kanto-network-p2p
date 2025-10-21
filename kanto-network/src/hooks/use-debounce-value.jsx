"use client";;
import { useRef, useState } from "react";
import { useDebounceCallback } from "./use-debounce-callback";

/**
 * Custom hook that returns a debounced version of the provided value, along with a function to update it.
 * @param initialValue The value to be debounced
 * @param delay The delay in milliseconds before the value is updated (default is 500ms)
 * @param options Optional configurations for the debouncing behavior
 * @returns An array containing the debounced value and the function to update it
 */
export function useDebounceValue(initialValue, delay, options) {
  const eq = options?.equalityFn ?? ((left, right) => left === right);
  const unwrappedInitialValue =
    initialValue instanceof Function ? initialValue() : initialValue;
  const [debouncedValue, setDebouncedValue] = useState(unwrappedInitialValue);
  const previousValueRef = useRef(unwrappedInitialValue);

  const updateDebouncedValue = useDebounceCallback(setDebouncedValue, delay, options);

  // Update the debounced value if the initial value changes
  if (!eq(previousValueRef.current, unwrappedInitialValue)) {
    updateDebouncedValue(unwrappedInitialValue);
    previousValueRef.current = unwrappedInitialValue;
  }

  return [debouncedValue, updateDebouncedValue];
}