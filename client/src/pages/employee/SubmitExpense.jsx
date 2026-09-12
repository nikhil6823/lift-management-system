import { ExpenseForm } from '../../components/expenses/ExpenseForm';
import { ExpenseTable } from '../../components/expenses/ExpenseTable';
import { Loader } from '../../components/common/Loader';
import { createExpense, getExpenses } from '../../services/expenseService';
import { useFetch } from '../../hooks/useFetch';
import { useState } from 'react';

export default function SubmitExpense() { const expenses = useFetch(getExpenses, []); const [message, setMessage] = useState(''); const save = async (data) => { try { await createExpense(data); setMessage('Expense submitted for review.'); expenses.reload(); } catch (e) { setMessage(e.message); } }; return <><div className="page-heading"><div><span className="eyebrow">Reimbursements</span><h1>Submit an expense</h1><p>Record field costs while the details are still fresh.</p></div></div>{message && <div className="alert">{message}</div>}<section className="form-card"><ExpenseForm onSave={save} /></section>{expenses.loading ? <Loader /> : <ExpenseTable expenses={expenses.data} />}</>; }

