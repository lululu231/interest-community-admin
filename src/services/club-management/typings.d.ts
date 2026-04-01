declare namespace API {
  type AuditStatus = 'pending' | 'approved' | 'rejected';

  type BanStatus = 'normal' | 'banned';

  type QueryMode = 'separate' | 'combined';

  // 与后端 service 的 relation 对齐（用户和社团关系）
  type QueryRelation = 'joined' | 'pending' | 'reject' | 'none';

  type ClubReviewItem = {
    clubId: string;
    clubName: string;
    creatorId: string;
    auditStatus: AuditStatus;
    banStatus: BanStatus;
    relation?: QueryRelation;
    createTime?: string;
  };

  // 与后端 community 表字段对齐
  type CommunityEntity = {
    id: number;
    community_name: string;
    creator_id: string;
    status: AuditStatus;
    created_time?: string;
    ban_status?: BanStatus;
    relation?: QueryRelation;
  };

  // 后端：GET /community/query 入参
  type CommunityQueryParams = {
    userId?: number;
    communityId?: number;
    communityName?: string;
    creatorId?: number;
    status?: AuditStatus;
    relation?: QueryRelation;
    banStatus?: BanStatus;
    page?: number;
    pageSize?: number;
  };

  // 后端：GET /community/query 返回
  type CommunityQueryResult = {
    code: 0 | 1;
    msg?: string;
    list?: CommunityEntity[];
    total?: number;
  };

  type ReviewCommunityBody = {
    communityId: number;
    status: Exclude<AuditStatus, 'pending'>;
    reviewerId?: string;
    reviewRemark?: string;
  };

  type UpdateClubBanStatusBody = {
    communityId: number;
    banStatus: BanStatus;
  };

  type CommonResult = {
    success?: boolean;
    message?: string;
  };
}
