import React from 'react';
import { format } from 'date-fns';

export default function InvoicePreview({ state }) {
  const { companyDetails, clientDetails, invoiceDetails, items, notes, terms } = state;
  const isGST = invoiceDetails.invoiceType === 'GST';

  // Helper to normalize items against user input errors
  const normalizedItems = items.map(item => {
    let q = Number(item.qty) || 0;
    let r = Number(item.rate) || 0;

    // Auto-correct if user entered price in Qty and left Rate as 0
    if (r === 0 && q > 0 && q !== 1) {
      r = q;
      q = 1;
    } else if (q === 0 && r > 0) {
      q = 1;
    }
    const itemAmt = q * r;
    return { ...item, q, r, itemAmt };
  });

  // Calculations
  const subtotal = normalizedItems.reduce((acc, item) => acc + item.itemAmt, 0);

  let totalSGST = 0;
  let totalCGST = 0;
  let totalCess = 0;

  if (isGST) {
    totalSGST = normalizedItems.reduce((acc, item) => acc + ((Number(item.sgst) || 0) / 100) * item.itemAmt, 0);
    totalCGST = normalizedItems.reduce((acc, item) => acc + ((Number(item.cgst) || 0) / 100) * item.itemAmt, 0);
    totalCess = normalizedItems.reduce((acc, item) => acc + ((Number(item.cess) || 0) / 100) * item.itemAmt, 0);
  }

  const grandTotal = subtotal + totalSGST + totalCGST + totalCess;
  const isCompact = normalizedItems.length > 12;

  return (
    <div className="flex flex-col relative print:block">

      {/* PAGE 1: Invoice Details & Items */}
      <div className="bg-white mx-auto relative print-page flex flex-col shadow-lg print:shadow-none print:mb-0" style={{ width: '210mm', minHeight: '295mm', padding: '10mm 15mm' }}>

        {/* Decorative Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[30px] text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-primary" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-primary" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />

        {/* Watermark Logo */}
        {companyDetails.logo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
            <img 
              src={companyDetails.logo} 
              alt="Watermark" 
              className="w-2/3 object-contain grayscale filter" 
            />
          </div>
        )}

        <div className="pl-4 pr-4 pt-1">

          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="max-w-[50%] flex flex-col items-start">
              {companyDetails.logo ? (
                <img
                  src={companyDetails.logo}
                  alt="Company Logo"
                  className={`${isCompact ? 'h-10' : 'h-16'} object-contain mb-2 -ml-2`}
                />
              ) : (
                <div className={`${isCompact ? 'text-xl' : 'text-2xl'} font-extrabold text-primary mb-2 tracking-tighter`}>
                  {companyDetails.companyName || 'COMPANY NAME'}
                </div>
              )}

              <div className={`text-gray-700 ${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed space-y-0.5`}>
                {companyDetails.companyName && !companyDetails.logo && <div className={`font-bold ${isCompact ? 'text-sm' : 'text-base'}`}>{companyDetails.companyName}</div>}
                {companyDetails.yourName && <div className="font-bold text-gray-900">{companyDetails.yourName}</div>}
                <div className="whitespace-pre-wrap">{companyDetails.address}</div>
                <div>{companyDetails.city}</div>
                <div>{[companyDetails.state, companyDetails.country].filter(Boolean).join(', ')}</div>
                {companyDetails.phone && <div>Phone: <span className="font-bold text-gray-900">{companyDetails.phone}</span></div>}
                {companyDetails.gstinToggle && companyDetails.gstin && (
                  <div className="font-bold text-gray-800 mt-1">GSTIN: {companyDetails.gstin}</div>
                )}
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-widest mb-2">
                {isGST ? 'TAX INVOICE' : 'INVOICE'}
              </h1>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-500">Invoice No:</span>
                <span className="font-bold text-gray-900">{invoiceDetails.invoiceNo || '-'}</span>

                <span className="font-semibold text-gray-500">Invoice Date:</span>
                <span className="font-semibold text-gray-900">
                  {invoiceDetails.invoiceDate ? format(new Date(invoiceDetails.invoiceDate), 'dd MMM yyyy') : '-'}
                </span>

                <span className="font-semibold text-gray-500">Due Date:</span>
                <span className="font-semibold text-gray-900">
                  {invoiceDetails.dueDate ? format(new Date(invoiceDetails.dueDate), 'dd MMM yyyy') : '-'}
                </span>

                {isGST && invoiceDetails.placeOfSupply && (
                  <>
                    <span className="font-semibold text-gray-500">Place of Supply:</span>
                    <span className="font-semibold text-gray-900">{invoiceDetails.placeOfSupply}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Client Details Section */}
          <div className={`border-t border-gray-200 border-b ${isCompact ? 'py-1 mb-1' : 'py-2 mb-2'} grid grid-cols-2`}>
            <div>
              <h3 className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-bold text-gray-400 uppercase tracking-widest mb-1`}>Billed To:</h3>
              <div className={`${isCompact ? 'text-sm' : 'text-base'} text-gray-900 leading-tight font-bold mb-0.5`}>
                {clientDetails.clientCompanyName || 'Client Name'}
              </div>
              {clientDetails.address && (
                <div className={`${isCompact ? 'text-[11px]' : 'text-sm'} text-gray-600 whitespace-pre-wrap`}>
                  {clientDetails.address}
                </div>
              )}
              <div className={`${isCompact ? 'text-[11px]' : 'text-sm'} text-gray-600`}>
                <div>{clientDetails.city}</div>
                <div>{clientDetails.state}</div>
              </div>
              {isGST && clientDetails.gstin && (
                <div className={`${isCompact ? 'text-[11px]' : 'text-sm'} font-bold text-gray-800 mt-1`}>GSTIN: {clientDetails.gstin}</div>
              )}
              {clientDetails.phone && (
                <div className={`${isCompact ? 'text-[11px]' : 'text-sm'} text-gray-600 mt-0.5`}>
                  Phone: <span className="font-bold text-gray-900">{clientDetails.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table items */}
          <div className={`${isCompact ? 'mb-0.5' : 'mb-1'} flex-grow`}>
            <table className={`w-full ${isCompact ? 'text-[11px]' : 'text-sm'} text-left`}>
              <thead>
                <tr className="bg-primary text-white">
                  <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold w-12 border-r border-green-700`}>S.NO</th>
                  <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold border-r border-green-700`}>Services</th>
                  <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold text-center w-16 border-r border-green-700`}>Qty</th>
                  <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold text-right w-24 border-r border-green-700`}>Rate</th>
                  {isGST && <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold text-right w-20 border-r border-green-700`}>Tax</th>}
                  <th className={`${isCompact ? 'py-1.5' : 'py-2'} px-3 font-semibold text-right w-32`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {normalizedItems.map((item, idx) => {
                  const itemTax = isGST ? (((Number(item.sgst) || 0) + (Number(item.cgst) || 0) + (Number(item.cess) || 0)) / 100) * item.itemAmt : 0;
                  return (
                    <tr key={item.id} className="text-gray-800 border-b border-gray-100 last:border-0 grow">
                      <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 border-r border-gray-200`}>{idx + 1}</td>
                      <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 border-r border-gray-200 font-medium whitespace-pre-wrap`}>{item.description}</td>
                      <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 border-r border-gray-200 text-center`}>{item.q}</td>
                      <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 border-r border-gray-200 text-right`}>₹{item.r.toFixed(2)}</td>
                      {isGST && <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 border-r border-gray-200 text-right text-gray-500 text-[10px]`}>₹{itemTax.toFixed(2)}<br />({Number(item.sgst) + Number(item.cgst) + Number(item.cess)}%)</td>}
                      <td className={`${isCompact ? 'py-1' : 'py-2'} px-3 font-bold text-right`}>₹{item.itemAmt.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations Section */}
          <div className="flex justify-end items-start mt-8 pt-2">

            <div className="w-1/2 md:w-1/3 ml-auto">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200 shadow-sm">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>

                {isGST && (
                  <>
                    {totalSGST > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">SGST:</span>
                        <span className="text-gray-800">₹{totalSGST.toFixed(2)}</span>
                      </div>
                    )}
                    {totalCGST > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">CGST:</span>
                        <span className="text-gray-800">₹{totalCGST.toFixed(2)}</span>
                      </div>
                    )}
                    {totalCess > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">Cess:</span>
                        <span className="text-gray-800">₹{totalCess.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Spacer to push footer to bottom */}
          <div className="flex-grow min-h-[10px]"></div>

          {/* Footer / Signature (Flow-based but pushed by spacer) */}
          <div className="mt-4 pt-2 border-t border-gray-200 grid grid-cols-2 items-end z-10" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="text-xs text-gray-400">
              Thank you for your business.
              {(notes || terms) && <div className="mt-1 font-semibold">See next page for Notes & Terms</div>}
            </div>
            <div className="text-right">
              <div className="mb-4"></div>
              <div className="border-t border-gray-800 inline-block pt-2 w-48 text-center text-sm font-bold text-gray-800">
                Authorized Signature
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PAGE 2: Notes & Terms (Only rendered if they have content) */}
      {(notes || terms) && (
        <div className="bg-white mx-auto relative print-page flex flex-col shadow-lg print:shadow-none" style={{ width: '210mm', height: '296mm', padding: '10mm', paddingBottom: '20mm'}}>

          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-primary" />
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-primary" />
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-primary" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary" />

          {/* Watermark Logo (Matching Page 1) */}
          {companyDetails.logo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
              <img 
                src={companyDetails.logo} 
                alt="Watermark" 
                className="w-2/3 object-contain grayscale filter" 
              />
            </div>
          )}

          <div className="pl-4 pr-4 pt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-2">Notes & Terms of Service</h2>

            <div className="space-y-12">
              {notes && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Additional Notes</h3>
                  <div className="text-base text-black-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-100">{notes}</div>
                </div>
              )}

              {terms && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Terms & Conditions</h3>
                  <div className="text-sm text-black-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-100">{terms}</div>
                </div>
              )}
            </div>

            {/* Minor Footer for reference */}
            <div className="absolute bottom-12 left-12 right-12 border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-400">
              <span>{companyDetails.companyName}</span>
              <span>Invoice: {invoiceDetails.invoiceNo || '-'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
