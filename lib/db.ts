import Dexie, { type Table } from 'dexie'
import type { RewardCard, ReadingChallenge, JumpRopeDay, Deduction, PetPoint } from './types'

class RewardsDB extends Dexie {
  rewards!: Table<RewardCard, string>
  readingChallenges!: Table<ReadingChallenge, string>
  jumpRopeDays!: Table<JumpRopeDay, string>
  deductions!: Table<Deduction, string>
  petPoints!: Table<PetPoint, string>

  constructor() {
    super('RewardsDB')
    this.version(3).stores({
      rewards: 'id, type, source, status, createdAt',
      readingChallenges: 'id, status, completedDate, createdAt',
      jumpRopeDays: 'id, date, status, redeemedBatchId, createdAt',
      deductions: 'id, redeemed, createdAt',
      petPoints: 'id, source, spent, createdAt',
    })
  }
}

function createDB(): RewardsDB | null {
  try {
    if (typeof indexedDB === 'undefined') return null
    return new RewardsDB()
  } catch {
    return null
  }
}

export const db = createDB()
