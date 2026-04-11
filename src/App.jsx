import React, { useRef } from 'react';
import { Download, Printer, PlusCircle } from 'lucide-react';
import useLocalStorage from './hooks/useLocalStorage';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { initialCompanyDetails, initialClientDetails, initialInvoiceDetails, defaultTerms, initialItem } from './utils/initialData';
import { Toaster, toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

function App() {
  const [invoiceNumber, setInvoiceNumber] = useLocalStorage('lastInvoiceNumber', 26001);
  const [companyDetails, setCompanyDetails] = useLocalStorage('companyDetails', initialCompanyDetails);
  const [clientDetails, setClientDetails] = useLocalStorage('clientDetails', initialClientDetails);
  const [invoiceDetails, setInvoiceDetails] = useLocalStorage('invoiceDetails', {
    ...initialInvoiceDetails,
    invoiceNo: `JODAP-${invoiceNumber}`
  });
  const [items, setItems] = useLocalStorage('invoiceItems', [initialItem]);
  const [notes, setNotes] = useLocalStorage('invoiceNotes', '');
  const [terms, setTerms] = useLocalStorage('invoiceTerms', defaultTerms);

  const previewRef = useRef(null);

  const state = {
    companyDetails, clientDetails, invoiceDetails, items, notes, terms
  };

  const setState = {
    setCompanyDetails, setClientDetails, setInvoiceDetails, setItems, setNotes, setTerms
  };

  const handleDownloadPDF = () => {
    const element = previewRef.current;
    if (!element) return;
    
    // Add success toast immediately or after promise
    const promise = new Promise((resolve) => {
      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `Invoice-${invoiceDetails.invoiceNo}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      
      html2pdf().set(opt).from(element).save().then(resolve);
    });

    toast.promise(promise, {
      loading: 'Generating PDF...',
      success: 'PDF downloaded successfully!',
      error: 'Error generating PDF.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewInvoice = () => {
    const nextNumber = invoiceNumber + 1;
    setInvoiceNumber(nextNumber);
    setInvoiceDetails({
      ...initialInvoiceDetails,
      invoiceNo: `JODAP-${nextNumber}`
    });
    setClientDetails(initialClientDetails);
    setItems([initialItem]);
    setNotes('');
    toast.success('New invoice started!');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col h-screen overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-white p-2 text-xl font-bold rounded-lg shadow-sm">
            JOD
          </div>
          <h1 className="text-xl font-bold text-gray-800">Invoice Generator</h1>
        </div>
        
        <div className="flex space-x-3 items-center">
          <button 
            onClick={handleNewInvoice}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium border border-gray-200"
          >
            <PlusCircle size={18} />
            <span>New Invoice</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md"
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        {/* Left Side: Form */}
        <div className="w-1/2 overflow-y-auto p-6 scrollbar-hide print:hidden border-r border-gray-200 bg-gray-50/50">
          <InvoiceForm state={state} setState={setState} />
        </div>
        
        {/* Right Side: Preview */}
        <div className="w-1/2 overflow-y-auto bg-gray-200 p-8 flex justify-center print:w-full print:p-0 print:bg-white">
          <div className="print-container transition-all ease-in-out">
            <div ref={previewRef} className="bg-white">
              <InvoicePreview state={state} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
