import React, { useState, useCallback } from 'react';
import './App.css';
import SearchBar from './SearchBar';
import KnowledgeGraph from './KnowledgeGraph';

// APIのベースURLを設定
const API_BASE_URL = 'http://127.0.0.1:5001';

function App() {
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setError('検索語を入力してください');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/get_related_words?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Received data:', data);
      setGraphData(data);
    } catch (error) {
      console.error('Error details:', error);
      setError(`データの取得に失敗しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>知識グラフアプリケーション</h1>
        <p>クエリを入力してください:</p>
        <SearchBar onSearch={handleSearch} />
        {isLoading && <p>読み込み中...</p>}
        {error && <p className="error">{error}</p>}
      </header>
      {console.log('Rendering KnowledgeGraph:', graphData)}
      {graphData && <KnowledgeGraph data={graphData} />}
    </div>
  );
}

export default App;