import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
const mockFirebase = {
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  firestore: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}

vi.mock('@/lib/firebase', () => mockFirebase)
vi.mock('@/lib/auth', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    signInWithEmail: vi.fn(),
    signOut: vi.fn(),
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project' 