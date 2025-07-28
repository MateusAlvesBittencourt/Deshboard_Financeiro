import { Switch } from "@/components/ui/switch.jsx"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
      <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
        Tema {theme === 'dark' ? 'escuro' : 'claro'}
      </span>
    </div>
  )
}
