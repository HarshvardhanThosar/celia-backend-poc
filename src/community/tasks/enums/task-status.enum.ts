export enum TaskStatus {
  COMPLETED = 'completed',
  INVALID = 'invalid',
  ACTIVE = 'active',
  UNATTENDED = 'unattended',
}

export enum ParticipationStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum ScoreAssignmentStatus {
  UNASSIGNED = 'unassigned',
  ASSIGNED = 'assigned',
  REJECTED = 'rejected',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
