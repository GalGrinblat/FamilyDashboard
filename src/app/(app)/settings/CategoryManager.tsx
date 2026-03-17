'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAINS,
  CategoryType,
  CategoryDomain,
  CATEGORY_TYPE_LABELS,
  CATEGORY_DOMAIN_SHORT_LABELS,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Tag, ArrowUpDown, LayoutList } from 'lucide-react';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [sortBy, setSortBy] = useState<'name_he' | 'name_en' | 'type'>('name_he');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'domain' | 'none'>('domain');
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [nameHe, setNameHe] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<CategoryType>(CATEGORY_TYPES.EXPENSE);
  const [domain, setDomain] = useState<CategoryDomain>(CATEGORY_DOMAINS.GENERAL);

  const handleOpenDialog = (category?: CategoryRow) => {
    if (category) {
      setEditingCategory(category);
      setNameHe(category.name_he);
      setNameEn(category.name_en);
      setType(category.type as CategoryType);
      setDomain((category.domain || CATEGORY_DOMAINS.GENERAL) as CategoryDomain);
    } else {
      setEditingCategory(null);
      setNameHe('');
      setNameEn('');
      setType(CATEGORY_TYPES.EXPENSE);
      setDomain(CATEGORY_DOMAINS.GENERAL);
    }
    setOpen(true);
  };

  const handleDelete = async (id: string, nameHe: string) => {
    if (
      !confirm(
        `האם אתה בטוח שברצונך למחוק את הקטגוריה "${nameHe}"? פעולה זו תיכשל אם ישנן עסקאות מקושרות.`,
      )
    )
      return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('שגיאה במחיקת הקטגוריה. ייתכן שיש עסקאות המקושרות אליה.');
      console.error(error);
      return;
    }

    setCategories(categories.filter((c) => c.id !== id));
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name_he: nameHe,
      name_en: nameEn || nameHe, // default to HE if missing to prevent null issues
      type,
      domain,
    };

    if (editingCategory) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingCategory.id)
        .select()
        .single();

      if (error) {
        alert('שגיאה בעדכון הקטגוריה');
        console.error(error);
      } else if (data) {
        const updatedCategory = data as CategoryRow;
        setCategories(categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
      }
    } else {
      const { data, error } = await supabase.from('categories').insert(payload).select().single();

      if (error) {
        alert('שגיאה ביצירת הקטגוריה');
        console.error(error);
      } else if (data) {
        setCategories([...categories, data as CategoryRow]);
      }
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  // --- Derived State: Sorting and Grouping ---
  const sortedCategories = [...categories].sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';

    // special case for type to sort by meaningful strings
    if (sortBy === 'type') {
      valA = (a.type as string) === CATEGORY_TYPES.EXPENSE ? 'הוצאה' : 'הכנסה';
      valB = (b.type as string) === CATEGORY_TYPES.EXPENSE ? 'הוצאה' : 'הכנסה';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const groupedCategories = (() => {
    if (groupBy === 'none') return { all: sortedCategories };

    const groups: Record<string, CategoryRow[]> = {};
    sortedCategories.forEach((cat) => {
      const domainKey = cat.domain || CATEGORY_DOMAINS.GENERAL;
      if (!groups[domainKey]) groups[domainKey] = [];
      groups[domainKey].push(cat);
    });

    // Sort the group keys (domains) predictably
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const labelA = CATEGORY_DOMAIN_SHORT_LABELS[a as CategoryDomain] || a;
      const labelB = CATEGORY_DOMAIN_SHORT_LABELS[b as CategoryDomain] || b;
      return labelA.localeCompare(labelB, 'he');
    });

    const sortedGroups: Record<string, CategoryRow[]> = {};
    sortedKeys.forEach((k) => {
      sortedGroups[k] = groups[k];
    });

    return sortedGroups;
  })();

  const handleSort = (column: 'name_he' | 'name_en' | 'type') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-500" />
            ניהול קטגוריות
          </h3>
          <p className="text-lg text-muted-foreground">
            הוסף, ערוך או מחק קטגוריות עבור עסקאות הפיננסים שלך.
          </p>
          <p className="text-lg text-muted-foreground">
            הוסף, ערוך או מחק קטגוריות עבור עסקאות הפיננסים שלך.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3">
            <LayoutList className="w-4 h-4 text-zinc-500" />
            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">קבץ לפי:</span>
            <Select value={groupBy} onValueChange={(val: 'domain' | 'none') => setGroupBy(val)}>
              <SelectTrigger className="h-8 border-0 bg-transparent shadow-none w-[120px] focus:ring-0 px-2 pl-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="domain">אזור במערכת</SelectItem>
                <SelectItem value="none">ללא קיבוץ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> הוסף קטגוריה
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-right cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => handleSort('name_he')}
              >
                <div className="flex items-center gap-1 justify-end">
                  {sortBy === 'name_he' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  שם (עברית)
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => handleSort('name_en')}
              >
                <div className="flex items-center gap-1 justify-end">
                  {sortBy === 'name_en' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  שם (En)
                </div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1 justify-end">
                  {sortBy === 'type' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                  סוג
                </div>
              </TableHead>
              <TableHead className="text-right">שיוך דיגיטלי (Domain)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-8 text-muted-foreground">
                  אין קטגוריות להצגה.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedCategories).map(([groupKey, groupCats]) => (
                <React.Fragment key={groupKey}>
                  {groupBy === 'domain' && groupKey !== 'all' && (
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <TableCell
                        colSpan={5}
                        className="py-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-t border-b"
                      >
                        {CATEGORY_DOMAIN_SHORT_LABELS[groupKey as CategoryDomain] || 'כללי'}
                        <span className="text-muted-foreground font-normal mx-2 inline-block">
                          ({groupCats.length})
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                  {groupCats.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name_he}</TableCell>
                      <TableCell className="text-muted-foreground">{category.name_en}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-semibold ${category.type === CATEGORY_TYPES.EXPENSE ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                        >
                          {category.type === CATEGORY_TYPES.EXPENSE ? 'הוצאה' : 'הכנסה'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {CATEGORY_DOMAIN_SHORT_LABELS[category.domain as CategoryDomain] ||
                          CATEGORY_DOMAIN_SHORT_LABELS[CATEGORY_DOMAINS.GENERAL]}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Pencil className="h-4 w-4 text-zinc-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id, category.name_he)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'עריכת קטגוריה' : 'יצירת קטגוריה חדשה'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'עדכן את פרטי הקטגוריה.' : 'הוסף קטגוריה חדשה לסיווג עסקאות.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameHe" className="text-right">
                שם (עברית)
              </Label>
              <Input
                id="nameHe"
                value={nameHe}
                onChange={(e) => setNameHe(e.target.value)}
                className="col-span-3"
                required
                placeholder="למשל: תקשורת"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameEn" className="text-right">
                שם (אנגלית)
              </Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Communications"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                סוג
              </Label>
              <Select value={type} onValueChange={(val) => setType(val as CategoryType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value={CATEGORY_TYPES.EXPENSE}>
                    {CATEGORY_TYPE_LABELS[CATEGORY_TYPES.EXPENSE]}
                  </SelectItem>
                  <SelectItem value={CATEGORY_TYPES.INCOME}>
                    {CATEGORY_TYPE_LABELS[CATEGORY_TYPES.INCOME]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right">
                שיוך אזור
              </Label>
              <Select value={domain} onValueChange={(val) => setDomain(val as CategoryDomain)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="בחר אזור באפליקציה" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value={CATEGORY_DOMAINS.GENERAL}>כללי (מופיע רק בעו״ש)</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.HOUSING}>מגורים ומשק בית</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.TRANSPORTATION}>תחבורה ורכבים</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.INSURANCES}>ביטוחים</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.UTILITIES}>
                    חשבונות (מים, חשמל, גז)
                  </SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.SUPERMARKET}>סופרמרקט ומכולת</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.HOBBIES}>חוגים ופנאי</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.ENTERTAINMENT}>בילויים ומסעדות</SelectItem>
                  <SelectItem value={CATEGORY_DOMAINS.VACATION}>חופשות וטיולים</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'שומר...' : 'שמור'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
