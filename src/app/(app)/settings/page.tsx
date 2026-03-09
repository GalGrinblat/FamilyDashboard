import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { Settings as SettingsIcon } from "lucide-react"
import { CategoryManager } from "./CategoryManager"

type CategoryRow = Database['public']['Tables']['categories']['Row']

export default async function SettingsPage() {
    const supabase = await createClient()

    // Fetch all categories, order by name
    const { data: rawCategories } = await supabase
        .from('categories')
        .select('*')
        .order('name_he', { ascending: true })

    const categories = (rawCategories || []) as CategoryRow[]

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <SettingsIcon className="h-8 w-8 text-zinc-400" />
                    הגדרות מתקדמות
                </h2>
            </div>

            <Tabs defaultValue="categories" className="w-full mt-6" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="categories">קטגוריות</TabsTrigger>
                    <TabsTrigger value="general" disabled>הגדרות מערכת</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    <CategoryManager initialCategories={categories} />
                </TabsContent>
                {/* Placeholder for future general settings */}
            </Tabs>
        </div>
    )
}
