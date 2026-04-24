import { format } from 'date-fns';

export const initialCompanyDetails = {
  logo: '/logo.jpg',
  companyName: 'JOD TECH',
  yourName: '',
  gstinToggle: true,
  gstin: '33FAVPR3433JIZ5',
  address: 'No10, Chitharanjan Street, Chinna Chokkikulam',
  city: 'Madurai',
  state: 'Tamil Nadu',
  country: 'India',
  phone: '96298 72195 - 78679 08377',
  bankName: '',
  accountNo: '',
  ifscCode: '',
  upiId: '',
  paymentMethod: [],
  qrCode: null,
  paymentToggle: false
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

export const defaultNotes = `It was a pleasure working with you. We appreciate the opportunity to support your digital growth. Our team is committed to delivering high-quality solutions and reliable service. Thank you for choosing our IT services.`;

export const defaultTerms = `1. 50% advance payment is required to start the project. Remaining payment must be completed before final delivery.
2. Prices include only the services mentioned in the proposal. Additional work will be charged separately.
3. Domain and hosting are renewable yearly and must be paid before expiry.
4. Project delivery time depends on receiving required content from the client.
5. Digital marketing services are billed monthly as per the selected package.
6. Advance payments are non-refundable once the project has started.
7. Basic support is included for a limited period after delivery.
8. Final files and website access will be provided after full payment.`;

export const descriptionOptions = [
  'Website development',
  'Tools',
  'Domi',
  'Host',
  'Post making',
  'Video Making'
];

export const initialItem = {
  id: '1',
  description: '',
  hsn: '',
  qty: 1,
  rate: 0,
  sgst: 9,
  cgst: 9,
  cess: 0,
  amount: 0,
  months: 1,
  qtyPerMonth: 1
};
