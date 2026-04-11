import { format } from 'date-fns';

export const initialCompanyDetails = {
  logo: '',
  companyName: 'JOD TECH',
  yourName: '',
  gstinToggle: true,
  gstin: '33FAVPR3433JIZ5',
  address: 'No10, Chitharanjan Street, Chinna Chokkikulam',
  city: 'Madurai',
  state: 'Tamil Nadu',
  country: 'India',
  phone: '96298 72195 - 78679 08377'
};

export const initialClientDetails = {
  clientCompanyName: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  phone: ''
};

export const initialInvoiceDetails = {
  invoiceType: 'GST', // GST or Non-GST
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  placeOfSupply: 'Tamil Nadu',
};

export const defaultTerms = `1. 50% advance payment required.
2. Remaining payment before delivery.
3. Domain/hosting yearly renewal.
4. Advance payment is non-refundable.
5. Final files will be delivered after full payment.`;

export const initialItem = {
  id: '1',
  description: '',
  hsn: '',
  qty: 1,
  rate: 0,
  sgst: 9,
  cgst: 9,
  cess: 0,
  amount: 0
};
