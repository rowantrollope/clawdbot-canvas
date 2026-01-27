import type { ComponentType } from 'react';

// Component registry for custom cards
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentRegistry: Map<string, ComponentType<any>> = new Map();

/** Register a custom card component */
export function registerCardComponent<P extends object>(
  name: string,
  component: ComponentType<P>
): void {
  componentRegistry.set(name, component);
}

/** Get a registered component by name */
export function getCardComponent(name: string): ComponentType<unknown> | undefined {
  return componentRegistry.get(name);
}
