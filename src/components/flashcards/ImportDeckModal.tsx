
import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useFlashcards } from '../../context/FlashcardsContext';
import { toast } from '../ui/sonner';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportDeckModal({ isOpen, onClose }: ImportDeckModalProps) {
  const { createDeck, addCard } = useFlashcards();
  const [deckName, setDeckName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const parseCSVContent = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const cards = [];

    for (const line of lines) {
      // Parse CSV line considering quoted fields
      const matches = line.match(/("(?:[^"\\]|\\.)*"|[^,]*),("(?:[^"\\]|\\.)*"|[^,]*)/);
      
      if (matches && matches.length >= 3) {
        const front = matches[1].replace(/^"|"$/g, '').replace(/""/g, '"');
        const back = matches[2].replace(/^"|"$/g, '').replace(/""/g, '"');
        
        if (front.trim() && back.trim()) {
          cards.push({ front: front.trim(), back: back.trim() });
        }
      } else {
        // Fallback for simple CSV without quotes
        const parts = line.split(',');
        if (parts.length >= 2) {
          const front = parts[0].trim();
          const back = parts[1].trim();
          if (front && back) {
            cards.push({ front, back });
          }
        }
      }
    }

    return cards;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        // Usar o nome do arquivo como nome padrão do deck
        const fileName = selectedFile.name.replace('.csv', '');
        setDeckName(fileName);
      } else {
        toast('Erro', {
          description: 'Por favor, selecione um arquivo CSV válido.',
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file || !deckName.trim()) {
      toast('Erro', {
        description: 'Por favor, selecione um arquivo e digite um nome para o deck.',
      });
      return;
    }

    setIsImporting(true);

    try {
      const csvContent = await file.text();
      const cards = parseCSVContent(csvContent);

      if (cards.length === 0) {
        toast('Erro', {
          description: 'Nenhum card válido foi encontrado no arquivo CSV.',
        });
        setIsImporting(false);
        return;
      }

      // Criar o deck
      const deckId = createDeck({
        name: deckName,
        description: `Importado de ${file.name} - ${cards.length} cards`
      });

      // Adicionar todos os cards ao deck
      for (const card of cards) {
        addCard(deckId, card);
      }

      toast('Sucesso!', {
        description: `Deck "${deckName}" importado com ${cards.length} cards.`,
      });

      // Reset form
      setDeckName('');
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Erro ao importar deck:', error);
      toast('Erro', {
        description: 'Erro ao processar o arquivo CSV. Verifique o formato.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setDeckName('');
    setFile(null);
    setIsImporting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Importar Deck (CSV)</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Informações sobre o formato */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Formato CSV compatível com Anki:</p>
                <p>• Primeira coluna: Frente do card</p>
                <p>• Segunda coluna: Verso do card</p>
                <p>• Exemplo: "Pergunta","Resposta"</p>
              </div>
            </div>
          </div>

          {/* Upload de arquivo */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Arquivo CSV
            </label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {/* Nome do deck */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome do Deck
            </label>
            <Input
              placeholder="Digite o nome do deck..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || !deckName.trim() || isImporting}
              className="flex-1 flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
