
import React from 'react';
import type { WordEntry } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  wordEntry: WordEntry;
  selectedAnswer: string;
  onClose: () => void;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-12 h-12 text-green-500"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const XCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-12 h-12 text-red-500"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, isCorrect, wordEntry, selectedAnswer, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex flex-col items-center text-center">
          {isCorrect ? (
            <CheckIcon className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
          )}
          <h2 className={`text-3xl font-bold mb-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '正解！' : '不正解'}
          </h2>
          {!isCorrect && (
            <p className="text-slate-600 mb-2 text-lg">
              {selectedAnswer === "わかりません" ? "「わかりません」を選択しました。" : `あなたの回答: 「${selectedAnswer}」`}
            </p>
          )}
          <div className="bg-slate-50 p-4 rounded-lg w-full mb-6 text-left">
            <p className="text-slate-800 text-lg">
              「<span className="font-bold text-sky-700">{wordEntry.word}</span>」
              (読み: {wordEntry.reading || 'N/A'})
            </p>
            <p className="text-slate-800 font-semibold text-xl mt-1">
              意味: {wordEntry.meaning}
            </p>
            {wordEntry.remarks && (
                <p className="text-sm text-slate-500 mt-2">備考: {wordEntry.remarks}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
