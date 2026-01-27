import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

function App() {
  const tasks = [
    { id: '1', text: 'Set up Shadcn/UI + Tailwind', done: true },
    { id: '2', text: 'Build ProgressBar widget', done: false },
    { id: '3', text: 'Add WebSocket for runtime updates', done: false },
    { id: '4', text: 'Connect to Clawdbot Gateway', done: false },
  ]
  
  const completedCount = tasks.filter(t => t.done).length

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Centered container */}
      <div className="max-w-2xl mx-auto px-6 py-4 sm:px-8 sm:py-4">
        {/* Header */}
        <header className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">Jarvis Canvas</h1>
              <p className="text-sm text-[#86868b]">AI-powered dashboard</p>
            </div>
          </div>
        </header>

        {/* Task Progress */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-4">
            In Progress
          </h2>
          <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-pulse" />
                  <span className="font-medium text-[#1d1d1f]">Canvas UI</span>
                </div>
                <span className="text-sm font-medium text-[#007AFF]">35%</span>
              </div>
              <Progress value={35} className="h-2 bg-[#e5e5ea] rounded-full" />
            </CardContent>
          </Card>
        </section>

        {/* Todo List */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
              Tasks
            </h2>
            <span className="text-xs font-medium text-[#86868b] bg-[#e5e5ea] px-2 py-1 rounded-full">
              {completedCount} of {tasks.length}
            </span>
          </div>
          <Card className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#fafafa] ${
                  i < tasks.length - 1 ? 'border-b border-[#f0f0f0]' : ''
                }`}
              >
                <Checkbox
                  id={task.id}
                  checked={task.done}
                  className="w-5 h-5 rounded-md border-2 border-[#d1d1d6] data-[state=checked]:bg-[#34c759] data-[state=checked]:border-[#34c759]"
                />
                <label
                  htmlFor={task.id}
                  className={`flex-1 cursor-pointer transition-colors ${
                    task.done ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'
                  }`}
                >
                  {task.text}
                </label>
                {task.done && (
                  <span className="text-xs text-[#34c759] font-medium">Done</span>
                )}
              </div>
            ))}
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-[#86868b]">
            Clawdbot Canvas • Real-time AI widgets
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
