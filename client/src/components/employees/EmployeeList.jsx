import { EmployeeCard } from './EmployeeCard';
export function EmployeeList({ employees, onRemove }) { return <div className="card-grid">{employees.map((employee) => <EmployeeCard key={employee._id} employee={employee} onRemove={onRemove} />)}</div>; }

