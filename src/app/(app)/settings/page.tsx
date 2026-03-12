import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { Settings as SettingsIcon } from "lucide-react"
import { CategoryManager } from "./CategoryManager"
import { SystemSettingsTab } from "@/components/settings/SystemSettingsTab"
import { PageHeader } from "@/components/layout/PageHeader"

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
            <PageHeader title="הגדרות מתקדמות" icon={SettingsIcon} />

            <Tabs defaultValue="categories" className="w-full mt-6" dir="rtl">
                <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="categories">קטגוריות</TabsTrigger>
                    <TabsTrigger value="general">הגדרות מערכת</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    <CategoryManager initialCategories={categories} />
                </TabsContent>

                <TabsContent value="general" className="space-y-4">
                    <SystemSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
