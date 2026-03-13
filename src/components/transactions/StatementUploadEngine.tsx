'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';

export interface ParsedTransactionRow {
  date: string;
  amount: number;
  description: string;
  reference_number?: string;
  original_row_data: Record<string, unknown>;
}
export function StatementUploadEngine({
  onUploadComplete,
}: {
  onUploadComplete: (data: ParsedTransactionRow[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Handle standard file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleFileValidation = (file: File) => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');

    if (isExcel) {
      parseExcel(file);
    } else if (isCsv) {
      parseCSV(file);
    } else {
      alert('אנא העלה קובץ CSV או Excel תקין מהבנק.');
    }
  };

  // Shared row extraction and heuristics logic
  const processJsonRows = (rawRows: Record<string, unknown>[]) => {
    const parsedData: ParsedTransactionRow[] = [];

    const parseIsraeliDate = (dStr: string): string => {
      if (!dStr) return new Date().toISOString();

      // Handle Excel serial date strings (e.g. "45300")
      // Commonly used in .xlsx banks extracts
      if (/^\d{5}(\.\d+)?$/.test(dStr.trim())) {
        const excelDays = parseFloat(dStr.trim());
        // Excel epoch is Dec 30, 1899
        const dateObj = new Date(Date.UTC(1899, 11, 30));
        dateObj.setUTCDate(dateObj.getUTCDate() + excelDays);
        return dateObj.toISOString().split('T')[0];
      }

      const trimmed = dStr.trim().split(/[ T]/)[0]; // Handle trailing time
      const parts = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
      if (parts) {
        const day = parts[1].padStart(2, '0');
        const month = parts[2].padStart(2, '0');
        let year = parts[3];
        if (year.length === 2) year = '20' + year;
        return `${year}-${month}-${day}`;
      }
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return new Date().toISOString();
    };

    rawRows.forEach((row) => {
      // Primitive guessing logic for Heuristic mapping

      // Try to find amount (Isracard Hebrew uses "סכום חיוב")
      let amountStr = '0';
      for (const key of Object.keys(row)) {
        const lKey = key.toLowerCase();
        if (lKey.includes('סכום חיוב') || lKey.includes('amount') || lKey.includes('חיוב')) {
          amountStr = String(row[key]);
          break;
        }
      }
      if (amountStr === '0') {
        // fallback general amount
        for (const key of Object.keys(row)) {
          const lKey = key.toLowerCase();
          if (lKey.includes('סכום')) {
            amountStr = String(row[key]);
            break;
          }
        }
      }

      // Try to find date (Isracard Hebrew uses "תאריך רכישה" or "תאריך")
      let dateStr = new Date().toISOString();
      for (const key of Object.keys(row)) {
        const lKey = key.toLowerCase();
        if (lKey.includes('תאריך') || lKey.includes('date')) {
          dateStr = parseIsraeliDate(String(row[key]));
          break;
        }
      }

      // Try to find Description / Merchant (Isracard Hebrew uses "שם בית עסק")
      let descStr = 'Unknown Transaction';
      for (const key of Object.keys(row)) {
        const lKey = key.toLowerCase();
        if (
          lKey.includes('שם בית עסק') ||
          lKey.includes('תיאור') ||
          lKey.includes('merchant') ||
          lKey.includes('description') ||
          lKey.includes('פרטים')
        ) {
          descStr = String(row[key]);
          break;
        }
      }

      // Skip invalid empty heuristic rows
      const amountVal = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));
      if (isNaN(amountVal) || !dateStr || descStr === 'Unknown Transaction') {
        // Ignore headers or empty padding rows
        return;
      }

      parsedData.push({
        date: dateStr,
        amount: amountVal,
        description: descStr,
        original_row_data: row,
      });
    });

    setIsParsing(false);
    onUploadComplete(parsedData);
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as Record<string, unknown>[];
        processJsonRows(rawRows);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('אירעה שגיאה בקריאת הקובץ.');
        setIsParsing(false);
      },
    });
  };

  const parseExcel = async (file: File) => {
    setIsParsing(true);
    try {
      // Dynamically import xlsx only when needed avoiding heavy client bundle
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get 2D array to find the hidden Headers row since Banks pad the top
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(20, rawData.length); i++) {
          const rowStr = JSON.stringify(rawData[i] || []).toLowerCase();
          if (rowStr.includes('תאריך') && (rowStr.includes('סכום') || rowStr.includes('amount'))) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          alert('לא נמצאה שורת כותרת מזוהה בקובץ האקסל (Date/Amount/תאריך/סכום).');
          setIsParsing(false);
          return;
        }

        const headers = rawData[headerRowIdx] as string[];

        // Convert remaining rows into our Record array format expected by logic
        const rowsAsObjects: Record<string, unknown>[] = [];
        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          if (!rawData[i] || rawData[i].length === 0) continue;

          const obj: Record<string, unknown> = {};
          const rowArr = rawData[i] as unknown[];
          for (let j = 0; j < headers.length; j++) {
            if (headers[j]) {
              obj[headers[j]] = rowArr[j];
            }
          }
          rowsAsObjects.push(obj);
        }

        processJsonRows(rowsAsObjects);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Excel parse error', error);
      alert('אירעה שגיאה בפענוח מצורף אקסל. נסה לשמור כ-CSV.');
      setIsParsing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 bg-zinc-50 dark:bg-zinc-900/50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">ייבוא מהיר של נתונים (.CSV, .XLSX)</CardTitle>
        <CardDescription>
          גרור ושחרר קובץ אקסל או CSV שהורדו ישירות מהבנק או מחברת האשראי
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer
                        ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}
                    `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isParsing}
          />

          {isParsing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium">המערכת מנתחת ומפצחת את הנתונים...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium">לחץ לבחירת קובץ או גרור למסגרת</p>
                <p className="text-sm text-muted-foreground">
                  תמיכה מלאה ב-Excel וב-CSV (לדוגמה: ישראכרט, כאל, לאומי)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
