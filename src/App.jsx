import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, PlusCircle, FileText, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import useLocalStorage from './hooks/useLocalStorage';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { initialCompanyDetails, initialClientDetails, initialInvoiceDetails, defaultNotes, defaultTerms, initialItem } from './utils/initialData';
import { Toaster, toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

function App() {
  const [invoiceNumber, setInvoiceNumber] = useLocalStorage('lastInvoiceNumber', 26001);
  const [companyDetails, setCompanyDetails] = useLocalStorage('companyDetails', initialCompanyDetails);

  // Migration: Ensure the default logo is applied if the user has no logo or a broken path
  useEffect(() => {
    const currentLogo = companyDetails.logo;
    if (!currentLogo || (typeof currentLogo === 'string' && currentLogo.includes('/assets/logo.jpg'))) {
      setCompanyDetails(prev => ({ ...prev, logo: initialCompanyDetails.logo }));
    }
  }, []);
  const [clientDetails, setClientDetails] = useLocalStorage('clientDetails', initialClientDetails);
  const [invoiceDetails, setInvoiceDetails] = useLocalStorage('invoiceDetails', {
    ...initialInvoiceDetails,
    invoiceNo: `JODAP-${invoiceNumber}`
  });
  const [items, setItems] = useLocalStorage('invoiceItems', [initialItem]);
  const [notes, setNotes] = useLocalStorage('invoiceNotes', defaultNotes);
  const [terms, setTerms] = useLocalStorage('invoiceTerms', defaultTerms);
  const [quotationNote, setQuotationNote] = useLocalStorage('quotationNote', '');
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef(null);
  const previewRef = useRef(null);
  const formScrollRef = useRef(null);

  const scrollToBottom = () => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ top: formScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollTo({ top: previewContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dynamically scale A4 preview to fit container width
  useEffect(() => {
    const A4_PX = 794; // ~210mm at 96dpi
    const updateScale = () => {
      const container = previewContainerRef.current;
      if (!container) return;
      const available = container.clientWidth - 48; // account for padding
      const scale = available < A4_PX ? Math.max(0.28, available / A4_PX) : 1;
      setPreviewScale(scale);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (previewContainerRef.current) ro.observe(previewContainerRef.current);
    return () => ro.disconnect();
  }, [mobileTab]);

  const state = {
    companyDetails, clientDetails, invoiceDetails, items, notes, terms, quotationNote
  };

  const setState = {
    setCompanyDetails, setClientDetails, setInvoiceDetails, setItems, setNotes, setTerms, setQuotationNote
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
    setNotes(defaultNotes);
    setTerms(defaultTerms);
    setQuotationNote('');
    toast.success('New invoice started!');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col h-screen overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10 shrink-0 print:hidden">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-primary text-white px-2 py-1.5 sm:p-2 text-base sm:text-xl font-bold rounded-lg shadow-sm">
            JOD
          </div>
          <h1 className="text-base sm:text-xl font-bold text-gray-800 hidden sm:block">Invoice Generator</h1>
          <h1 className="text-base font-bold text-gray-800 sm:hidden">Invoice</h1>
        </div>
        
        <div className="flex space-x-1.5 sm:space-x-3 items-center">
          <button 
            onClick={handleNewInvoice}
            title="New Invoice"
            className="flex items-center space-x-1.5 px-2 sm:px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium border border-gray-200"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">New Invoice</span>
          </button>
          <button 
            onClick={handlePrint}
            title="Print"
            className="flex items-center space-x-1.5 px-2 sm:px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            title="Download PDF"
            className="flex items-center space-x-1.5 px-2 sm:px-4 py-2 bg-primary hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="flex lg:hidden border-b border-gray-200 bg-white shrink-0 print:hidden">
        <button
          onClick={() => setMobileTab('form')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
            mobileTab === 'form'
              ? 'text-primary border-b-2 border-primary bg-green-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />
          Edit Form
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
            mobileTab === 'preview'
              ? 'text-primary border-b-2 border-primary bg-green-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden print:block print:overflow-visible">
        {/* Left Side: Form */}
        <div 
          ref={formScrollRef}
          className={`${
          mobileTab === 'form' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 scrollbar-hide print:hidden border-r border-gray-200 bg-gray-50/50 flex-col`}>
          <InvoiceForm state={state} setState={setState} />
        </div>
        
        {/* Right Side: Preview */}
        <div
          ref={previewContainerRef}
          className={`${
            mobileTab === 'preview' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-1/2 overflow-y-auto bg-gray-200 p-4 sm:p-6 lg:p-8 justify-center print:w-full print:p-0 print:bg-white`}
        >
          {/* Scale wrapper: A4 scales to fit container, negative margin collapses unused space */}
          <div className="preview-scale-wrapper">
            <div
              ref={previewRef}
              className="bg-white print:!transform-none"
              style={{
                transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
                transformOrigin: 'top center',
                // Pull subsequent content up to eliminate blank space left by transform
                marginBottom: previewScale < 1
                  ? `${-(1 - previewScale) * (previewRef.current?.offsetHeight ?? 1122)}px`
                  : undefined,
              }}
            >
              <InvoicePreview state={state} />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Scroll Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 print:hidden">
        <button
          onClick={scrollToTop}
          className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
        <button
          onClick={scrollToBottom}
          className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Scroll to Bottom"
        >
          <ArrowDown size={20} />
        </button>
      </div>

    </div>
  );
}

export default App;
