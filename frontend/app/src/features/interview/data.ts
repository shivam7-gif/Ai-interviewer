import type { Problem } from "./types";

export const SESSION_PROBLEM: Problem = {
  title: "Breakfast",
  source: "Google SDE Intern 2027 OA",
  difficulty: "Medium",
  acceptance: 55,
  companyTags: ["Google", "Amazon", "Meta"],
  topicTags: ["Topological Sort", "Graph", "Greedy", "Min-Heap"],
  description:
    "There are N components from 1 to N needed to assemble a machine. Given M pairs of components (Aᵢ, Bᵢ) (1 ≤ i ≤ M), component Aᵢ must be installed before component Bᵢ during assembly. If assembling the machine is not possible, print -1. Otherwise, print the lexicographically-smallest arrangement for assembling the machine.",
  inputFormat: [
    "The first line contains an integer T denoting the number of test cases.",
    "The first line of each test case contains two integers N and M denoting the number of components and their ordering constraints respectively.",
    "Next M lines contain two space-separated integers Aᵢ and Bᵢ denoting that Aᵢ must be installed before Bᵢ.",
  ],
  outputFormat:
    "For each test case, print -1 if assembling the machine is not possible. Otherwise, print the lexicographically-smallest arrangement on a single line.",
  constraints: ["1 ≤ T ≤ 5", "2 ≤ N ≤ 10^5", "1 ≤ M ≤ min(10^5, N × (N − 1) / 2)", "1 ≤ Aᵢ, Bᵢ ≤ N"],
  samples: [
    {
      input: "3\n4 3\n1 2\n2 3\n3 4\n3 2\n1 2\n2 3\n3 1\n5 5\n1 2\n2 3\n3 4\n4 5\n5 1",
      output: "1 2 3 4\n-1\n1 2 3 4 5",
      explanation:
        "In the first case, installing in order 1, 2, 3, 4 satisfies every precedence pair and is the smallest such ordering. The second case has a cycle (1→2→3→1), so it's impossible. The third case is again a simple chain.",
    },
  ],
};

export const INITIAL_CODE: Record<string, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> solve(int N, int M, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(N + 1);
    vector<int> indegree(N + 1, 0);
    
    for (auto& [u, v] : edges) {
        adj[u].push_back(v);
        indegree[v]++;
    }
    
    // Min-heap for lexicographically smallest order
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int i = 1; i <= N; i++) {
        if (indegree[i] == 0) pq.push(i);
    }
    
    vector<int> ans;
    while (!pq.empty()) {
        int u = pq.top(); pq.pop();
        ans.push_back(u);
        for (int v : adj[u]) {
            if (--indegree[v] == 0) pq.push(v);
        }
    }
    
    return ans.size() == N ? ans : vector<int>{-1};
}

int main() {
    int T;
    scanf("%d", &T);
    while (T--) {
        int N, M;
        scanf("%d %d", &N, &M);
        vector<pair<int,int>> edges(M);
        for (auto& [a, b] : edges) scanf("%d %d", &a, &b);
        
        auto result = solve(N, M, edges);
        for (int i = 0; i < result.size(); i++) {
            if (i) printf(" ");
            printf("%d", result[i]);
        }
        printf("\\n");
    }
    return 0;
}`,
  python: `import heapq
from collections import defaultdict

def solve(N, M, edges):
    adj = defaultdict(list)
    indegree = [0] * (N + 1)
    
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
    
    heap = [i for i in range(1, N + 1) if indegree[i] == 0]
    heapq.heapify(heap)
    
    result = []
    while heap:
        u = heapq.heappop(heap)
        result.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                heapq.heappush(heap, v)
    
    return result if len(result) == N else [-1]

T = int(input())
for _ in range(T):
    N, M = map(int, input().split())
    edges = [tuple(map(int, input().split())) for _ in range(M)]
    print(*solve(N, M, edges))`,
  javascript: `function solve(N, M, edges) {
    const adj = Array.from({ length: N + 1 }, () => []);
    const indegree = new Array(N + 1).fill(0);
    
    for (const [u, v] of edges) {
        adj[u].push(v);
        indegree[v]++;
    }
    
    // Simple min-heap simulation
    const queue = [];
    for (let i = 1; i <= N; i++) {
        if (indegree[i] === 0) queue.push(i);
    }
    queue.sort((a, b) => a - b);
    
    const result = [];
    while (queue.length > 0) {
        const u = queue.shift();
        result.push(u);
        for (const v of adj[u]) {
            if (--indegree[v] === 0) {
                queue.push(v);
                queue.sort((a, b) => a - b);
            }
        }
    }
    
    return result.length === N ? result : [-1];
}`,
};

export const SOLUTION_CODE = INITIAL_CODE.cpp;
