import { request } from '@umijs/max';

const CLUB_API_BASE = 'http://localhost:3000';

export async function queryCommunityList(
  params: API.CommunityQueryParams,
  options?: { [key: string]: any },
) {
  return request<API.CommunityQueryResult>(`${CLUB_API_BASE}/community/query`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function updateClubAuditStatus(
  body: API.ReviewCommunityBody,
  options?: { [key: string]: any },
) {
  return request<API.CommonResult>(`${CLUB_API_BASE}/community/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateClubBanStatus(
  body: API.UpdateClubBanStatusBody,
  options?: { [key: string]: any },
) {
  const url =
    body.banStatus === 'banned'
      ? `${CLUB_API_BASE}/community/ban`
      : `${CLUB_API_BASE}/community/unban`;

  return request<API.CommonResult>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      communityId: body.communityId,
    },
    ...(options || {}),
  });
}
