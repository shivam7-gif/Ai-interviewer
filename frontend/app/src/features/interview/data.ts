import type { Problem } from "./types";

export const SESSION_PROBLEM: Problem = {
  title: "",
  source: "",
  difficulty: "Medium",
  acceptance: 0,
  companyTags: [],
  topicTags: [],
  description: "",
  inputFormat: [],
  outputFormat: "",
  constraints: [],
  samples: [],
};

export const INITIAL_CODE: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
  python: `# Write your code here

def main():
    pass

if __name__ == "__main__":
    main()`,
  javascript: `// Write your code here

function main() {
    
}

main();`,
  typescript: `// Write your code here

function main(): void {
    
}

main();`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
  csharp: `using System;

class Program {
    static void Main() {
        // Write your code here
    }
}`,
  go: `package main

import "fmt"

func main() {
    // Write your code here
}`,
  rust: `fn main() {
    // Write your code here
}`,
  kotlin: `fun main() {
    // Write your code here
}`,
  swift: `import Foundation

// Write your code here`,
};

export const SOLUTION_CODE = "";
