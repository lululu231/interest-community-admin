import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import React, { useRef } from 'react';
import {
  approveEvent,
  banEvent,
  queryAllEvents,
  rejectEvent,
  type EventItem,
  unbanEvent,
} from '@/services/event-management/api';
import {
  BAN_STATUS,
  BAN_STATUS_TEXT,
  REVIEW_STATUS,
  REVIEW_STATUS_TEXT,
} from '@/services/event-management/constants';

const reviewColorMap: Record<number, string> = {
  [REVIEW_STATUS.PENDING]: 'processing',
  [REVIEW_STATUS.APPROVED]: 'success',
  [REVIEW_STATUS.REJECTED]: 'error',
};

const banColorMap: Record<number, string> = {
  [BAN_STATUS.NORMAL]: 'success',
  [BAN_STATUS.BANNED]: 'error',
};

const EventReviewPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const { initialState } = useModel('@@initialState');

  const handleReview = async (row: EventItem, reviewStatus: 1 | 2) => {
    try {
      if (reviewStatus === REVIEW_STATUS.APPROVED) {
        await approveEvent({
          eventId: row.id,
          reviewStatus,
          reviewerId: initialState?.currentUser?.userid,
          reviewRemark: '',
        });
      } else {
        await rejectEvent({
          eventId: row.id,
          reviewStatus,
          reviewerId: initialState?.currentUser?.userid,
          reviewRemark: '',
        });
      }
      message.success(reviewStatus === 1 ? '活动审核通过' : '活动审核拒绝');
      actionRef.current?.reload();
    } catch (_error) {
      message.error('审核接口暂未就绪或调用失败');
    }
  };

  const handleBanSwitch = async (row: EventItem, nextBanStatus: 0 | 1) => {
    try {
      if (nextBanStatus === BAN_STATUS.BANNED) {
        await banEvent({ eventId: row.id });
        message.success('活动已封禁');
      } else {
        await unbanEvent({ eventId: row.id });
        message.success('活动已解封');
      }
      actionRef.current?.reload();
    } catch (_error) {
      message.error('封禁接口暂未就绪或调用失败');
    }
  };

  const columns: ProColumns<EventItem>[] = [
    {
      title: '活动名',
      dataIndex: 'title',
    },
    {
      title: '活动ID',
      dataIndex: 'id',
    },
    {
      title: '负责人ID',
      dataIndex: 'admin_id',
    },
    {
      title: '所属社团',
      dataIndex: 'community_id',
    },
    {
      title: '审核状态',
      dataIndex: 'review_status',
      valueType: 'select',
      valueEnum: {
        [REVIEW_STATUS.PENDING]: { text: '待审核' },
        [REVIEW_STATUS.APPROVED]: { text: '已通过' },
        [REVIEW_STATUS.REJECTED]: { text: '已拒绝' },
      },
      render: (_, row) => (
        <Tag color={reviewColorMap[row.review_status]}>
          {REVIEW_STATUS_TEXT[row.review_status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '封禁状态',
      dataIndex: 'is_banned',
      valueType: 'select',
      valueEnum: {
        [BAN_STATUS.NORMAL]: { text: '正常' },
        [BAN_STATUS.BANNED]: { text: '已封禁' },
      },
      render: (_, row) => (
        <Tag color={banColorMap[row.is_banned]}>
          {BAN_STATUS_TEXT[row.is_banned] || '未知'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      search: false,
      render: (_, row) => row.created_at || '-',
    },
    {
      title: '操作',
      valueType: 'option',
      search: false,
      render: (_, row) => (
        <Space>
          <Popconfirm
            title="确认通过该活动审核？"
            onConfirm={() => handleReview(row, REVIEW_STATUS.APPROVED)}
            disabled={row.review_status === REVIEW_STATUS.APPROVED}
          >
            <Button type="link" disabled={row.review_status === REVIEW_STATUS.APPROVED}>
              通过
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认拒绝该活动审核？"
            onConfirm={() => handleReview(row, REVIEW_STATUS.REJECTED)}
            disabled={row.review_status === REVIEW_STATUS.REJECTED}
          >
            <Button type="link" danger disabled={row.review_status === REVIEW_STATUS.REJECTED}>
              拒绝
            </Button>
          </Popconfirm>
          <Popconfirm
            title={row.is_banned === 1 ? '确认解封该活动？' : '确认封禁该活动？'}
            onConfirm={() =>
              handleBanSwitch(
                row,
                row.is_banned === BAN_STATUS.BANNED
                  ? BAN_STATUS.NORMAL
                  : BAN_STATUS.BANNED,
              )
            }
          >
            <Button type="link">{row.is_banned === 1 ? '解封' : '封禁'}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="活动审核">
      <ProTable<EventItem>
        actionRef={actionRef}
        rowKey="id"
        headerTitle="活动审核列表"
        columns={columns}
        search={{
          labelWidth: 98,
          defaultCollapsed: false,
        }}
        request={async (params) => {
          try {
            const response = await queryAllEvents({
              current: params.current,
              pageSize: params.pageSize,
              title: params.title as string | undefined,
              id: params.id ? Number(params.id) : undefined,
              admin_id: params.admin_id ? Number(params.admin_id) : undefined,
              community_id: params.community_id
                ? Number(params.community_id)
                : undefined,
              review_status:
                params.review_status !== undefined
                  ? Number(params.review_status)
                  : undefined,
              is_banned:
                params.is_banned !== undefined
                  ? Number(params.is_banned)
                  : undefined,
            });

            const list = Array.isArray(response.list)
              ? response.list
              : Array.isArray(response.data)
                ? response.data
                : [];

            return {
              data: list,
              success: response.code === undefined || response.code === 0,
              total: Number(response.total || list.length),
            };
          } catch (_error) {
            message.error('获取活动列表失败，请检查后端服务');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
      />
    </PageContainer>
  );
};

export default EventReviewPage;
