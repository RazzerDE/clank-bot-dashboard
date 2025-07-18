// setup-jest.ts
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// avoid suppressing specific Angular errors in tests (lib bug?)
const suppressed: string[] = ["NG0303: Can't bind to 'innerText' since it isn't a known property of"];
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && suppressed.some(msg => args[0].includes(msg))) {
    return;
  }
  originalError(...args);
};
