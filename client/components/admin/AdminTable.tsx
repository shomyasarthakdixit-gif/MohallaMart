"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T | ((item: T) => React.ReactNode | string | number | boolean);
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  searchPlaceholder?: string;
  searchFn?: (item: T, query: string) => boolean;
  emptyMessage?: string;
}

export function AdminTable<T>({ 
  columns, 
  data, 
  searchPlaceholder = "Search...", 
  searchFn,
  emptyMessage = "No records found."
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = searchFn && searchQuery 
    ? data.filter(item => searchFn(item, searchQuery))
    : data;

  return (
    <div className="space-y-4">
      {searchFn && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-surface border-border/50"
          />
        </div>
      )}
      
      <div className="border border-border/50 rounded-xl bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 font-semibold ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-6 py-4 ${col.className || ""}`}>
                      {col.cell ? col.cell(item) : (col.accessorKey && typeof col.accessorKey === 'function' ? col.accessorKey(item) : (col.accessorKey ? String(item[col.accessorKey]) : null))}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
