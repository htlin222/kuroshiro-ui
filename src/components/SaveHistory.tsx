import React, { useState } from 'react';

interface SavedItem {
  id: string;
  content: string;
  timestamp: string;
}

interface SaveHistoryProps {
  savedItems: SavedItem[];
  onDelete: (id: string) => void;
}

export const SaveHistory: React.FC<SaveHistoryProps> = ({
  savedItems,
  onDelete,
}) => {
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {savedItems.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-grow">
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
                <div className="text-gray-700 whitespace-pre-wrap break-words">
                  {item.content}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopy(item.content, item.id)}
                  className={`px-2 py-1 text-sm text-white rounded transition-colors ${
                    copyStates[item.id] ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {copyStates[item.id] ? (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </span>
                  ) : (
                    'Copy'
                  )}
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
