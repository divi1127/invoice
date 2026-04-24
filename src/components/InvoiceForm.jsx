import React from 'react';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PaymentIcons } from '../utils/paymentIcons';
import { descriptionOptions } from '../utils/initialData';

export default function InvoiceForm({ state, setState }) {
  const { companyDetails, clientDetails, invoiceDetails, items, notes, terms, quotationNote } = state;
  const { setCompanyDetails, setClientDetails, setInvoiceDetails, setItems, setNotes, setTerms, setQuotationNote } = setState;

  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompanyDetails({
      ...companyDetails,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientDetails({
      ...clientDetails,
      [name]: value
    });
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({
      ...invoiceDetails,
      [name]: value
    });
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        
        // Handle recurring services logic
        const isRecurring = updatedItem.description.toLowerCase().includes('post making') || 
                           updatedItem.description.toLowerCase().includes('video making');
        
        if (isRecurring) {
          if (field === 'months' || field === 'qtyPerMonth' || field === 'description') {
            const m = Number(field === 'months' ? value : item.months) || 1;
            const c = Number(field === 'qtyPerMonth' ? value : item.qtyPerMonth) || 1;
            updatedItem.qty = m * c;
          }
        }

        // Auto calculate amount intelligently
        if (field === 'qty' || field === 'rate' || field === 'months' || field === 'qtyPerMonth' || field === 'description') {
          let q = Number(updatedItem.qty) || 0;
          let r = Number(updatedItem.rate) || 0;
          
          if (r === 0 && q > 0 && q !== 1) {
            updatedItem.amount = q;
          } else if (q === 0 && r > 0) {
            updatedItem.amount = r;
          } else {
            updatedItem.amount = q * r;
          }
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, {
      id: uuidv4(),
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
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyDetails({ ...companyDetails, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Image must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyDetails({ ...companyDetails, qrCode: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentMethodToggle = (method) => {
    const currentMethods = Array.isArray(companyDetails.paymentMethod) ? companyDetails.paymentMethod : [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    setCompanyDetails({
      ...companyDetails,
      paymentMethod: newMethods
    });
  };



  const isGST = invoiceDetails.invoiceType === 'GST';
  const invoiceType = invoiceDetails.invoiceType || 'GST';
  const isQuotation = invoiceType === 'Quotation';
  const showTaxColumns = isGST || isQuotation;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Invoice Type & Details */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Invoice Settings</h2>
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setInvoiceDetails({...invoiceDetails, invoiceType: 'GST'})}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${invoiceType === 'GST' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              GST
            </button>
            <button
              onClick={() => setInvoiceDetails({...invoiceDetails, invoiceType: 'Non-GST'})}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${invoiceType === 'Non-GST' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Non-GST
            </button>
            <button
              onClick={() => setInvoiceDetails({...invoiceDetails, invoiceType: 'Quotation'})}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${invoiceType === 'Quotation' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Quotation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Number</label>
            <input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleInvoiceChange} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Date</label>
            <input type="date" name="invoiceDate" value={invoiceDetails.invoiceDate} onChange={handleInvoiceChange} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Due Date</label>
            <input type="date" name="dueDate" value={invoiceDetails.dueDate} onChange={handleInvoiceChange} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Place of Supply (State)</label>
            <input type="text" name="placeOfSupply" value={invoiceDetails.placeOfSupply} onChange={handleInvoiceChange} className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-2 border" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Your Details */}
        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
            Your Details
            <label className="cursor-pointer flex items-center space-x-2 text-sm text-primary hover:text-green-700 font-medium">
              <Upload size={16} />
              <span>Upload Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </h2>
          
          <div className="space-y-3">
            <input type="text" name="companyName" placeholder="Your Company Name" value={companyDetails.companyName} onChange={handleCompanyChange} className="w-full font-bold text-lg border-b border-gray-300 focus:border-primary focus:ring-0 px-0 py-1" />
            
            <input type="text" name="yourName" placeholder="Your Name (Optional)" value={companyDetails.yourName} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" name="gstinToggle" checked={companyDetails.gstinToggle} onChange={handleCompanyChange} className="rounded text-primary focus:ring-primary" id="gstinToggle" />
              <label htmlFor="gstinToggle" className="text-sm text-gray-600">Show GSTIN</label>
            </div>
            
            {companyDetails.gstinToggle && (
              <input type="text" name="gstin" placeholder="GSTIN" value={companyDetails.gstin} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 font-mono uppercase" />
            )}
            
            <textarea name="address" placeholder="Address" value={companyDetails.address} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 h-16 resize-none" />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="city" placeholder="City" value={companyDetails.city} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
              <input type="text" name="state" placeholder="State" value={companyDetails.state} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="country" placeholder="Country" value={companyDetails.country} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
              <input type="text" name="phone" placeholder="Phone" value={companyDetails.phone} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
            Payment Details
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                name="paymentToggle" 
                checked={companyDetails.paymentToggle} 
                onChange={handleCompanyChange} 
                className="rounded text-primary focus:ring-primary h-4 w-4" 
                id="paymentToggle" 
              />
              <label htmlFor="paymentToggle" className="text-sm font-medium text-gray-600">Active</label>
            </div>
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Name</label>
              <input type="text" name="bankName" placeholder="Enter Bank Name" value={companyDetails.bankName || ''} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
                <input type="text" name="accountNo" placeholder="Account No" value={companyDetails.accountNo || ''} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary transition-all font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">IFSC Code</label>
                <input type="text" name="ifscCode" placeholder="IFSC" value={companyDetails.ifscCode || ''} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary transition-all font-mono uppercase" />
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Methods</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['PhonePe', 'GPay', 'Paytm', 'NetBanking', 'UPI', 'Cash'].map((method) => {
                  const isChecked = Array.isArray(companyDetails.paymentMethod) && companyDetails.paymentMethod.includes(method);
                  const Icon = PaymentIcons[method];
                  return (
                    <label key={method} className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-green-50 border-primary text-primary shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handlePaymentMethodToggle(method)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        {Icon && <Icon />}
                        <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">{method}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">UPI ID</label>
              <input type="text" name="upiId" placeholder="UPI ID" value={companyDetails.upiId || ''} onChange={handleCompanyChange} className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary transition-all" />
            </div>


            <div className="mt-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">QR Code Image</label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer flex items-center space-x-2 text-sm text-primary hover:text-green-700 font-medium py-1.5 px-3 border border-dashed border-primary rounded-md bg-green-50 transition-colors hover:bg-green-100">
                  <Upload size={16} />
                  <span>Upload QR</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
                {companyDetails.qrCode && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-1.5 rounded-md border border-green-200">
                    QR Uploaded
                  </span>
                )}
                {companyDetails.qrCode && (
                  <button onClick={() => setCompanyDetails({ ...companyDetails, qrCode: null })} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors" title="Remove QR">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Client Details */}
        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Bill To</h2>
          
          <div className="space-y-3">
            <input type="text" name="clientCompanyName" placeholder="Client's Company / Name" value={clientDetails.clientCompanyName} onChange={handleClientChange} className="w-full font-bold text-lg border-b border-gray-300 focus:border-primary focus:ring-0 px-0 py-1" />
            
            {isGST && (
              <input type="text" name="gstin" placeholder="Client GSTIN" value={clientDetails.gstin} onChange={handleClientChange} className="w-full text-sm border border-gray-300 rounded-md p-2 font-mono uppercase" />
            )}
            
            <textarea name="address" placeholder="Client Address" value={clientDetails.address} onChange={handleClientChange} className="w-full text-sm border border-gray-300 rounded-md p-2 h-16 resize-none" />
            
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="city" placeholder="City" value={clientDetails.city} onChange={handleClientChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
              <input type="text" name="state" placeholder="State" value={clientDetails.state} onChange={handleClientChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
            </div>
            
            <input type="text" name="phone" placeholder="Client Phone" value={clientDetails.phone} onChange={handleClientChange} className="w-full text-sm border border-gray-300 rounded-md p-2" />
          </div>
        </section>
      </div>

      {/* Line Items */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Line Items</h2>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="min-w-full text-left text-sm whitespace-nowrap mb-4">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold rounded-t-xl">
              <tr>
                <th className="p-2 sm:p-3 w-6 sm:w-8"></th>
                <th className="p-2 sm:p-3">Description</th>
                <th className="p-2 sm:p-3 w-14 sm:w-16">Qty</th>
                <th className="p-2 sm:p-3 w-20 sm:w-24">Rate</th>
                {showTaxColumns && (
                  <>
                    <th className="p-2 sm:p-3 w-14 sm:w-16">SGST%</th>
                    <th className="p-2 sm:p-3 w-14 sm:w-16">CGST%</th>
                    <th className="p-2 sm:p-3 w-14 sm:w-16">Cess%</th>
                  </>
                )}
                <th className="p-2 sm:p-3 w-20 sm:w-24 text-right">Amount</th>
                <th className="p-2 sm:p-3 w-8 sm:w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => {
                let q = Number(item.qty) || 0;
                let r = Number(item.rate) || 0;
                let displayAmt = item.amount;
                
                // Smart auto-calc for display
                if (r === 0 && q > 0 && q !== 1) {
                  displayAmt = q;
                } else if (q === 0 && r > 0) {
                  displayAmt = r;
                } else {
                  displayAmt = q * r;
                }

                return (
                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-2 cursor-grab text-gray-300 group-hover:text-gray-500">
                    <GripVertical size={16} />
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                      <input 
                        type="text" 
                        list="description-options"
                        placeholder="Description" 
                        value={item.description} 
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} 
                        className="w-full bg-transparent border-b border-gray-200 focus:border-primary focus:ring-0 px-1 py-1" 
                      />
                      {(item.description.toLowerCase().includes('post making') || item.description.toLowerCase().includes('video making')) && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 border border-primary/20 rounded-md bg-green-50/30 px-2 py-0.5">
                            <label className="text-[10px] font-bold text-primary uppercase">Months</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.months} 
                              onChange={(e) => handleItemChange(item.id, 'months', e.target.value)} 
                              className="w-10 bg-transparent border-none focus:ring-0 p-0 text-xs font-semibold text-center"
                            />
                          </div>
                          <div className="flex items-center gap-1 border border-primary/20 rounded-md bg-green-50/30 px-2 py-0.5">
                            <label className="text-[10px] font-bold text-primary uppercase">Count/Mo</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.qtyPerMonth} 
                              onChange={(e) => handleItemChange(item.id, 'qtyPerMonth', e.target.value)} 
                              className="w-10 bg-transparent border-none focus:ring-0 p-0 text-xs font-semibold text-center"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-center" />
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-right" />
                  </td>
                  {showTaxColumns && (
                    <>
                      <td className="p-2">
                        <input type="number" min="0" max="100" value={item.sgst} onChange={(e) => handleItemChange(item.id, 'sgst', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-center" />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" max="100" value={item.cgst} onChange={(e) => handleItemChange(item.id, 'cgst', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-center" />
                      </td>
                      <td className="p-2">
                        <input type="number" min="0" max="100" value={item.cess} onChange={(e) => handleItemChange(item.id, 'cess', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-center" />
                      </td>
                    </>
                  )}
                  <td className="p-2 text-right font-medium text-gray-700">
                    ₹{displayAmt.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" disabled={items.length === 1}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <button onClick={addItem} className="flex items-center space-x-2 text-primary hover:text-green-700 font-medium text-sm transition-colors px-2 py-1 rounded bg-green-50 hover:bg-green-100">
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </section>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Notes</h2>
          <textarea 
            placeholder="Any additional notes or bank details..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            className="w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-primary focus:border-primary" 
          />
        </section>

        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Terms & Conditions</h2>
          <textarea 
            value={terms} 
            onChange={(e) => setTerms(e.target.value)} 
            className="w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-primary focus:border-primary whitespace-pre-wrap" 
          />
        </section>
      </div>

      {/* Quotation Note (only for Quotation type) */}
      {isQuotation && (
        <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-5 bg-primary rounded-full"></span>
            Quotation Note
          </h2>
          <textarea 
            placeholder="Add a special note for this quotation (e.g. validity period, special conditions)..." 
            value={quotationNote} 
            onChange={(e) => setQuotationNote(e.target.value)} 
            className="w-full text-sm border border-gray-300 rounded-md p-3 h-28 resize-none focus:ring-primary focus:border-primary" 
          />
        </section>
      )}

      {/* Dropdown Options Datalist */}
      <datalist id="description-options">
        {descriptionOptions.map(option => (
          <option key={option} value={option} />
        ))}
      </datalist>

    </div>
  );
}
