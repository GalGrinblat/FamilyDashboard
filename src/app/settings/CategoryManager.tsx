"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"

type CategoryRow = Database['public']['Tables']['categories']['Row']

export function CategoryManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
    const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Form state
    const [nameHe, setNameHe] = useState("")
    const [nameEn, setNameEn] = useState("")
    const [type, setType] = useState("expense")

    const handleOpenDialog = (category?: CategoryRow) => {
        if (category) {
            setEditingCategory(category)
            setNameHe(category.name_he)
            setNameEn(category.name_en)
            setType(category.type)
        } else {
            setEditingCategory(null)
            setNameHe("")
            setNameEn("")
            setType("expense")
        }
        setOpen(true)
    }

    const handleDelete = async (id: string, nameHe: string) => {
        if (!confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${nameHe}"? פעולה זו תיכשל אם ישנן עסקאות מקושרות.`)) return

        const { error } = await supabase.from("categories").delete().eq("id", id)
        if (error) {
            alert("שגיאה במחיקת הקטגוריה. ייתכן שיש עסקאות המקושרות אליה.")
            console.error(error)
            return
        }

        setCategories(categories.filter(c => c.id !== id))
        router.refresh()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name_he: nameHe,
            name_en: nameEn || nameHe, // default to HE if missing to prevent null issues
            type,
        }

        if (editingCategory) {
            const { data, error } = await supabase
                .from("categories")
                // @ts-expect-error: dynamic insert
                .update(payload)
                .eq("id", editingCategory.id)
                .select()
                .single()

            if (error) {
                alert("שגיאה בעדכון הקטגוריה")
                console.error(error)
            } else if (data) {
                const updatedCategory = data as any
                setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory as CategoryRow : c))
            }
        } else {
            const { data, error } = await supabase
                .from("categories")
                // @ts-expect-error: dynamic insert
                .insert(payload)
                .select()
                .single()

            if (error) {
                alert("שגיאה ביצירת הקטגוריה")
                console.error(error)
            } else if (data) {
                setCategories([...categories, data as CategoryRow])
            }
        }

        setLoading(false)
        setOpen(false)
        router.refresh()
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                        <Tag className="h-5 w-5 text-indigo-500" />
                        ניהול קטגוריות
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        הוסף, ערוך או מחק קטגוריות עבור עסקאות הפיננסים שלך.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> הוסף קטגוריה
                </Button>
            </div>

            <div className="border rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">שם (עברית)</TableHead>
                            <TableHead className="text-right">שם (En)</TableHead>
                            <TableHead className="text-right">סוג</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center p-8 text-muted-foreground">
                                    אין קטגוריות להצגה.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map(category => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name_he}</TableCell>
                                    <TableCell className="text-muted-foreground">{category.name_en}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${category.type === 'expense' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                            {category.type === 'expense' ? 'הוצאה' : 'הכנסה'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                                                <Pencil className="h-4 w-4 text-zinc-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id, category.name_he)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "עריכת קטגוריה" : "יצירת קטגוריה חדשה"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "עדכן את פרטי הקטגוריה." : "הוסף קטגוריה חדשה לסיווג עסקאות."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nameHe" className="text-right">שם (עברית)</Label>
                            <Input
                                id="nameHe"
                                value={nameHe}
                                onChange={e => setNameHe(e.target.value)}
                                className="col-span-3"
                                required
                                placeholder="למשל: תקשורת"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nameEn" className="text-right">שם (אנגלית)</Label>
                            <Input
                                id="nameEn"
                                value={nameEn}
                                onChange={e => setNameEn(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Communications"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">סוג</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="בחר סוג" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="expense">הוצאה (-)</SelectItem>
                                    <SelectItem value="income">הכנסה (+)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "שומר..." : "שמור"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
