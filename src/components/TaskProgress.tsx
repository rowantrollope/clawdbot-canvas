interface Task {
  id: string
  label: string
  status: 'active' | 'complete' | 'error'
  progress: number
  subtitle?: string
}

interface TaskProgressProps {
  tasks: Task[]
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) return null

  return (
    <section>
      <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3 px-1">
        In Progress
      </h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}

function TaskCard({ task }: { task: Task }) {
  const statusColors = {
    active: 'bg-blue-500',
    complete: 'bg-green-500',
    error: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {task.status === 'active' && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          <span className="font-medium text-[#1d1d1f]">{task.label}</span>
        </div>
        <span className="text-sm font-medium text-[#86868b]">
          {task.progress}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${statusColors[task.status]}`}
          style={{ width: `${task.progress}%` }}
        />
      </div>
      
      {task.subtitle && (
        <p className="text-sm text-[#86868b] mt-2">{task.subtitle}</p>
      )}
    </div>
  )
}
