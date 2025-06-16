
import React from 'react';
import type { WordEntry } from '../types';

interface SetResultsViewProps {
  score: number;
  totalQuestions: number;
  incorrectWordsThisSet: WordEntry[];
  allTimeIncorrectWords: WordEntry[];
  onNextSet: () => void;
}

const StarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
);

const WordTable: React.FC<{words: WordEntry[], title: string}> = ({ words, title }) => {
  if (words.length === 0) return null;

  return (
    <div className="my-8 pt-6 border-t border-slate-200">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="max-h-72 overflow-y-auto text-left_ rounded-md_ shadow-sm_ border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-100 z-10">
            <tr>
              <th className="p-3 border-b-2 border-slate-300 text-slate-600 font-semibold text-sm">単語</th>
              <th className="p-3 border-b-2 border-slate-300 text-slate-600 font-semibold text-sm">よみ</th>
              <th className="p-3 border-b-2 border-slate-300 text-slate-600 font-semibold text-sm">意味</th>
            </tr>
          </thead>
          <tbody>
            {words.map(word => (
              <tr key={word.id} className="hover:bg-slate-50 even:bg-white odd:bg-slate-50/50">
                <td className="p-3 border-b border-slate-200 text-slate-700 font-medium text-sm">{word.word}</td>
                <td className="p-3 border-b border-slate-200 text-slate-600 text-sm">{word.reading || 'N/A'}</td>
                <td className="p-3 border-b border-slate-200 text-xs text-slate-600">{word.meaning}
                 {word.remarks && (
                    <p className="text-xs text-slate-400 mt-1">備考: {word.remarks}</p>
                )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const SetResultsView: React.FC<SetResultsViewProps> = ({ score, totalQuestions, incorrectWordsThisSet, allTimeIncorrectWords, onNextSet }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  let message = "";
  if (percentage === 100) message = "素晴らしい！全問正解です！";
  else if (percentage >= 80) message = "優秀です！あと少し！";
  else if (percentage >= 60) message = "良い調子です！このまま続けましょう！";
  else message = "頑張りましょう！次はもっとできる！";

  return (
    <div className="text-center p-6 md:p-10 bg-white rounded-xl shadow-xl">
      <StarIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-slate-800 mb-3">セット完了！</h2>
      <p className="text-xl text-slate-700 mb-2">
        スコア: <span className="font-bold text-sky-600">{score}</span> / {totalQuestions} ({percentage}%)
      </p>
      <p className="text-lg text-slate-600 mb-6">{message}</p>

      <WordTable words={incorrectWordsThisSet} title="このセットで間違えた単語" />
      
      {allTimeIncorrectWords.filter(word => !incorrectWordsThisSet.some(w => w.id === word.id)).length > 0 && (
         <WordTable 
            words={allTimeIncorrectWords.filter(word => !incorrectWordsThisSet.some(w => w.id === word.id))} 
            title="以前に間違えた単語 (要復習)" 
        />
      )}


      <button
        onClick={onNextSet}
        className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 mt-8"
      >
        次のセットへ進む
      </button>
    </div>
  );
};

export default SetResultsView;
