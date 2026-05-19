export type RewardCardType = 'game' | 'pizzahut'
export type CardSource = 'manual' | 'reading' | 'jump_rope'
export type CardStatus = 'active' | 'used'

export interface RewardCard {
  id: string
  type: RewardCardType
  name: string
  imageUrl?: string
  source: CardSource
  sourceRef?: string
  status: CardStatus
  usedAt?: string
  createdAt: string
}

export interface ReadingChallenge {
  id: string
  bookName: string
  completedDate: string
  status: 'active' | 'redeemed'
  redeemedAt?: string
  earnedCardId?: string
  createdAt: string
}

export interface JumpRopeDay {
  id: string
  date: string
  note?: string
  status: 'active' | 'redeemed'
  redeemedBatchId?: string
  createdAt: string
}

export interface Deduction {
  id: string
  reason: string
  points: number
  date: string
  redeemed: boolean
  redeemedBatchId?: string
  createdAt: string
}

export interface PetPoint {
  id: string
  source: 'jump_rope' | 'behavior'
  reason: string
  date: string
  spent: boolean
  spentAt?: string
  createdAt: string
}
