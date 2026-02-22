export default function FinancePage() {
    return (
        <div className="flex flex-col p-8">
            <h1 className="text-3xl font-bold mb-6">פיננסים</h1>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
                <p className="text-zinc-600 dark:text-zinc-400">כאן יופיעו הנתונים הפיננסיים של המשפחה: הוצאות, הכנסות, ותקציב.</p>
            </div>
        </div>
    );
}
