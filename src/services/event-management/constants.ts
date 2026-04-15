export const EVENT_API_PREFIX = 'http://localhost:3000/event';

export const REVIEW_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export const BAN_STATUS = {
  NORMAL: 0,
  BANNED: 1,
} as const;

export const REVIEW_STATUS_TEXT: Record<number, string> = {
  [REVIEW_STATUS.PENDING]: '待审核',
  [REVIEW_STATUS.APPROVED]: '已通过',
  [REVIEW_STATUS.REJECTED]: '已拒绝',
};

export const BAN_STATUS_TEXT: Record<number, string> = {
  [BAN_STATUS.NORMAL]: '正常',
  [BAN_STATUS.BANNED]: '已封禁',
};
