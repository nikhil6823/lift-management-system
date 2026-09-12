import { CreditCard, Download, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Loader } from '../../components/common/Loader';
import { downloadInvoiceReceipt, getInvoices, recordOnlinePayment } from '../../services/invoiceService';
import { useFetch } from '../../hooks/useFetch';

function saveFile(blob, name) { const url = globalThis.URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); globalThis.URL.revokeObjectURL(url); }

export default function CustomerBilling() {
  const invoices = useFetch(getInvoices, []);
  const [paying, setPaying] = useState(null);
  const [method, setMethod] = useState('upi');
  const [notice, setNotice] = useState('');
  const pay = async (event) => { event.preventDefault(); try { await recordOnlinePayment(paying._id, { method, amount: paying.balance }); setPaying(null); setNotice('Payment recorded. Your receipt is ready to download.'); invoices.reload(); } catch (reason) { setNotice(reason.message); } };
  const receipt = async (invoice) => { try { saveFile(await downloadInvoiceReceipt(invoice._id), `${invoice.invoiceNumber}-receipt.txt`); } catch (reason) { setNotice(reason.message); } };
  if (invoices.loading) return <Loader label="Loading invoices" />;
  const paid = invoices.data.filter((invoice) => invoice.status === 'paid');
  return <><div className="page-heading"><div><span className="eyebrow">Billing centre</span><h1>Invoices & payments</h1><p>View invoices, record an online payment, and download itemized receipts.</p></div></div>{notice && <div className="alert">{notice}</div>}{paying && <section className="form-card"><h2>Pay {paying.invoiceNumber}</h2><form className="form-grid" onSubmit={pay}><label>Payment method<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="upi">UPI</option><option value="card">Card</option><option value="bank-transfer">Bank transfer</option></select></label><label>Amount<input readOnly value={`₹${Number(paying.balance).toFixed(2)}`} /></label><p className="form-help full">This records a payment in the app. Connect a payment gateway before using it for real transactions.</p><div className="form-actions"><button type="button" className="secondary" onClick={() => setPaying(null)}>Cancel</button><button><CreditCard size={16} /> Record payment</button></div></form></section>}<section className="invoice-list">{invoices.data.map((invoice) => <article className="invoice-card" key={invoice._id}><div><span className="eyebrow">{invoice.invoiceNumber}</span><h3>{invoice.description}</h3><p>{invoice.lift?.code || 'Account charge'} · Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'on receipt'}</p></div><div className="invoice-amount"><strong>₹{Number(invoice.balance).toFixed(2)}</strong><span className={`badge invoice-${invoice.status}`}>{invoice.status}</span></div><div className="invoice-actions">{invoice.balance > 0 && <button onClick={() => setPaying(invoice)}><CreditCard size={16} /> Pay online</button>}<button className="secondary" onClick={() => receipt(invoice)}><Download size={16} /> Receipt</button></div>{invoice.payments?.length > 0 && <p className="invoice-history"><ReceiptText size={15} /> {invoice.payments.length} payment{invoice.payments.length > 1 ? 's' : ''} recorded</p>}</article>)}{!invoices.data.length && <p className="empty-state">No invoices have been issued to this account.</p>}</section>{paid.length > 0 && <p className="section-caption">Payment history includes {paid.length} paid invoice{paid.length > 1 ? 's' : ''}.</p>}</>;
}
