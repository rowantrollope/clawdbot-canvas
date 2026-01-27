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
    <div className="min-h-screen bg-[#f5f5f7] font-[-apple-system,BlinkMacSystemFont,sans-serif] p-5">
      {/* Header */}
      <Card className="mb-5 border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <span className="font-semibold text-[#1d1d1f]">Jarvis Canvas</span>
          </div>
        </CardContent>
      </Card>

      {/* Task Progress */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide mb-3">
          In Progress
        </h2>
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
                <span className="font-medium text-[#1d1d1f]">Canvas UI</span>
              </div>
              <span className="text-sm text-[#86868b]">35%</span>
            </div>
            <Progress value={35} className="h-2 bg-[#f5f5f7]" />
          </CardContent>
        </Card>
      </section>

      {/* Todo List */}
      <section>
        <div className="flex justify-between mb-3">
          <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wide">
            Tasks
          </h2>
          <span className="text-xs text-[#86868b]">{completedCount} of {tasks.length}</span>
        </div>
        <Card className="border-0 shadow-md overflow-hidden">
          {tasks.map((task, i) => (
            <div 
              key={task.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                i < tasks.length - 1 ? 'border-b border-[#f5f5f7]' : ''
              }`}
            >
              <Checkbox 
                id={task.id} 
                checked={task.done}
                className="data-[state=checked]:bg-[#34c759] data-[state=checked]:border-[#34c759]"
              />
              <label 
                htmlFor={task.id}
                className={`cursor-pointer ${
                  task.done ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'
                }`}
              >
                {task.text}
              </label>
            </div>
          ))}
        </Card>
      </section>
    </div>
  )
}

export default App
