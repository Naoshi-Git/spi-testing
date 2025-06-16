
import React from 'react';
import type { WordEntry } from '../types';

interface QuizViewProps {
  wordEntry: WordEntry;
  options: string[];
  onAnswerSubmit: (answer: string) => void;
  onIDontKnow: () => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuizView: React.FC<QuizViewProps> = ({ wordEntry, options, onAnswerSubmit, onIDontKnow, questionNumber, totalQuestions }) => {
  if (!wordEntry) {
    return <div className="text-center p-8 text-slate-600">問題の読み込みに失敗しました。</div>;
  }
  
  return (
    <div className="p-6 rounded-lg_ bg-white_">
      <div className="mb-6 text-sm text-slate-500 text-right">
        問題 {questionNumber} / {totalQuestions}
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-2">
        「<span className="font-bold text-sky-600">{wordEntry.word}</span>」の意味は？
      </h2>
      <p className="text-slate-600 mb-8">
        (読み: {wordEntry.reading || 'N/A'})
      </p>
      <div className="space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSubmit(option)}
            className="w-full text-left bg-sky-50 hover:bg-sky-100 text-slate-700 font-medium py-4 px-5 rounded-lg border-2 border-sky-200 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm hover:shadow-md"
            aria-label={`選択肢: ${option}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={onIDontKnow}
          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-800 font-semibold py-3 px-5 rounded-lg border-2 border-amber-500 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm hover:shadow-md"
          aria-label="分かりません。正解と解説を表示します。"
        >
          わかりません
        </button>
      </div>
    </div>
  );
};

export default QuizView;
