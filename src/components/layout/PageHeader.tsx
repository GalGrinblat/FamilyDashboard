"use client"

import React from "react"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
    title: string
    icon?: LucideIcon
    description?: string
}

export function PageHeader({ title, icon: Icon, description }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-8 w-8 text-zinc-400" />}
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    )
}
