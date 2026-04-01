import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import React, { useRef } from 'react';
import {
  queryCommunityList,
  updateClubAuditStatus,
  updateClubBanStatus,
} from '@/services/club-management/api';

const statusTextMap: Record<API.AuditStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

const statusColorMap: Record<API.AuditStatus, string> = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};

const mapCommunityToClubReviewItem = (
  item: API.ClubReviewItem | API.CommunityEntity,
): API.ClubReviewItem => {
  if ('clubId' in item) {
    return item;
  }

  return {
    clubId: String(item.id),
    clubName: item.community_name,
    creatorId: item.creator_id,
    auditStatus: item.status,
    banStatus: item.ban_status || 'normal',
    createTime: item.created_time,
  };
};

const ClubReviewPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { initialState } = useModel('@@initialState');

  const onAudit = async (
    clubId: string,
    auditStatus: Exclude<API.AuditStatus, 'pending'>,
  ) => {
    try {
      await updateClubAuditStatus({
        communityId: Number(clubId),
        status: auditStatus,
        reviewerId: initialState?.currentUser?.userid,
        reviewRemark: '',
      });
      message.success(auditStatus === 'approved' ? '审核通过成功' : '审核拒绝成功');
      actionRef.current?.reload();
    } catch (_error) {
      message.error('审核操作失败，请检查后端接口');
    }
  };

  const onBanSwitch = async (clubId: string, banStatus: API.BanStatus) => {
    try {
      await updateClubBanStatus({
        communityId: Number(clubId),
        banStatus,
      });
      message.success(banStatus === 'banned' ? '社团封禁成功' : '社团解封成功');
      actionRef.current?.reload();
    } catch (_error) {
      message.error('封禁操作失败，请检查后端接口');
    }
  };

  const columns: ProColumns<API.ClubReviewItem>[] = [
      {
        title: '社团名',
        dataIndex: 'clubName',
      },
      {
        title: '社团ID',
        dataIndex: 'clubId',
      },
      // {
      //   title: '用户ID',
      //   dataIndex: 'userId',
      //   hideInTable: true,
      // },
      {
        title: '创建者ID',
        dataIndex: 'creatorId',
      },
      {
        title: '审核状态',
        dataIndex: 'auditStatus',
        valueType: 'select',
        valueEnum: {
          pending: { text: '待审核' },
          approved: { text: '已通过' },
          rejected: { text: '已拒绝' },
        },
        render: (_, row) => <Tag color={statusColorMap[row.auditStatus]}>{statusTextMap[row.auditStatus]}</Tag>,
      },
      {
        title: '封禁状态',
        dataIndex: 'banStatus',
        valueType: 'select',
        valueEnum: {
          normal: { text: '正常' },
          banned: { text: '已封禁' },
        },
        render: (_, row) => (
          <Tag color={row.banStatus === 'banned' ? 'error' : 'success'}>
            {row.banStatus === 'banned' ? '已封禁' : '正常'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (_, row) => row.createTime || '-',
        search: false,
      },
      {
        title: '操作',
        valueType: 'option',
        search: false,
        render: (_, row) => (
          <Space>
            <Popconfirm
              title="确认通过该社团审核？"
              onConfirm={() => onAudit(row.clubId, 'approved')}
              disabled={row.auditStatus === 'approved'}
            >
              <Button type="link" disabled={row.auditStatus === 'approved'}>
                通过
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认拒绝该社团审核？"
              onConfirm={() => onAudit(row.clubId, 'rejected')}
              disabled={row.auditStatus === 'rejected'}
            >
              <Button type="link" danger disabled={row.auditStatus === 'rejected'}>
                拒绝
              </Button>
            </Popconfirm>
            <Popconfirm
              title={row.banStatus === 'banned' ? '确认解封该社团？' : '确认封禁该社团？'}
              onConfirm={() =>
                onBanSwitch(row.clubId, row.banStatus === 'banned' ? 'normal' : 'banned')
              }
            >
              <Button type="link">{row.banStatus === 'banned' ? '解封' : '封禁'}</Button>
            </Popconfirm>
          </Space>
        ),
      },
  ];

  return (
    <PageContainer title="社团审核">
      <ProTable<API.ClubReviewItem>
        actionRef={actionRef}
        rowKey="clubId"
        headerTitle="社团审核列表"
        columns={columns}
        search={{
          labelWidth: 98,
          defaultCollapsed: false,
        }}
        pagination={{
          pageSize: 8,
        }}
        request={async (params) => {
          try {
            const p = params as {
              current?: number;
              pageSize?: number;
              clubName?: string;
              clubId?: string;
              creatorId?: string;
              auditStatus?: API.AuditStatus;
              banStatus?: API.BanStatus;
              userId?: string;
            };

            const result = await queryCommunityList({
              userId: p.userId ? Number(p.userId) : undefined,
              communityId: p.clubId ? Number(p.clubId) : undefined,
              communityName: p.clubName,
              creatorId: p.creatorId ? Number(p.creatorId) : undefined,
              status: p.auditStatus,
              banStatus: p.banStatus,
              page: p.current,
              pageSize: p.pageSize,
            });

            const isSuccess =
              result.code === 0 || (result.code === undefined && Array.isArray(result.list));

            if (!isSuccess) {
              message.error(result.msg || '查询失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }

            const list = Array.isArray(result.list) ? result.list : [];
            return {
              data: list.map(mapCommunityToClubReviewItem),
              success: true,
              total: Number(result.total || list.length),
            };
          } catch (error) {
            message.error('获取社团列表失败，请检查后端服务');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        toolbar={{
          title: '支持按社团名、社团ID、创建者ID、审核状态、封禁状态查询',
        }}
      />
    </PageContainer>
  );
};

export default ClubReviewPage;
