import { request } from '@umijs/max';
import { EVENT_API_PREFIX } from './constants';

export type EventItem = {
  id: number;
  title: string;
  admin_id: number | string;
  community_id: number | string;
  review_status: number;
  is_banned: number;
  created_at?: string;
};

export type EventListResult = {
  code?: number;
  message?: string;
  msg?: string;
  data?: EventItem[];
  list?: EventItem[];
  total?: number;
};

export type EventQueryParams = {
  current?: number;
  pageSize?: number;
  title?: string;
  id?: number;
  admin_id?: number;
  community_id?: number;
  review_status?: number;
  is_banned?: number;
};

export type EventReviewPayload = {
  eventId: number;
  reviewStatus: 1 | 2;
  reviewerId?: string | number;
  reviewRemark?: string;
};

export type EventBanPayload = {
  eventId: number;
};

export async function queryAllEvents(
  params: EventQueryParams,
  options?: Record<string, unknown>,
) {
  return request<EventListResult>(`${EVENT_API_PREFIX}/all`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 预留：后端后续补齐
export async function approveEvent(
  payload: EventReviewPayload,
  options?: Record<string, unknown>,
) {
  return request(`${EVENT_API_PREFIX}/review/approve`, {
    method: 'POST',
    data: payload,
    ...(options || {}),
  });
}

// 预留：后端后续补齐
export async function rejectEvent(
  payload: EventReviewPayload,
  options?: Record<string, unknown>,
) {
  return request(`${EVENT_API_PREFIX}/review/reject`, {
    method: 'POST',
    data: payload,
    ...(options || {}),
  });
}

// 预留：后端后续补齐
export async function banEvent(
  payload: EventBanPayload,
  options?: Record<string, unknown>,
) {
  return request(`${EVENT_API_PREFIX}/ban`, {
    method: 'POST',
    data: payload,
    ...(options || {}),
  });
}

// 预留：后端后续补齐
export async function unbanEvent(
  payload: EventBanPayload,
  options?: Record<string, unknown>,
) {
  return request(`${EVENT_API_PREFIX}/unban`, {
    method: 'POST',
    data: payload,
    ...(options || {}),
  });
}
