import { formatDate } from '../../utils/dateHelpers';
import { Table } from '../common/Table';
export function ExpenseTable({ expenses, onReview }) { return <Table rows={expenses} empty="No expenses to show." columns={[{ label: 'Date', render: (r) => formatDate(r.expenseDate) }, { label: 'Employee', render: (r) => r.employee?.user?.name || 'You' }, { label: 'Category', key: 'category' }, { label: 'Description', key: 'description' }, { label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString()}` }, { label: 'Status', render: (r) => <button className={`badge ${r.status}`} onClick={() => onReview?.(r)}>{r.status}</button> }]} />; }

