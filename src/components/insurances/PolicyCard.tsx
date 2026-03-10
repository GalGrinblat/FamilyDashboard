import { PolicyWithAsset } from "@/types/insurance"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileText, Calendar, Edit2, Link } from "lucide-react"
import { AddEditPolicyDialog } from "./AddEditPolicyDialog"



export function PolicyCard({ policy }: { policy: PolicyWithAsset }) {
    return (
        <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${policy.type === 'health' || policy.type === 'life' ? 'bg-rose-500' :
                policy.type === 'property' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />

            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{policy.name}</h3>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{policy.provider}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-lg">
                            ₪{policy.premium_amount.toLocaleString()}
                            <span className="text-xs text-zinc-500 font-normal mr-1">{policy.premium_frequency === 'yearly' ? '/ שנה' : '/ חד׳'}</span>
                        </span>

                        <AddEditPolicyDialog
                            policyToEdit={policy}
                            triggerButton={
                                <button className="text-zinc-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {policy.policy_number && (
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-zinc-400" />
                            <span>פוליסה: <span className="font-medium font-mono text-zinc-700 dark:text-zinc-300 ml-1">{policy.policy_number}</span></span>
                        </div>
                    )}

                    {policy.renewal_date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <span>חידוש: <span className="font-medium text-zinc-700 dark:text-zinc-300 ml-1">{new Date(policy.renewal_date).toLocaleDateString("he-IL")}</span></span>
                        </div>
                    )}

                    {policy.assets && (
                        <div className="flex items-center gap-1.5 col-span-2">
                            <Link className="w-4 h-4 text-zinc-400" />
                            <span>משויך ל: <span className="font-medium text-zinc-700 dark:text-zinc-300 ml-1">
                                {policy.assets.name} {policy.assets.type === 'vehicle' && (policy.assets.metadata as Record<string, unknown>)?.license_plate ? `(${(policy.assets.metadata as Record<string, unknown>).license_plate})` : ''}
                            </span></span>
                        </div>
                    )}

                    {policy.document_url && (
                        <div className="flex items-center gap-1.5 col-span-2 mt-2">
                            <a
                                href={policy.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 hover:underline bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded"
                            >
                                <FileText className="w-4 h-4" />
                                <span className="font-medium text-xs">צפה במסמך הפוליסה</span>
                            </a>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
