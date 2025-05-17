// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useParams() {
    return {
      id: '123',
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(() => null),
    };
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => {
      return { data: null, status: 'unauthenticated' };
    }),
    getSession: jest.fn(() => null),
  };
});

// Remove next/image JSX mock for API tests
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props) => {
//     // eslint-disable-next-line @next/next/no-img-element
//     return <img {...props} />;
//   },
// }));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock TextEncoder and TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock mongoose
jest.mock('@/app/lib/mongoose', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock User model
jest.mock('@/app/models/User', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

// Mock Room model
jest.mock('@/app/models/Room', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
  },
})); 