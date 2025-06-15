
import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useFlashcards } from '../../context/FlashcardsContext';
import { FlashcardDeck, Flashcard } from '../../types/flashcard.types';
import { useTranslation } from '../../hooks/useTranslation';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDeckModal({ isOpen, onClose }: ImportDeckModalProps) {
  const { addDeck } = useFlashcards();
  const { t } = useTranslation();
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parseTextToDeck = async (text: string): Promise<string> => {
    const lines = text.split('\n').filter(line => line.trim());
    const cards: Flashcard[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Tenta diferentes formatos de separação
      let front = '';
      let back = '';
      
      if (line.includes('\t')) {
        // Separado por tab
        const parts = line.split('\t');
        front = parts[0]?.trim() || '';
        back = parts[1]?.trim() || '';
      } else if (line.includes('|')) {
        // Separado por pipe
        const parts = line.split('|');
        front = parts[0]?.trim() || '';
        back = parts[1]?.trim() || '';
      } else if (line.includes(';')) {
        // Separado por ponto e vírgula
        const parts = line.split(';');
        front = parts[0]?.trim() || '';
        back = parts[1]?.trim() || '';
      } else if (line.includes(',')) {
        // Separado por vírgula
        const parts = line.split(',');
        front = parts[0]?.trim() || '';
        back = parts[1]?.trim() || '';
      }
      
      if (front && back) {
        cards.push({
          id: `card_${Date.now()}_${i}`,
          front,
          back,
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: Date.now(),
        });
      }
    }
    
    if (cards.length === 0) {
      throw new Error(t('flashcards.import.noValidCards'));
    }
    
    const newDeck: FlashcardDeck = {
      id: `deck_${Date.now()}`,
      name: t('flashcards.import.importedDeck'),
      description: t('flashcards.import.importedDescription'),
      cards,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await addDeck(newDeck);
    return newDeck.id;
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      await parseTextToDeck(text);
      onClose();
    } catch (error) {
      console.error('Error importing file:', error);
      alert(t('flashcards.import.error'));
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleTextImport = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    
    try {
      await parseTextToDeck(textInput);
      setTextInput('');
      onClose();
    } catch (error) {
      console.error('Error importing text:', error);
      alert(t('flashcards.import.error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">
            {t('flashcards.import.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setImportMethod('file')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  importMethod === 'file'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Upload className="inline-block w-4 h-4 mr-2" />
                {t('flashcards.import.fromFile')}
              </button>
              <button
                onClick={() => setImportMethod('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  importMethod === 'text'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                {t('flashcards.import.fromText')}
              </button>
            </div>
          </div>

          {importMethod === 'file' ? (
            <div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-2">
                  {t('flashcards.import.selectFile')}
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('flashcards.import.supportedFormats')}
                </p>
                <input
                  type="file"
                  accept=".txt,.csv,.tsv"
                  onChange={handleFileImport}
                  disabled={isProcessing}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className={`inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? t('flashcards.import.processing') : t('flashcards.import.chooseFile')}
                </label>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('flashcards.import.pasteContent')}
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={10}
                  placeholder={t('flashcards.import.placeholder')}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isProcessing}
                />
              </div>
              <button
                onClick={handleTextImport}
                disabled={!textInput.trim() || isProcessing}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? t('flashcards.import.processing') : t('flashcards.import.import')}
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <h3 className="font-medium text-foreground mb-2">
              {t('flashcards.import.formatInfo')}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('flashcards.import.format1')}</li>
              <li>• {t('flashcards.import.format2')}</li>
              <li>• {t('flashcards.import.format3')}</li>
              <li>• {t('flashcards.import.format4')}</li>
            </ul>
            <div className="mt-3 p-3 bg-background rounded border-l-4 border-primary">
              <p className="text-xs text-muted-foreground font-mono">
                {t('flashcards.import.example')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
