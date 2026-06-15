'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Upload, X, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight, RefreshCw, Info } from 'lucide-react';
import { useBulkCreateEnquiry } from '@/hooks/useEnquiries';
import { useStaffList } from '@/hooks/useStaff';
import { EnquiryStage, EnquiryPriority, EnquirySource, EventType } from '@/types/enquiry';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MappingState {
  [key: string]: number; // fieldKey -> csvColumnIndex
}

const SCHEMA_FIELDS = [
  { key: 'name', label: 'Customer Name *', required: true, synonyms: ['name', 'customer name', 'customer_name', 'full name', 'fullname', 'contact'] },
  { key: 'phone', label: 'Phone Number *', required: true, synonyms: ['phone', 'mobile', 'telephone', 'phone number', 'phonenumber', 'contact no', 'contact number', 'phone_number'] },
  { key: 'email', label: 'Email', required: false, synonyms: ['email', 'email address', 'email_address', 'mail'] },
  { key: 'eventDate', label: 'Event Date', required: false, synonyms: ['date', 'event date', 'event_date', 'eventdate', 'date of event', 'expected date', 'expected_date'] },
  { key: 'eventType', label: 'Event Type', required: false, synonyms: ['type', 'event type', 'event_type', 'eventtype', 'category', 'event category', 'event_category'] },
  { key: 'guestCount', label: 'Guest Count', required: false, synonyms: ['guests', 'guest count', 'guest_count', 'guestcount', 'pax', 'expected guests'] },
  { key: 'budgetMax', label: 'Budget / Max Budget', required: false, synonyms: ['budget', 'max budget', 'budget max', 'budget_max', 'budgetmax', 'estimated budget'] },
  { key: 'source', label: 'Acquisition Source', required: false, synonyms: ['source', 'lead source', 'lead_source', 'acquisition source', 'channel'] },
  { key: 'stage', label: 'Pipeline Stage', required: false, synonyms: ['stage', 'status', 'pipeline stage', 'lead stage', 'enquiry stage'] },
  { key: 'priority', label: 'Priority Level', required: false, synonyms: ['priority', 'lead priority', 'priority level', 'priority_level'] },
  { key: 'notes', label: 'Notes / Comments', required: false, synonyms: ['notes', 'comments', 'remarks', 'description', 'enquiry notes'] },
  { key: 'assignedTo', label: 'Assigned Staff', required: false, synonyms: ['assigned to', 'assigned_to', 'assignee', 'owner', 'staff', 'team member', 'assigned_staff'] },
];

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  
  // Mapping and Defaults
  const [mappings, setMappings] = useState<MappingState>({});
  const [defaultAssignee, setDefaultAssignee] = useState('');
  const [defaultStage, setDefaultStage] = useState<EnquiryStage>('new');
  const [defaultPriority, setDefaultPriority] = useState<EnquiryPriority>('medium');
  const [defaultSource, setDefaultSource] = useState<EnquirySource>('walk_in');

  const { data: staffData } = useStaffList({ limit: 100 });
  const staffList = staffData?.data || [];

  const bulkCreateMutation = useBulkCreateEnquiry();

  if (!isOpen) return null;

  // Custom robust CSV Parser
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next char
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        lines.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }

    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      lines.push(row);
    }

    return lines.filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        alert('CSV file must contain a header row and at least one data row.');
        return;
      }
      const fileHeaders = parsed[0];
      setHeaders(fileHeaders);
      setCsvData(parsed.slice(1));

      // Attempt fuzzy mapping
      const initialMappings: MappingState = {};
      SCHEMA_FIELDS.forEach((field) => {
        const index = fileHeaders.findIndex((header) => {
          const normHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          return field.synonyms.some(syn => {
            const normSyn = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normHeader === normSyn || normHeader.includes(normSyn) || normSyn.includes(normHeader);
          });
        });
        if (index !== -1) {
          initialMappings[field.key] = index;
        }
      });
      setMappings(initialMappings);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleMapChange = (fieldKey: string, columnIndex: number) => {
    setMappings(prev => {
      const updated = { ...prev };
      if (columnIndex === -1) {
        delete updated[fieldKey];
      } else {
        updated[fieldKey] = columnIndex;
      }
      return updated;
    });
  };

  const resetState = () => {
    setCsvData([]);
    setHeaders([]);
    setFileName('');
    setMappings({});
    setDefaultAssignee('');
    setDefaultStage('new');
    setDefaultPriority('medium');
    setDefaultSource('walk_in');
  };

  // Process rows based on mapping configuration
  const parsedRecords = useMemo(() => {
    if (csvData.length === 0) return [];

    return csvData.map((row, index) => {
      const record: any = {};
      
      SCHEMA_FIELDS.forEach(field => {
        const colIdx = mappings[field.key];
        if (colIdx !== undefined && colIdx < row.length) {
          record[field.key] = row[colIdx];
        }
      });

      // Validations
      const nameVal = record.name?.trim();
      const phoneVal = record.phone?.trim();
      const isValid = nameVal && phoneVal;

      // Map event type if present
      let eventTypeVal: EventType = 'other';
      if (record.eventType) {
        const t = record.eventType.toLowerCase().trim();
        if (['wedding', 'engagement', 'reception', 'birthday', 'corporate', 'anniversary', 'other'].includes(t)) {
          eventTypeVal = t as EventType;
        }
      }

      // Map source if present
      let sourceVal: EnquirySource = defaultSource;
      if (record.source) {
        const s = record.source.toLowerCase().trim();
        if (['walk_in', 'phone', 'whatsapp', 'instagram', 'facebook', 'google', 'justdial', 'referral', 'other'].includes(s)) {
          sourceVal = s as EnquirySource;
        }
      }

      // Map stage if present
      let stageVal: EnquiryStage = defaultStage;
      if (record.stage) {
        const st = record.stage.toLowerCase().trim();
        if (['new', 'interested', 'visit_scheduled', 'visited', 'booked', 'lost'].includes(st)) {
          stageVal = st as EnquiryStage;
        }
      }

      // Map priority if present
      let priorityVal: EnquiryPriority = defaultPriority;
      if (record.priority) {
        const p = record.priority.toLowerCase().trim();
        if (['high', 'medium', 'low'].includes(p)) {
          priorityVal = p as EnquiryPriority;
        }
      }

      // Map assignee ID if present in columns (by email or name match)
      let assignedToVal = defaultAssignee;
      if (record.assignedTo) {
        const textToMatch = record.assignedTo.toLowerCase().trim();
        const matchedStaff = staffList.find(
          s => s.name.toLowerCase().includes(textToMatch) || s.email.toLowerCase() === textToMatch
        );
        if (matchedStaff) {
          assignedToVal = matchedStaff.id;
        }
      }

      // Format eventDate if valid date string
      let formattedEventDate = undefined;
      if (record.eventDate) {
        const dateObj = new Date(record.eventDate);
        if (!isNaN(dateObj.getTime())) {
          formattedEventDate = dateObj.toISOString().substring(0, 10);
        }
      }

      return {
        rowNumber: index + 1,
        name: nameVal || '',
        phone: phoneVal || '',
        email: record.email || '',
        eventDate: formattedEventDate,
        eventType: eventTypeVal,
        guestCount: record.guestCount ? parseInt(record.guestCount, 10) || undefined : undefined,
        budgetMax: record.budgetMax ? parseInt(record.budgetMax, 10) || undefined : undefined,
        source: sourceVal,
        stage: stageVal,
        priority: priorityVal,
        notes: record.notes || '',
        assignedTo: assignedToVal || undefined,
        isValid,
      };
    });
  }, [csvData, mappings, defaultAssignee, defaultStage, defaultPriority, defaultSource, staffList]);

  const validationSummary = useMemo(() => {
    const total = parsedRecords.length;
    const valid = parsedRecords.filter(r => r.isValid).length;
    const invalid = total - valid;
    return { total, valid, invalid };
  }, [parsedRecords]);

  const handleImportSubmit = async () => {
    const validPayloads = parsedRecords.filter(r => r.isValid).map(r => {
      // Map to backend schema requirements
      return {
        customer_name: r.name,
        phone: r.phone,
        email: r.email || undefined,
        event_type: r.eventType,
        expected_date: r.eventDate || undefined,
        guest_count: r.guestCount,
        budget_max: r.budgetMax,
        source: r.source,
        stage: r.stage,
        priority: r.priority,
        notes: r.notes || undefined,
        assigned_to: r.assignedTo || undefined,
      };
    });

    if (validPayloads.length === 0) return;

    try {
      await bulkCreateMutation.mutateAsync(validPayloads);
      resetState();
      onSuccess();
      onClose();
    } catch (err) {
      // toast.error is already handled by hook
    }
  };

  const previewRecords = parsedRecords.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5.5 w-5.5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-slate-850 text-base leading-tight">Import Enquiries CSV</h3>
              <p className="text-[10px] text-slate-450 font-bold">Import bulk client leads into your CRM pipeline</p>
            </div>
          </div>
          <button 
            onClick={() => { resetState(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {csvData.length === 0 ? (
            /* STAGE 1: Dropzone */
            <div className="space-y-5">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/20 scale-[0.99]' 
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/25'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">Drag & drop your CSV file here</h4>
                <p className="text-[10px] text-slate-450 mt-1 max-w-xs leading-normal">
                  Or <span className="text-indigo-600 hover:underline">browse files</span>. Make sure your file is formatted correctly as a standard comma-separated text file.
                </p>
              </div>

              {/* Instructions Panel */}
              <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-4 flex gap-3 text-slate-700">
                <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-indigo-950">CSV File Preparation Guidelines</h4>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] font-semibold text-slate-600 leading-normal">
                    <li>Required Columns: <strong>Customer Name</strong> and <strong>Phone Number</strong>. If these are missing, the row will be skipped.</li>
                    <li>Dates must be in a readable format (e.g. YYYY-MM-DD).</li>
                    <li>If columns don't match our headers, you'll map them manually in the next step.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* STAGE 2: Mappings & Preview */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Columns mapping config column */}
              <div className="lg:col-span-1 border border-slate-100 rounded-xl bg-slate-50/50 p-4 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-850 uppercase tracking-wide">Column Mapping</h4>
                  <button 
                    onClick={resetState}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset File
                  </button>
                </div>
                
                <div className="space-y-3.5">
                  {SCHEMA_FIELDS.map((field) => {
                    const isMapped = mappings[field.key] !== undefined;
                    return (
                      <div key={field.key} className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-655 flex justify-between uppercase">
                          <span>{field.label}</span>
                          {field.required && <span className="text-rose-500 font-bold">Required</span>}
                        </label>
                        <select
                          value={mappings[field.key] ?? -1}
                          onChange={(e) => handleMapChange(field.key, Number(e.target.value))}
                          className={`h-8 px-2 text-[11px] font-bold bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                            field.required && !isMapped 
                              ? 'border-rose-300 bg-rose-50/10' 
                              : 'border-slate-200'
                          }`}
                        >
                          <option value={-1}>-- Unmapped / Skip --</option>
                          {headers.map((hdr, idx) => (
                            <option key={idx} value={idx}>
                              Column {idx + 1}: {hdr}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preview & Defaults column */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Defaults Panel */}
                <div className="border border-slate-150 rounded-xl p-4 bg-white shadow-custom-xs space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-850 border-b border-slate-50 pb-2">
                    Fallback Default Values (For missing or unmapped columns)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Default Assignee</label>
                      <select
                        value={defaultAssignee}
                        onChange={(e) => setDefaultAssignee(e.target.value)}
                        className="h-8 px-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Default Stage</label>
                      <select
                        value={defaultStage}
                        onChange={(e) => setDefaultStage(e.target.value as EnquiryStage)}
                        className="h-8 px-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="new">New Lead</option>
                        <option value="interested">Interested</option>
                        <option value="visit_scheduled">Visit Scheduled</option>
                        <option value="visited">Visited</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Default Priority</label>
                      <select
                        value={defaultPriority}
                        onChange={(e) => setDefaultPriority(e.target.value as EnquiryPriority)}
                        className="h-8 px-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-slate-400">Default Source</label>
                      <select
                        value={defaultSource}
                        onChange={(e) => setDefaultSource(e.target.value as EnquirySource)}
                        className="h-8 px-2 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="walk_in">Walk-in</option>
                        <option value="phone">Phone Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="google">Google</option>
                        <option value="justdial">JustDial</option>
                        <option value="referral">Referral</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Validation Stats & Preview table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-100 rounded-lg px-4 py-2 border border-slate-200">
                    <div className="flex gap-4 text-xs font-bold text-slate-655">
                      <span>Total: <strong className="text-slate-800">{validationSummary.total}</strong></span>
                      <span className="text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Valid: {validationSummary.valid}
                      </span>
                      {validationSummary.invalid > 0 && (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" /> Ignored: {validationSummary.invalid}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{fileName}</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] font-semibold text-slate-655 border-collapse text-left">
                        <thead className="bg-slate-50 font-black text-slate-400 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2">Row</th>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Phone</th>
                            <th className="px-3 py-2">Event</th>
                            <th className="px-3 py-2">Budget</th>
                            <th className="px-3 py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewRecords.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-3 py-2 font-mono text-slate-400">#{r.rowNumber}</td>
                              <td className="px-3 py-2 font-extrabold text-slate-800">{r.name || <span className="text-rose-405 italic">Missing</span>}</td>
                              <td className="px-3 py-2 font-mono">{r.phone || <span className="text-rose-405 italic">Missing</span>}</td>
                              <td className="px-3 py-2">
                                <span className="bg-slate-100 px-1 py-0.5 rounded text-[8px] font-bold uppercase border border-slate-150 mr-1">
                                  {r.eventType}
                                </span>
                                <span className="font-mono text-slate-400">{r.eventDate || '—'}</span>
                              </td>
                              <td className="px-3 py-2 font-mono">{r.budgetMax ? `₹${r.budgetMax.toLocaleString('en-IN')}` : '—'}</td>
                              <td className="px-3 py-2 text-right">
                                {r.isValid ? (
                                  <span className="text-green-600 font-extrabold bg-green-50 px-1.5 py-0.5 rounded text-[8px] border border-green-100">Ready</span>
                                ) : (
                                  <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded text-[8px] border border-rose-100" title="Missing required fields Name or Phone">Skip</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {validationSummary.total > 5 && (
                      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                        Showing first 5 rows of {validationSummary.total} parsed records
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 select-none">
          <button
            type="button"
            disabled={bulkCreateMutation.isPending}
            onClick={() => { resetState(); onClose(); }}
            className="h-9.5 px-4.5 border border-slate-250 hover:border-slate-400 hover:bg-white rounded-lg text-xs font-bold text-slate-600 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            Cancel
          </button>

          {csvData.length > 0 && (
            <button
              type="button"
              disabled={bulkCreateMutation.isPending || validationSummary.valid === 0}
              onClick={handleImportSubmit}
              className="h-9.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-extrabold tracking-wider uppercase shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span>Import {validationSummary.valid} Leads</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default CSVImportModal;
