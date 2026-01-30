import dotenv from 'dotenv';

dotenv.config();

// Mock in-memory database for development without PostgreSQL
const mockDb = new Map();

// Mock query function that simulates PostgreSQL queries
export const query = async (text: string, params?: any[]) => {
  console.log(`Mock DB Query: ${text}`, params ? { params } : {});
  
  // Handle different query types
  if (text.includes('CREATE TABLE') || text.includes('ALTER TABLE')) {
    // Schema operations - just return success
    return { rows: [], rowCount: 0 };
  } 
  else if (text.includes('INSERT INTO')) {
    // Insert operation
    const tableName = text.match(/INSERT INTO (\w+)/i)?.[1];
    if (tableName) {
      const recordId = Date.now() + Math.random();
      const colNames = text.match(/INSERT INTO \w+ \((.+?)\)/i)?.[1]?.split(',').map((c: string) => c.trim()) || [];
      const mockRecord: Record<string, unknown> = { id: recordId, created_at: new Date().toISOString() };
      if (params && colNames.length) {
        colNames.forEach((col, idx) => { mockRecord[col] = params[idx]; });
      } else if (params) {
        params.forEach((val, idx) => { mockRecord[`col${idx}`] = val; });
      }
      mockDb.set(`${tableName}_${recordId}`, mockRecord);
      return { rows: [mockRecord], rowCount: 1 };
    }
  } 
  else if (text.includes('SELECT')) {
    // Select operation - AI usage (expense) aggregation
    if (text.includes('FROM ai_usage_logs') || text.includes('ai_usage_logs')) {
      const entries = Array.from(mockDb.entries()).filter(([k]) => k.startsWith('ai_usage_logs_'));
      const rows = entries.map(([, v]) => v as { operation_type: string; cost_usd?: number; created_at?: string });
      if (text.includes('COUNT(*)') && text.includes('SUM')) {
        const totalCalls = rows.length;
        const totalCost = rows.reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
        const today = new Date().toISOString().slice(0, 10);
        const todayRows = rows.filter(r => (r.created_at || '').slice(0, 10) === today);
        return {
          rows: [{
            total_calls: totalCalls,
            total_cost: totalCost,
            today_calls: todayRows.length,
            today_cost: todayRows.reduce((s, r) => s + (Number(r.cost_usd) || 0), 0),
            categorizations: rows.filter(r => r.operation_type === 'categorization').length,
            rewrites: rows.filter(r => r.operation_type === 'rewrite_bullet' || r.operation_type === 'rewrite_summary').length,
            optimizations: rows.filter(r => r.operation_type === 'optimization').length
          }],
          rowCount: 1
        };
      }
      return { rows: [], rowCount: 0 };
    }
    if (text.includes('FROM feedback')) {
      // Mock feedback records
      if (text.includes('COUNT')) {
        return { rows: [{ count: mockDb.size }], rowCount: 1 };
      } else {
        // Return mock feedback data
        const feedbackRecords = [];
        for (const [key, value] of mockDb) {
          if (key.startsWith('feedback_')) {
            feedbackRecords.push(value);
          }
        }
        return { rows: feedbackRecords, rowCount: feedbackRecords.length };
      }
    }
    // Default: return empty result
    return { rows: [], rowCount: 0 };
  } 
  else if (text.includes('UPDATE')) {
    // Update operation
    return { rows: [], rowCount: 1 }; // Simulate success
  } 
  else if (text.includes('DELETE FROM')) {
    // Delete operation
    const tableName = text.match(/DELETE FROM (\w+)/i)?.[1];
    if (tableName && params && params[0]) {
      // Delete specific record
      mockDb.delete(`${tableName}_${params[0]}`);
    }
    return { rows: [], rowCount: 1 };
  }
  
  // Default response for unknown queries
  return { rows: [], rowCount: 0 };
};

// Export mock pool for migrate/seed scripts
export const pool = {
  query,
  connect: async () => ({ query, release: () => {} }),
  end: async () => {}
};

console.log('⚠️ Using mock database for development. PostgreSQL not required.');