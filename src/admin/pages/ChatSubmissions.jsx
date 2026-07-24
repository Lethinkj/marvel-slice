import SubmissionsInbox from '../components/ui/SubmissionsInbox';

const columns = [
  { header: 'Name', accessor: 'user_name', className: 'min-w-[140px]' },
  { header: 'Email', accessor: 'user_email', className: 'min-w-[180px]' },
  { header: 'Phone', accessor: 'user_phone', className: 'min-w-[120px]' },
  { header: 'Reason', accessor: 'reason', className: 'min-w-[140px]' },
  { header: 'Rating', accessor: 'rating', className: 'min-w-[100px]' },
  { header: 'Feedback', accessor: 'feedback', className: 'min-w-[200px]' },
  { header: 'Resolved', accessor: 'issue_resolved', className: 'min-w-[100px]' },
  { header: 'Status', accessor: 'status', className: 'min-w-[100px]' },
  { header: 'Date', accessor: 'created_at', className: 'min-w-[140px]' },
];

const detailFields = [
  { label: 'Name', accessor: 'user_name' },
  { label: 'Email', accessor: 'user_email' },
  { label: 'Phone', accessor: 'user_phone' },
  { label: 'Reason', accessor: 'reason' },
  { label: 'Rating', accessor: 'rating' },
  { label: 'Feedback', accessor: 'feedback' },
  { label: 'Resolved', accessor: 'issue_resolved' },
  { label: 'Status', accessor: 'status' },
  { label: 'Date', accessor: 'created_at' },
  { label: 'Closed', accessor: 'closed_at' },
];

export default function ChatSubmissions() {
  return (
    <SubmissionsInbox
      table="conversations"
      title="Chat Submissions"
      columns={columns}
      detailFields={detailFields}
      exportFilename="chat-submissions"
      disableReply
    />
  );
}
