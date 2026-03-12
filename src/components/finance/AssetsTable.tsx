"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "@/types/database.types"
import { TrendingUp, Building2, Bitcoin, LineChart, Trash2 } from "lucide-react"
import { AssetDialog } from "./AssetDialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ASSET_TYPES, ASSET_TYPE_LABELS, AssetType } from "@/lib/constants"

type AssetRow = Database["public"]["Tables"]["assets"]["Row"]

export function AssetsTable({ assets }: { assets: AssetRow[] }) {
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (id: string) => {
        if (!window.confirm("האם למחוק נכס זה? הפעולה אינה הפיכה.")) return
        const { error } = await supabase.from('assets').delete().eq('id', id)
        if (error) {
            console.error(error)
            alert("שגיאה במחיקת הנכס")
        } else {
            router.refresh()
        }
    }

    const typeIcons: Record<string, React.ReactNode> = {
        [ASSET_TYPES.STOCK]: <LineChart className="h-4 w-4 text-blue-500" />,
        [ASSET_TYPES.CRYPTO]: <Bitcoin className="h-4 w-4 text-orange-500" />,
        [ASSET_TYPES.REAL_ESTATE]: <Building2 className="h-4 w-4 text-emerald-500" />,
        [ASSET_TYPES.OTHER]: <TrendingUp className="h-4 w-4 text-zinc-500" />
    }

    const typeLabels = ASSET_TYPE_LABELS

    const totalValue = assets.reduce((sum, a) => sum + Number(a.estimated_value || 0), 0)

    // Grouping assets
    const grouped = assets.reduce((acc, asset) => {
        const t = asset.type === 'vehicle' ? ASSET_TYPES.OTHER : (asset.type || ASSET_TYPES.OTHER);
        if (!acc[t]) acc[t] = []
        acc[t].push(asset)
        return acc
    }, {} as Record<string, AssetRow[]>)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        תיק השקעות ונכסים
                    </CardTitle>
                    <CardDescription>
                        הערכת שווי נכסים כוללת: <span className="font-semibold text-zinc-900 dark:text-zinc-100">₪{totalValue.toLocaleString()}</span>
                    </CardDescription>
                </div>
                <AssetDialog />
            </CardHeader>
            <CardContent>
                {assets.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
                        לא הוגדרו נכסים מניבים פיננסיים.
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {Object.entries(grouped).map(([type, list]) => (
                            <div key={type} className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200 border-b pb-1">
                                    {typeIcons[type] || typeIcons[ASSET_TYPES.OTHER]}
                                    {typeLabels[type as AssetType] || typeLabels[ASSET_TYPES.OTHER]}
                                </h4>
                                <div className="space-y-3 pl-2 pr-2">
                                    {list.map(asset => (
                                        <div key={asset.id} className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{asset.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    עודכן לאחרונה: {new Date(asset.updated_at || asset.created_at || '').toLocaleDateString('he-IL')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-emerald-600">
                                                    ₪{Number(asset.estimated_value).toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <AssetDialog assetToEdit={asset} />
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
