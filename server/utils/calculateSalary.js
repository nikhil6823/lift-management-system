export function calculateSalary({ baseSalary, allowances = 0, deductions = 0 }) {
  return Math.max(0, Number(baseSalary) + Number(allowances) - Number(deductions));
}

