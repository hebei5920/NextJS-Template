import { PrismaClient } from '@prisma/client'
import { 
  supabaseStorage, 
  createServerStorage,
  storageTransactions,
  type StorageOperations,
  type StorageResponse
} from './storage'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export { prisma }

// Export Supabase storage utilities
export { 
  supabaseStorage, 
  createServerStorage,
  storageTransactions
}

// Export storage types
export type { 
  StorageOperations,
  StorageResponse
}
