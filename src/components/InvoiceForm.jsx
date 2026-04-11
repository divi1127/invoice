import React from 'react';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function InvoiceForm({ state, setState }) {
  const { companyDetails, clientDetails, invoiceDetails, items, notes, terms } = state;
  const { setCompanyDetails, setClientDetails, setInvoiceDetails, setItems, setNotes, setTerms } = setState;

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
        const updatedItem = { ...item, [field]: value };
        // Auto calculate amount intelligently
        if (field === 'qty' || field === 'rate') {
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
      amount: 0
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

  const isGST = invoiceDetails.invoiceType === 'GST';

  return (
    <div className="space-y-8 pb-10">
      
      {/* Invoice Type & Details */}
      <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Invoice Settings</h2>
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setInvoiceDetails({...invoiceDetails, invoiceType: 'GST'})}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isGST ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              GST Invoice
            </button>
            <button
              onClick={() => setInvoiceDetails({...invoiceDetails, invoiceType: 'Non-GST'})}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!isGST ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Non-GST Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Details */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
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

        {/* Client Details */}
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
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
      <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Line Items</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap mb-4">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold rounded-t-xl">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3">Item Description</th>
                <th className="p-3 w-16">Qty</th>
                <th className="p-3 w-24">Rate</th>
                {isGST && (
                  <>
                    <th className="p-3 w-16">SGST%</th>
                    <th className="p-3 w-16">CGST%</th>
                    <th className="p-3 w-16">Cess%</th>
                  </>
                )}
                <th className="p-3 w-24 text-right">Amount</th>
                <th className="p-3 w-10"></th>
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
                    <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1" />
                  </td>
                  <td className="p-2">
                    <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-center" />
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-primary focus:ring-0 px-1 py-1 text-right" />
                  </td>
                  {isGST && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Notes</h2>
          <textarea 
            placeholder="Any additional notes or bank details..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            className="w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-primary focus:border-primary" 
          />
        </section>

        <section className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Terms & Conditions</h2>
          <textarea 
            value={terms} 
            onChange={(e) => setTerms(e.target.value)} 
            className="w-full text-sm border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-primary focus:border-primary whitespace-pre-wrap" 
          />
        </section>
      </div>

    </div>
  );
}
