import React from 'react';
import { format } from 'date-fns';
import { PaymentIcons } from '../utils/paymentIcons';

export default function InvoicePreview({ state }) {
  const { companyDetails, clientDetails, invoiceDetails, items, notes, terms, quotationNote } = state;
  const invoiceType = invoiceDetails.invoiceType || 'GST';
  const isGST = invoiceType === 'GST';
  const isQuotation = invoiceType === 'Quotation';
  const showTaxColumns = isGST || isQuotation;

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

  if (showTaxColumns) {
    totalSGST = normalizedItems.reduce((acc, item) => acc + ((Number(item.sgst) || 0) / 100) * item.itemAmt, 0);
    totalCGST = normalizedItems.reduce((acc, item) => acc + ((Number(item.cgst) || 0) / 100) * item.itemAmt, 0);
    totalCess = normalizedItems.reduce((acc, item) => acc + ((Number(item.cess) || 0) / 100) * item.itemAmt, 0);
  }

  const grandTotal = subtotal + totalSGST + totalCGST + totalCess;
  
  const itemCount = normalizedItems.length;
  const isCompact = itemCount > 8;
  const isSuperCompact = itemCount > 12;
  const isExtremeCompact = itemCount > 14;

  return (
    <div className="flex flex-col relative print:block w-full">

      {/* PAGE 1: Invoice Details & Items */}
      <div className="bg-white relative print-page flex flex-col shadow-lg print:shadow-none print:mb-0 overflow-hidden" style={{ width: '210mm', height: '296mm', padding: '15mm' }}>

        {/* Decorative Top Wave */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-0">
          <svg className="relative block w-full h-[30px] text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-primary" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-primary" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary" />

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

        <div className={`px-4 ${isExtremeCompact ? 'pt-0' : 'pt-1'}`}>

          {/* Header */}
          <div className={`flex justify-between items-start ${isExtremeCompact ? 'mb-1' : isSuperCompact ? 'mb-2' : 'mb-4'}`}>
            <div className="max-w-[50%] flex flex-col items-start">
              {companyDetails.logo ? (
                <img
                  src={companyDetails.logo}
                  alt="Company Logo"
                  className={`${isExtremeCompact ? 'h-10' : isSuperCompact ? 'h-12' : 'h-16'} object-contain mb-2 -ml-2`}
                />
              ) : (
                <div className={`${isSuperCompact ? 'text-lg' : isCompact ? 'text-xl' : 'text-2xl'} font-extrabold text-primary mb-1 tracking-tighter`}>
                  {companyDetails.companyName || 'COMPANY NAME'}
                </div>
              )}

              <div className={`text-gray-700 ${isExtremeCompact ? 'text-[9px]' : isSuperCompact ? 'text-xs' : 'text-sm'} leading-tight space-y-0`}>
                {companyDetails.companyName && !companyDetails.logo && <div className={`font-bold ${isSuperCompact ? 'text-xs' : isCompact ? 'text-sm' : 'text-base'}`}>{companyDetails.companyName}</div>}
                {companyDetails.yourName && <div className="font-bold text-gray-900">{companyDetails.yourName}</div>}
                <div className="whitespace-pre-wrap">{companyDetails.address}</div>
                <div>{companyDetails.city}</div>
                <div>{[companyDetails.state, companyDetails.country].filter(Boolean).join(', ')}</div>
                {companyDetails.phone && <div>Phone: <span className="font-bold text-gray-900">{companyDetails.phone}</span></div>}
                {companyDetails.gstinToggle && companyDetails.gstin && (
                  <div className="font-bold text-gray-800 mt-0.5">GSTIN: {companyDetails.gstin}</div>
                )}
              </div>
            </div>

            <div className="text-right">
              <h1 className={`${isSuperCompact ? 'text-xl' : 'text-3xl'} font-bold text-gray-800 uppercase tracking-widest mb-1`}>
                {isGST ? 'TAX INVOICE' : isQuotation ? 'QUOTATION' : 'INVOICE'}
              </h1>

              <div className={`grid grid-cols-2 gap-x-4 gap-y-1 ${isSuperCompact ? 'text-[10px]' : 'text-sm'} text-gray-700`}>
                <span className="font-semibold text-gray-500">{isQuotation ? 'Quotation No:' : 'Invoice No:'}</span>
                <span className="font-bold text-gray-900">{invoiceDetails.invoiceNo || '-'}</span>

                <span className="font-semibold text-gray-500">{isQuotation ? 'Quotation Date:' : 'Invoice Date:'}</span>
                <span className="font-semibold text-gray-900">
                  {invoiceDetails.invoiceDate ? format(new Date(invoiceDetails.invoiceDate), 'dd MMM yyyy') : '-'}
                </span>

                {!isQuotation && (
                  <>
                    <span className="font-semibold text-gray-500">Due Date:</span>
                    <span className="font-semibold text-gray-900">
                      {invoiceDetails.dueDate ? format(new Date(invoiceDetails.dueDate), 'dd MMM yyyy') : '-'}
                    </span>
                  </>
                )}

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
          <div className={`border-t border-gray-200 border-b ${isExtremeCompact ? 'py-0.5 mb-0.5' : isSuperCompact ? 'py-1 mb-1' : 'py-2 mb-2'} grid grid-cols-2`}>
            <div>
              <h3 className={`${isSuperCompact ? 'text-[7px]' : 'text-[10px]'} font-bold text-gray-400 uppercase tracking-widest mb-0.5`}>Billed To:</h3>
              <div className={`${isSuperCompact ? 'text-xs' : 'text-base'} text-gray-900 leading-tight font-bold mb-0.5`}>
                {clientDetails.clientCompanyName || 'Client Name'}
              </div>
              {clientDetails.address && (
                <div className={`${isSuperCompact ? 'text-[10px]' : 'text-sm'} text-gray-600 whitespace-pre-wrap leading-tight`}>
                  {clientDetails.address}
                </div>
              )}
              <div className={`${isSuperCompact ? 'text-[10px]' : 'text-sm'} text-gray-600 leading-tight`}>
                <div>{clientDetails.city}</div>
                <div>{clientDetails.state}</div>
              </div>
              {isGST && clientDetails.gstin && (
                <div className={`${isSuperCompact ? 'text-[10px]' : 'text-sm'} font-bold text-gray-800 mt-0.5`}>GSTIN: {clientDetails.gstin}</div>
              )}
              {clientDetails.phone && (
                <div className={`${isSuperCompact ? 'text-[10px]' : 'text-sm'} text-gray-600 mt-0.5`}>
                  Phone: <span className="font-bold text-gray-900">{clientDetails.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table items */}
          <div className={`${isExtremeCompact ? 'mb-0.5' : isSuperCompact ? 'mb-1' : 'mb-2'} flex-grow`}>
            <table className={`w-full ${isExtremeCompact ? 'text-[9px]' : isSuperCompact ? 'text-[10px]' : isCompact ? 'text-[11px]' : 'text-sm'} text-left`}>
              <thead>
                <tr className="bg-primary text-white">
                  <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold w-12 border-r border-green-700 uppercase`}>S.No</th>
                  <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold border-r border-green-700 uppercase`}>Description</th>
                  <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold text-center w-16 border-r border-green-700 uppercase`}>Qty</th>
                  <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold text-right w-24 border-r border-green-700 uppercase`}>Rate</th>
                  {showTaxColumns && <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold text-right w-20 border-r border-green-700 uppercase`}>Tax</th>}
                  <th className={`${isSuperCompact ? 'py-1' : 'py-2'} px-3 font-semibold text-right w-32 uppercase`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {normalizedItems.map((item, idx) => {
                  const itemTax = showTaxColumns ? (((Number(item.sgst) || 0) + (Number(item.cgst) || 0) + (Number(item.cess) || 0)) / 100) * item.itemAmt : 0;
                  return (
                    <tr key={item.id} className="text-gray-800 border-b border-gray-100 last:border-0 grow">
                      <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 border-r border-gray-200`}>{idx + 1}</td>
                      <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 border-r border-gray-200 font-medium whitespace-pre-wrap leading-tight`}>{item.description}</td>
                      <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 border-r border-gray-200 text-center`}>{item.q}</td>
                      <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 border-r border-gray-200 text-right`}>₹{item.r.toFixed(2)}</td>
                      {showTaxColumns && <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 border-r border-gray-200 text-right text-gray-500 ${isSuperCompact ? 'text-[8px]' : 'text-[10px]'} leading-tight`}>₹{itemTax.toFixed(2)}<br />({Number(item.sgst) + Number(item.cgst) + Number(item.cess)}%)</td>}
                      <td className={`${isSuperCompact ? 'py-0.5' : 'py-1.5'} px-3 font-bold text-right`}>₹{item.itemAmt.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Info Section (Payment + Calculations) */}
          <div className={`flex justify-between items-start ${isExtremeCompact ? 'mt-1' : 'mt-4'} pt-1 page-break-inside-avoid relative z-10`}>
            
            {/* Payment Details (Left) */}
            {companyDetails.paymentToggle && (companyDetails.bankName || companyDetails.accountNo || companyDetails.qrCode || companyDetails.upiId) && (
              <div className="w-1/2 pr-4 flex gap-4">
                {companyDetails.qrCode && (
                  <div className="flex-shrink-0 mt-1">
                    <img src={companyDetails.qrCode} alt="Scan to Pay" className={`${isSuperCompact ? 'w-16 h-16' : 'w-24 h-24'} object-contain border border-gray-200 rounded p-1`} />
                    <div className="text-center text-[7px] md:text-[8px] font-bold mt-1 text-gray-500 uppercase tracking-wider">Scan to Pay</div>
                  </div>
                )}
                
                {(companyDetails.bankName || companyDetails.accountNo || companyDetails.upiId) && (
                  <div className={`${isSuperCompact ? 'p-2 space-y-0.5' : 'p-3 space-y-1'} bg-gray-50/50 rounded-lg border border-gray-100 shadow-sm grow min-w-[150px]`}>
                    <h4 className={`${isSuperCompact ? 'text-[8px]' : 'text-[10px]'} font-bold text-gray-400 uppercase tracking-widest`}>Payment Details</h4>
                    
                    {companyDetails.paymentMethod && companyDetails.paymentMethod.length > 0 && (
                      <div className={`${isSuperCompact ? 'text-[9px]' : 'text-[11px]'} text-gray-800`}>
                        <div className="font-bold mb-1.5 text-gray-400 uppercase tracking-tighter text-[9px]">Methods:</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                          {companyDetails.paymentMethod.map(method => {
                            const Icon = PaymentIcons[method];
                            return (
                              <div key={method} className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-1 rounded shadow-sm">
                                <div className="shrink-0">{Icon && <Icon />}</div>
                                <span className={isSuperCompact ? 'text-[8px]' : 'text-[9px] font-medium'}>{method}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {companyDetails.bankName && (
                      <div className={`${isSuperCompact ? 'text-[10px]' : 'text-xs'} text-gray-800`}>
                        <span className="font-semibold">Bank:</span> {companyDetails.bankName}
                      </div>
                    )}
                    {companyDetails.accountNo && (
                      <div className={`${isSuperCompact ? 'text-[10px]' : 'text-xs'} text-gray-800`}>
                        <span className="font-semibold">A/C No:</span> <span className="font-mono">{companyDetails.accountNo}</span>
                      </div>
                    )}
                    {companyDetails.ifscCode && (
                      <div className={`${isSuperCompact ? 'text-[10px]' : 'text-xs'} text-gray-800`}>
                        <span className="font-semibold">IFSC:</span> <span className="font-mono uppercase">{companyDetails.ifscCode}</span>
                      </div>
                    )}
                    {companyDetails.upiId && (
                      <div className={`${isSuperCompact ? 'text-[10px]' : 'text-xs'} text-gray-800 ${companyDetails.accountNo ? 'mt-1 pt-1 border-t border-gray-200' : ''}`}>
                        <span className="font-semibold">UPI ID:</span> {companyDetails.upiId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Calculations Section (Right) */}
            <div className={`${isSuperCompact ? 'w-1/3' : 'w-1/3'} ml-auto`}>
              <div className={`${isSuperCompact ? 'p-2 space-y-0.5' : 'p-4 space-y-2'} bg-gray-50 rounded-lg border border-gray-200 shadow-sm`}>
                <div className={`flex justify-between ${isSuperCompact ? 'text-[10px]' : 'text-sm'} py-0.5`}>
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>

                {showTaxColumns && (
                  <>
                    {(totalSGST > 0) && (
                      <div className={`flex justify-between ${isSuperCompact ? 'text-[10px]' : 'text-sm'} py-0.5`}>
                        <span className="text-gray-600">SGST:</span>
                        <span className="text-gray-800">₹{totalSGST.toFixed(2)}</span>
                      </div>
                    )}
                    {(totalCGST > 0) && (
                      <div className={`flex justify-between ${isSuperCompact ? 'text-[10px]' : 'text-sm'} py-0.5`}>
                        <span className="text-gray-600">CGST:</span>
                        <span className="text-gray-800">₹{totalCGST.toFixed(2)}</span>
                      </div>
                    )}
                    {(totalCess > 0) && (
                      <div className={`flex justify-between ${isSuperCompact ? 'text-[10px]' : 'text-sm'} py-0.5`}>
                        <span className="text-gray-600">Cess:</span>
                        <span className="text-gray-800">₹{totalCess.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className={`border-t border-gray-300 ${isSuperCompact ? 'my-1 pt-1' : 'my-2 pt-2'} flex justify-between items-center`}>
                  <span className={`${isSuperCompact ? 'text-sm' : 'text-lg'} font-bold text-gray-800`}>Total:</span>
                  <span className={`${isSuperCompact ? 'text-base' : 'text-xl'} font-bold text-primary`}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Signature - Fixed to bottom of Page 1 */}
          <div className="absolute bottom-[10mm] left-[15mm] right-[15mm] border-t border-gray-200 grid grid-cols-2 items-end z-10" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className={`${isSuperCompact ? 'text-[9px]' : 'text-xs'} text-gray-400`}>
              Thank you for your business.
              {(notes || terms || (isQuotation && quotationNote)) && <div className="mt-1 font-semibold text-primary">Notes & Terms are on the next page →</div>}
            </div>
            <div className="text-right">
              <div className={`${isSuperCompact ? 'mb-2' : 'mb-3'}`}></div>
              <div className={`border-t border-gray-800 inline-block ${isSuperCompact ? 'pt-1 w-32 text-xs' : 'pt-2 w-48 text-sm'} font-bold text-gray-800 text-center`}>
                Authorized Signature
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PAGE 2: Notes & Terms (Explicitly on its own page for PDF) */}
      {(notes || terms || (isQuotation && quotationNote)) && (
        <div className="bg-white relative print-page flex flex-col shadow-lg print:shadow-none print:mt-0 page-break-before-always overflow-hidden" style={{ width: '210mm', height: '296mm', padding: '15mm' }}>

          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-primary" />
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

              {/* Quotation Note — only for Quotation type */}
              {isQuotation && quotationNote && (
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-4 bg-primary rounded-full"></span>
                    Quotation Note
                  </h3>
                  <div className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed bg-green-50 p-6 rounded-lg border border-green-200">{quotationNote}</div>
                </div>
              )}
            </div>

            {/* Minor Footer for reference */}
            <div className="absolute bottom-12 left-12 right-12 border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-400">
              <span>{companyDetails.companyName}</span>
              <span>{isQuotation ? 'Quotation' : 'Invoice'}: {invoiceDetails.invoiceNo || '-'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
