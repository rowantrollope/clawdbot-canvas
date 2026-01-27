interface TodoItem {
  id: string
  text: string
  done: boolean
}

interface TodoListProps {
  items: TodoItem[]
}

export function TodoList({ items }: TodoListProps) {
  const completed = items.filter(i => i.done).length
  const total = items.length

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
          Tasks
        </h2>
        <span className="text-xs text-[#86868b]">
          {completed} of {total}
        </span>
      </div>
      
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`flex items-center gap-4 px-5 py-4 transition-colors ${
              index !== items.length - 1 ? 'border-b border-[#f5f5f7]' : ''
            }`}
          >
            {/* Checkbox */}
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${item.done 
                ? 'bg-[#34c759] border-[#34c759]' 
                : 'border-[#d2d2d7]'
              }
            `}>
              {item.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {/* Text */}
            <span className={`flex-1 transition-all duration-200 ${
              item.done 
                ? 'text-[#86868b] line-through' 
                : 'text-[#1d1d1f]'
            }`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
