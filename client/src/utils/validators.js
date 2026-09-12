export const required = (value, label) => value?.toString().trim() ? '' : `${label} is required`;
export const positiveNumber = (value, label) => Number(value) >= 0 ? '' : `${label} must be zero or greater`;
