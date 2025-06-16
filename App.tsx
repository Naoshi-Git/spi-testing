
import React, { useState, useEffect, useCallback } from 'react';
import { parseVocabularyData, vocabularyDataString } from './utils/quizData';
import type { WordEntry, QuizSetResult } from './types';
import { QuizState } from './types';
import { QUESTIONS_PER_SET } from './constants';
import QuizView from './components/QuizView';
import FeedbackModal from './components/FeedbackModal';
import SetResultsView from './components/SetResultsView';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [currentQuestionSet, setCurrentQuestionSet] = useState<WordEntry[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizState, setQuizState] = useState<QuizState>(QuizState.LOADING);
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  const [incorrectlyAnsweredIds, setIncorrectlyAnsweredIds] = useState<Set<string>>(new Set());
  const [currentSetIncorrectIds, setCurrentSetIncorrectIds] = useState<Set<string>>(new Set());
  const [currentSetIncorrectWordDetails, setCurrentSetIncorrectWordDetails] = useState<WordEntry[]>([]);
  const [allTimeIncorrectWordDetails, setAllTimeIncorrectWordDetails] = useState<WordEntry[]>([]);
  
  const [quizHistory, setQuizHistory] = useState<QuizSetResult[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadedWords = parseVocabularyData(vocabularyDataString);
    setAllWords(loadedWords);

    const storedHistory = localStorage.getItem('quizHistory');
    if (storedHistory) {
      setQuizHistory(JSON.parse(storedHistory));
    }

    const storedIncorrectIdsString = localStorage.getItem('incorrectlyAnsweredIds');
    let initialIncorrectIds = new Set<string>();
    if (storedIncorrectIdsString) {
      initialIncorrectIds = new Set(JSON.parse(storedIncorrectIdsString));
      setIncorrectlyAnsweredIds(initialIncorrectIds);
    }
    
    // Initialize allTimeIncorrectWordDetails based on loaded words and incorrect IDs
    if (loadedWords.length > 0 && initialIncorrectIds.size > 0) {
      const incorrectDetails = loadedWords.filter(word => initialIncorrectIds.has(word.id));
      setAllTimeIncorrectWordDetails(incorrectDetails);
    }

    setQuizState(QuizState.NOT_STARTED);
  }, []);

  // Update allTimeIncorrectWordDetails whenever allWords or incorrectlyAnsweredIds changes
  useEffect(() => {
    if (allWords.length > 0) {
      const incorrectDetails = allWords.filter(word => incorrectlyAnsweredIds.has(word.id));
      setAllTimeIncorrectWordDetails(incorrectDetails);
    } else {
      setAllTimeIncorrectWordDetails([]);
    }
  }, [allWords, incorrectlyAnsweredIds]);

  const generateOptions = useCallback((correctWord: WordEntry, wordPool: WordEntry[]): string[] => {
    const distractors = wordPool
      .filter(w => w.id !== correctWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);
    
    const newOptions = [correctWord.meaning, ...distractors];
    if (newOptions.length < 2 && wordPool.length > 1) { 
        const otherOption = wordPool.find(w => w.id !== correctWord.id);
        if(otherOption) newOptions.push(otherOption.meaning);
    }
     while (newOptions.length < 4 && newOptions.length < wordPool.length) { 
        const uniqueDistractor = wordPool.find(w => w.id !== correctWord.id && !newOptions.includes(w.meaning));
        if (uniqueDistractor) {
            newOptions.push(uniqueDistractor.meaning);
        } else {
            break; 
        }
    }
    return newOptions.sort(() => 0.5 - Math.random());
  }, []);

  const generateNewSet = useCallback(() => {
    setCurrentSetIncorrectIds(new Set());
    setCurrentSetIncorrectWordDetails([]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentScore(0);
    setCurrentQuestionIndex(0);

    let questionsForSet: WordEntry[] = [];
    const incorrectWordsFromStorage = allWords.filter(w => incorrectlyAnsweredIds.has(w.id));
    
    questionsForSet.push(...incorrectWordsFromStorage.sort(() => 0.5 - Math.random()));

    const remainingNeeded = QUESTIONS_PER_SET - questionsForSet.length;
    if (remainingNeeded > 0) {
      const newWords = allWords
        .filter(w => !incorrectlyAnsweredIds.has(w.id) && !questionsForSet.some(qw => qw.id === w.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, remainingNeeded);
      questionsForSet.push(...newWords);
    }

    if (questionsForSet.length > QUESTIONS_PER_SET) {
        questionsForSet = questionsForSet.slice(0, QUESTIONS_PER_SET);
    }
    
    if (questionsForSet.length === 0 && allWords.length > 0) { 
        questionsForSet = allWords.sort(() => 0.5 - Math.random()).slice(0, Math.min(QUESTIONS_PER_SET, allWords.length));
    }

    if (questionsForSet.length > 0) {
      setCurrentQuestionSet(questionsForSet);
      setOptions(generateOptions(questionsForSet[0], allWords));
      setQuizState(QuizState.ONGOING);
    } else {
      setCurrentQuestionSet([]); 
      setQuizState(QuizState.ALL_COMPLETED);
    }
  }, [allWords, incorrectlyAnsweredIds, generateOptions]);

  useEffect(() => {
    if (quizState === QuizState.NOT_STARTED && allWords.length > 0) {
      generateNewSet();
    }
  }, [quizState, allWords, generateNewSet]);

  useEffect(() => {
    if (currentQuestionSet.length > 0 && currentQuestionIndex < currentQuestionSet.length) {
      setOptions(generateOptions(currentQuestionSet[currentQuestionIndex], allWords));
    }
  }, [currentQuestionIndex, currentQuestionSet, allWords, generateOptions]);

  const recordIncorrectAnswer = (wordId: string) => {
    const newIncorrectlyAnsweredIds = new Set(incorrectlyAnsweredIds);
    newIncorrectlyAnsweredIds.add(wordId);
    setIncorrectlyAnsweredIds(newIncorrectlyAnsweredIds); // This will trigger the useEffect to update allTimeIncorrectWordDetails

    const newCurrentSetIncorrectIds = new Set(currentSetIncorrectIds);
    newCurrentSetIncorrectIds.add(wordId);
    setCurrentSetIncorrectIds(newCurrentSetIncorrectIds);
  };

  const handleAnswerSubmit = (answer: string) => {
    setSelectedAnswer(answer);
    const currentWord = currentQuestionSet[currentQuestionIndex];
    const correct = answer === currentWord.meaning;
    setIsCorrect(correct);

    if (correct) {
      setCurrentScore(prev => prev + 1);
      const newIncorrectlyAnsweredIds = new Set(incorrectlyAnsweredIds);
      newIncorrectlyAnsweredIds.delete(currentWord.id); 
      setIncorrectlyAnsweredIds(newIncorrectlyAnsweredIds); // This will trigger the useEffect
    } else {
      recordIncorrectAnswer(currentWord.id);
    }
    setQuizState(QuizState.SHOWING_FEEDBACK);
  };

  const handleIDontKnow = () => {
    const currentWord = currentQuestionSet[currentQuestionIndex];
    setSelectedAnswer("わかりません"); 
    setIsCorrect(false);
    recordIncorrectAnswer(currentWord.id);
    setQuizState(QuizState.SHOWING_FEEDBACK);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestionIndex < currentQuestionSet.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuizState(QuizState.ONGOING);
    } else {
      // End of set
      const incorrectDetailsThisSet = Array.from(currentSetIncorrectIds)
        .map(id => allWords.find(w => w.id === id))
        .filter(Boolean) as WordEntry[];
      setCurrentSetIncorrectWordDetails(incorrectDetailsThisSet);

      const newHistoryEntry: QuizSetResult = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        score: currentScore,
        totalQuestions: currentQuestionSet.length,
        incorrectWordsInSet: incorrectDetailsThisSet.map(w => w.word).join(', ') || 'None',
      };
      const updatedHistory = [newHistoryEntry, ...quizHistory];
      setQuizHistory(updatedHistory);
      
      localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
      localStorage.setItem('incorrectlyAnsweredIds', JSON.stringify(Array.from(incorrectlyAnsweredIds)));
      
      setQuizState(QuizState.SET_COMPLETED);
    }
  };

  if (quizState === QuizState.LOADING) {
    return <div className="flex justify-center items-center min-h-screen text-2xl text-slate-700">読み込み中...</div>;
  }
  
  if (quizState === QuizState.ALL_COMPLETED || (quizState === QuizState.NOT_STARTED && allWords.length === 0)) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <h2 className="text-3xl font-bold text-green-600 mb-6">全ての単語の学習が完了しました！</h2>
        <p className="text-xl text-slate-700 mb-8">素晴らしいです！全ての単語をマスターしたか、利用可能な単語がなくなりました。</p>
        {allTimeIncorrectWordDetails.length > 0 && quizState === QuizState.ALL_COMPLETED && (
             <div className="my-8 w-full max-w-2xl">
                <h3 className="text-2xl font-semibold text-slate-700 mb-4">最終復習リスト (間違えた単語)</h3>
                <div className="max-h-96 overflow-y-auto bg-white p-4 rounded-lg shadow-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-3 border-b-2 border-slate-200 text-slate-600 font-semibold">単語</th>
                                <th className="p-3 border-b-2 border-slate-200 text-slate-600 font-semibold">よみ</th>
                                <th className="p-3 border-b-2 border-slate-200 text-slate-600 font-semibold">意味</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTimeIncorrectWordDetails.map(word => (
                                <tr key={word.id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b border-slate-200 text-slate-700 font-medium">{word.word}</td>
                                    <td className="p-3 border-b border-slate-200 text-slate-600">{word.reading || 'N/A'}</td>
                                    <td className="p-3 border-b border-slate-200 text-sm text-slate-600">{word.meaning}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
        <button
          onClick={() => {
            setIncorrectlyAnsweredIds(new Set()); 
            localStorage.removeItem('incorrectlyAnsweredIds');
            // quizHistory is intentionally not cleared here, only progress
            setCurrentSetIncorrectWordDetails([]);
            setAllTimeIncorrectWordDetails([]); // Clear this as well
            setQuizState(QuizState.NOT_STARTED); 
            if (allWords.length > 0) {
                generateNewSet();
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-150 ease-in-out mt-8"
        >
          もう一度最初から挑戦する
        </button>
        <div className="mt-10 w-full max-w-2xl">
          <HistoryPanel history={quizHistory} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-sky-100 flex flex-col items-center p-4 pt-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-sky-700">SPI頻出語彙クイズ</h1>
        <p className="text-slate-600">語彙力を高めて、SPI試験を攻略しよう！</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        <div className="md:flex-1 bg-white p-6 rounded-xl shadow-2xl">
          {quizState === QuizState.ONGOING && currentQuestionSet.length > 0 && (
            <QuizView
              wordEntry={currentQuestionSet[currentQuestionIndex]}
              options={options}
              onAnswerSubmit={handleAnswerSubmit}
              onIDontKnow={handleIDontKnow}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={currentQuestionSet.length}
            />
          )}
          {quizState === QuizState.SHOWING_FEEDBACK && currentQuestionSet.length > 0 && (
            <FeedbackModal
              isOpen={true}
              isCorrect={isCorrect!}
              wordEntry={currentQuestionSet[currentQuestionIndex]}
              selectedAnswer={selectedAnswer!}
              onClose={handleNextQuestion}
            />
          )}
          {quizState === QuizState.SET_COMPLETED && (
            <SetResultsView
              score={currentScore}
              totalQuestions={currentQuestionSet.length}
              incorrectWordsThisSet={currentSetIncorrectWordDetails}
              allTimeIncorrectWords={allTimeIncorrectWordDetails}
              onNextSet={generateNewSet}
            />
          )}
        </div>
        <aside className="md:w-1/3">
          <HistoryPanel history={quizHistory} />
        </aside>
      </main>
       <footer className="text-center py-8 text-slate-500 text-sm">
        © {new Date().getFullYear()} SPI Vocabulary Quizzer. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
