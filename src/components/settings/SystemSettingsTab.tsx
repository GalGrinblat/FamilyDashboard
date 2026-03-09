"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Settings, Save } from "lucide-react"

export function SystemSettingsTab() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [familyName, setFamilyName] = useState("")
    const [currency, setCurrency] = useState("ILS")
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.user_metadata) {
                const meta = user.user_metadata
                if (meta.family_name) setFamilyName(meta.family_name)
                if (meta.default_currency) setCurrency(meta.default_currency)
                if (meta.email_notifications !== undefined) setEmailNotifs(meta.email_notifications)
                if (meta.push_notifications !== undefined) setPushNotifs(meta.push_notifications)
            }
            setLoading(false)
        }
        fetchSettings()
    }, [supabase])

    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase.auth.updateUser({
            data: {
                family_name: familyName,
                default_currency: currency,
                email_notifications: emailNotifs,
                push_notifications: pushNotifs
            }
        })

        setSaving(false)
        if (error) {
            console.error(error)
            alert("שגיאה בשמירת הגדרות")
        } else {
            alert("הגדרות נשמרו בהצלחה")
            router.refresh()
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">טוען הגדרות...</div>

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-zinc-500" />
                        הגדרות מערכת למשפחה
                    </CardTitle>
                    <CardDescription>
                        הגדרות כלליות, מטבע ברירת מחדל, והעדפות התראות.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="familyName">שם המשפחה (לתצוגה)</Label>
                            <Input
                                id="familyName"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder="למשל: משפחת ישראלי"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">מטבע ברירת מחדל</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger dir="rtl">
                                    <SelectValue placeholder="בחר מטבע" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="ILS">שקל (₪)</SelectItem>
                                    <SelectItem value="USD">דולר ($)</SelectItem>
                                    <SelectItem value="EUR">אירו (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 md:pt-0 md:border-r md:pr-6 border-zinc-100 dark:border-zinc-800">
                        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">התראות ותזכורות</h4>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">התראות במייל</Label>
                                <p className="text-xs text-muted-foreground">קבלת תזכורות תקופתיות לביטוחים וטסטים.</p>
                            </div>
                            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">התראות דפדפן (Push)</Label>
                                <p className="text-xs text-muted-foreground">התראות קופצות במכשיר הנייד או בדפדפן.</p>
                            </div>
                            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 justify-end border-t border-zinc-100 dark:border-zinc-800 p-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "שומר..." : "שמור הגדרות"}
                    {!saving && <Save className="mr-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    )
}
