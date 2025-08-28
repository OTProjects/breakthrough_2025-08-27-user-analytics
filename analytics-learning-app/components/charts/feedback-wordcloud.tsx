'use client'

interface FeedbackWordCloudProps {
  data: Array<{ text: string; sentiment: string; type: string }>
}

export function FeedbackWordCloud({ data }: FeedbackWordCloudProps) {
  // Simple word frequency analysis
  const wordFrequency: Record<string, { count: number; sentiment: 'positive' | 'negative' | 'neutral' }> = {}
  
  // Common words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were',
    'this', 'that', 'these', 'those', 'it', 'its', 'i', 'my', 'me', 'we', 'our', 'us', 'you', 'your', 'he', 'his', 'him',
    'she', 'her', 'they', 'them', 'their', 'can', 'could', 'would', 'should', 'will', 'have', 'has', 'had', 'do', 'does',
    'did', 'get', 'got', 'go', 'went', 'like', 'really', 'very', 'just', 'also', 'still', 'even', 'well', 'much', 'more'
  ])
  
  data.forEach(item => {
    const words = item.text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
    
    words.forEach(word => {
      if (!wordFrequency[word]) {
        wordFrequency[word] = { count: 0, sentiment: 'neutral' }
      }
      wordFrequency[word].count++
      
      // Determine dominant sentiment for this word
      if (item.sentiment === 'positive' || item.sentiment === 'negative') {
        wordFrequency[word].sentiment = item.sentiment as 'positive' | 'negative'
      }
    })
  })
  
  const sortedWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 20)
    
  const maxCount = Math.max(...sortedWords.map(([, { count }]) => count))
  
  function getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }
  
  function getFontSize(count: number): string {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-2xl'
    if (ratio > 0.5) return 'text-xl'
    if (ratio > 0.3) return 'text-lg'
    return 'text-base'
  }

  const sentimentCounts = data.reduce(
    (acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const typeCounts = data.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Feedback Analysis</h2>
        <p className="text-gray-600">
          Word frequency and sentiment analysis from user feedback. Larger words appear more often.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          {sortedWords.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 min-h-64">
              <div className="flex flex-wrap gap-3 justify-center items-center">
                {sortedWords.map(([word, { count, sentiment }]) => (
                  <span
                    key={word}
                    className={`font-medium transition-colors hover:opacity-80 ${getFontSize(count)} ${getSentimentColor(sentiment)}`}
                    title={`${word}: ${count} mentions (${sentiment})`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 min-h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No feedback data yet</p>
                <p className="text-sm">
                  User feedback will appear here as a word cloud once collected.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Sentiment Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Positive</span>
                </div>
                <span className="font-medium">{sentimentCounts.positive || 0}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-sm">Neutral</span>
                </div>
                <span className="font-medium">{sentimentCounts.neutral || 0}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Negative</span>
                </div>
                <span className="font-medium">{sentimentCounts.negative || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Feedback Types</h3>
            <div className="space-y-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm capitalize">
                    {type.replace('_', ' ').toLowerCase()}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📝 Analyzing user feedback</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Word size = frequency:</strong> Larger words appear more often in feedback.</li>
          <li>• <strong>Colors show sentiment:</strong> Green = positive mentions, Red = negative, Gray = neutral.</li>
          <li>• <strong>Look for patterns:</strong> Are users consistently mentioning the same issues or praise?</li>
          <li>• <strong>Actionable insights:</strong> Negative frequent words = areas to improve. Positive = strengths to double down on.</li>
          <li>• <strong>Context matters:</strong> Always read the actual feedback, not just word frequencies.</li>
        </ul>
      </div>
    </div>
  )
}