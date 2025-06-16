
import React from 'react';
import type { QuizSetResult } from '../types';
// Import for ResponsiveContainer, BarChart, etc. are removed as they are no longer used.

interface HistoryPanelProps {
  history: QuizSetResult[];
}

const BookOpenIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);


const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  // Chart data and related logic removed.

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl space-y-6">
      <div className="flex items-center space-x-3 mb-4"> {/* Added mb-4 for spacing */}
        <BookOpenIcon className="w-8 h-8 text-sky-600" />
        <h3 className="text-2xl font-semibold text-slate-700">学習履歴</h3>
      </div>

      {/* Removed chart rendering section */}

      <div className="max-h-96 overflow-y-auto space-y-3 pr-2"> {/* Increased max-h for more history items visible */}
        {history.length === 0 ? (
          <p className="text-slate-500">まだ履歴がありません。最初のセットを完了するとここに表示されます。</p>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-slate-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-slate-500">
                  {new Date(item.date).toLocaleDateString('ja-JP')} {new Date(item.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="font-semibold text-sky-600">
                  {item.score} / {item.totalQuestions} 点
                </p>
              </div>
              {item.incorrectWordsInSet && item.incorrectWordsInSet !== "None" && (
                 <p className="text-xs text-red-500 truncate" title={`間違えた単語: ${item.incorrectWordsInSet}`}> {/* Added title for full text on hover */}
                    間違えた単語: {item.incorrectWordsInSet}
                 </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
