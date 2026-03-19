import { useNavigate } from 'react-router-dom'

export const STEPS = [
  { number: 1, label: 'Income',   path: '/income-expenses' },
  { number: 2, label: 'Balance',  path: '/assets'          },
  { number: 3, label: 'Goals',    path: '/goals'           },
  { number: 4, label: 'Analysis', path: '/fire'            },
]

export default function StepProgress({ currentStep }: { currentStep: number }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const isDone    = step.number < currentStep
        const isCurrent = step.number === currentStep

        return (
          <div key={step.number} className="flex items-center">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={`w-20 h-0.5 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            )}

            {/* Step */}
            <button
              onClick={() => navigate(step.path)}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center
                  text-sm font-bold transition-colors
                  ${isDone    ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-600 text-white'  :
                    'bg-gray-100 text-gray-400 border-2 border-gray-300'}
                `}
              >
                {isDone
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  : step.number
                }
              </div>
              <span
                className={`text-xs font-medium ${
                  isDone    ? 'text-green-600'  :
                  isCurrent ? 'text-gray-900'   :
                  'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
